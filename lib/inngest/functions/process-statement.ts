/**
 * Inngest Function: Process Statement PDF
 *
 * Background job that:
 * 1. Receives pre-extracted text from PDF (PDF already deleted)
 * 2. Sends text to AI for transaction extraction
 * 3. Inserts transactions into database
 * 4. Updates statement status (frontend observes via Realtime)
 */

import {
  extractTransactionsWithAI,
  ParsedTransaction,
} from "@/lib/ai/parse-statement";
import { categorizeTransaction } from "@/lib/categorization";
import { inngest } from "@/lib/inngest";
import { logger } from "@/lib/logger";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

type TxInsertPayload = Database["public"]["Tables"]["transactions"]["Insert"][];
type InsertResult = Promise<{ error: { message: string } | null }>;
type UpdateResult = Promise<{ error: Error | null }>;
type TxInsertClient = {
  from: (table: "transactions") => {
    insert: (values: TxInsertPayload) => InsertResult;
  };
};
type StatementsUpdateClient = {
  from: (table: "statements") => {
    update: (
      values: Partial<Database["public"]["Tables"]["statements"]["Update"]>
    ) => { eq: (col: "id", val: string) => UpdateResult };
  };
};

// Lazy initialization to avoid build-time errors
let _supabase: SupabaseClient<Database> | null = null;

function getSupabase(): SupabaseClient<Database> {
  if (_supabase) return _supabase;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }
  _supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _supabase;
}

export type ProcessStatementInput = {
  statementId: string;
  userId: string;
  cardId: string;
  fileName: string;
  extractedText: string;
};

export type ProcessStatementResult = {
  statementId: string;
  transactionCount: number;
  status: "completed" | "failed";
};

// Core logic (kept for potential inline fallback)
export async function processStatementCore(
  input: ProcessStatementInput
): Promise<ProcessStatementResult> {
  const { statementId, userId, cardId, extractedText } = input;
  const raw = await extractTransactionsWithAI(extractedText);
  const transactions = raw.map((t) => ({ ...t, amount: -Math.abs(t.amount) }));

  const supabase = getSupabase();
  // Ensure statement exists
  const { error: existsError } = await supabase
    .from("statements")
    .select("id")
    .eq("id", statementId)
    .single();
  if (existsError) throw new Error(`Statement ${statementId} not found`);

  const txToInsert: Database["public"]["Tables"]["transactions"]["Insert"][] =
    transactions.map((txn: ParsedTransaction) => ({
      user_id: userId,
      statement_id: statementId,
      card_id: cardId,
      merchant: txn.merchant,
      description: txn.description,
      transaction_date: new Date(txn.date).toISOString().split("T")[0],
      amount_cents: -Math.abs(Math.round(txn.amount * 100)),
      currency: txn.currency,
      type: "expense",
      category_id: null,
    }));

  const { error: insError } = await (supabase as unknown as TxInsertClient)
    .from("transactions")
    .insert(txToInsert);
  if (insError)
    throw new Error(`Failed to insert transactions: ${insError.message}`);

  await (supabase as unknown as StatementsUpdateClient)
    .from("statements")
    .update({ status: "completed", failure_reason: null })
    .eq("id", statementId);

  return {
    statementId,
    transactionCount: txToInsert.length,
    status: "completed",
  };
}

// Inngest background function (DB updates trigger Realtime on frontend)
export const processStatement = inngest.createFunction(
  { id: "process-statement", name: "Process Statement with AI", retries: 2 },
  { event: "statement/process" },
  async ({ event, step }) => {
    const { statementId, userId, cardId, extractedText } =
      event.data as ProcessStatementInput;
    logger.info("inngest.function.start", {
      statementId,
      textLen: extractedText.length,
    });

    try {
      const transactions = await step.run(
        "ai-extract-transactions",
        async () => {
          const raw = await extractTransactionsWithAI(extractedText);
          return raw.map((t) => ({ ...t, amount: -Math.abs(t.amount) }));
        }
      );

      await step.run("validate-statement", async () => {
        const supabase = getSupabase();
        const { error } = await supabase
          .from("statements")
          .select("id")
          .eq("id", statementId)
          .single();
        if (error) throw new Error(`Statement ${statementId} not found`);
      });

      const keywords = await step.run("fetch-keywords", async () => {
        const supabase = getSupabase();
        const { data } = await supabase
          .from("category_keywords")
          .select("category_id, keyword")
          .eq("user_id", userId)
          .order("created_at", { ascending: true });
        return (data || []) as Array<{ category_id: string; keyword: string }>;
      });

      const { transactionCount, categorizedCount } = await step.run(
        "categorize-and-insert-transactions",
        async () => {
          const supabase = getSupabase();

          const txToInsert: Database["public"]["Tables"]["transactions"]["Insert"][] =
            transactions.map((txn) => {
              const categoryId = categorizeTransaction(
                { description: txn.description, merchant: txn.merchant },
                keywords
              );
              return {
                user_id: userId,
                statement_id: statementId,
                card_id: cardId,
                merchant: txn.merchant,
                description: txn.description,
                transaction_date: new Date(txn.date)
                  .toISOString()
                  .split("T")[0],
                amount_cents: -Math.abs(Math.round(txn.amount * 100)),
                currency: txn.currency,
                type: "expense",
                category_id: categoryId,
              } satisfies Database["public"]["Tables"]["transactions"]["Insert"];
            });

          const { error: insErr } = await (
            supabase as unknown as TxInsertClient
          )
            .from("transactions")
            .insert(txToInsert);
          if (insErr)
            throw new Error(`Failed to insert transactions: ${insErr.message}`);

          const categorizedCount = txToInsert.filter(
            (t) => t.category_id !== null
          ).length;
          return { transactionCount: txToInsert.length, categorizedCount };
        }
      );

      await step.run("mark-completed", async () => {
        const supabase = getSupabase();
        await (supabase as unknown as StatementsUpdateClient)
          .from("statements")
          .update({ status: "completed", failure_reason: null })
          .eq("id", statementId);
      });

      return {
        statementId,
        transactionCount,
        categorizedCount,
        status: "completed" as const,
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      logger.error("inngest.process_statement.failed", { statementId, reason });

      await step.run("mark-failed", async () => {
        const supabase = getSupabase();
        await (supabase as unknown as StatementsUpdateClient)
          .from("statements")
          .update({ status: "failed", failure_reason: reason })
          .eq("id", statementId);
      });
      throw error; // allow retry policy
    }
  }
);
