/**
 * Inngest Function: Process Statement PDF
 *
 * Background job that:
 * 1. Receives pre-extracted text from PDF (PDF already deleted)
 * 2. Sends text to AI for transaction extraction
 * 3. Inserts transactions into database
 * 4. Updates statement status
 */

import { extractTransactionsWithAI } from "@/lib/ai/parse-statement";
import { categorizeTransaction } from "@/lib/categorization";
import { inngest } from "@/lib/inngest";
import { logger } from "@/lib/logger";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

// Lazy initialization to avoid build-time errors
let _supabase: SupabaseClient<Database> | null = null;

function getSupabase(): SupabaseClient<Database> {
  if (_supabase) {
    return _supabase;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  _supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
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

// Core logic extracted for optional direct invocation (dev fallback)
export async function processStatementCore(
  input: ProcessStatementInput
): Promise<ProcessStatementResult> {
  const { statementId, userId, cardId, extractedText } = input;

  logger.info("inngest.process_statement.start", {
    statementId,
    textLen: extractedText.length,
  });

  // 1) AI extraction
  // Extract with AI, then normalize all amounts to negative to ensure expenses
  const transactionsRaw = await extractTransactionsWithAI(extractedText);
  const transactions = transactionsRaw.map((t) => ({
    ...t,
    amount: -Math.abs(t.amount),
  }));

  // 2) Validate statement exists
  {
    const supabase = getSupabase();
    const { error } = await (
      supabase as unknown as {
        from: (table: string) => {
          select: (columns: string) => {
            eq: (
              column: string,
              value: string
            ) => {
              single: () => Promise<{
                error: Error | null;
              }>;
            };
          };
        };
      }
    )
      .from("statements")
      .select("card_id, user_id")
      .eq("id", statementId)
      .single();

    if (error) {
      throw new Error(`Statement ${statementId} not found`);
    }
  }

  // 3) Fetch user's category keywords for auto-categorization
  const keywords: Array<{ category_id: string; keyword: string }> = [];
  {
    const supabase = getSupabase();
    const { data } = await (
      supabase as unknown as {
        from: (table: string) => {
          select: (columns: string) => {
            eq: (
              column: string,
              value: string
            ) => {
              order: (
                column: string,
                options: { ascending: boolean }
              ) => Promise<{
                data: Array<{ category_id: string; keyword: string }> | null;
              }>;
            };
          };
        };
      }
    )
      .from("category_keywords")
      .select("category_id, keyword")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }); // First created = first priority

    if (data) {
      keywords.push(...data);
    }
  }

  // 4) Categorize and insert transactions
  const transactionsToInsert = transactions.map((txn) => {
    const transactionDate = new Date(txn.date);

    // Auto-categorize based on keywords
    const category_id = categorizeTransaction(
      { description: txn.description, merchant: txn.merchant },
      keywords
    );

    return {
      user_id: userId,
      statement_id: statementId,
      card_id: cardId,
      merchant: txn.merchant,
      description: txn.description,
      transaction_date: transactionDate.toISOString().split("T")[0],
      amount_cents: -Math.abs(Math.round(txn.amount * 100)),
      currency: txn.currency,
      type: "expense" as const,
      category_id, // ← Auto-assigned via categorization engine!
    };
  });

  {
    const supabase = getSupabase();
    const { error: txnError } = await (
      supabase as unknown as {
        from: (table: string) => {
          insert: (data: unknown) => Promise<{ error: Error | null }>;
        };
      }
    )
      .from("transactions")
      .insert(transactionsToInsert);

    if (txnError) {
      throw new Error(`Failed to insert transactions: ${txnError.message}`);
    }
  }

  // Log categorization stats
  const categorizedCount = transactionsToInsert.filter(
    (t) => t.category_id !== null
  ).length;
  logger.info("inngest.process_statement.categorization_stats", {
    statementId,
    total: transactionsToInsert.length,
    categorized: categorizedCount,
    uncategorized: transactionsToInsert.length - categorizedCount,
  });

  // 5) Mark statement as completed
  {
    const supabase = getSupabase();
    await (
      supabase as unknown as {
        from: (table: string) => {
          update: (data: Record<string, unknown>) => {
            eq: (column: string, value: string) => Promise<unknown>;
          };
        };
      }
    )
      .from("statements")
      .update({ status: "completed", failure_reason: null })
      .eq("id", statementId);
  }

  const transactionCount = transactionsToInsert.length;
  logger.info("inngest.process_statement.completed", {
    statementId,
    transactionCount,
  });

  return { statementId, transactionCount, status: "completed" };
}

export const processStatement = inngest.createFunction(
  {
    id: "process-statement",
    name: "Process Statement with AI",
    retries: 2, // Retry up to 2 times on failure
  },
  { event: "statement/process" },
  async ({ event, step }) => {
    const { statementId, userId, cardId, extractedText } = event.data;
    logger.info("inngest.function.start", {
      statementId,
      textLen: extractedText.length,
    });

    // Step 1: Send extracted text to AI for transaction parsing
    const transactions = await step.run("ai-extract-transactions", async () => {
      // quiet info; structured logs kept minimal

      try {
        const raw = await extractTransactionsWithAI(extractedText);
        // Normalize to negative amounts (expenses)
        return raw.map((t) => ({ ...t, amount: -Math.abs(t.amount) }));
      } catch (error: unknown) {
        const err = error as Error;
        logger.error("inngest.function.ai_error", { error: err.message });
        throw new Error(`AI extraction failed: ${err.message}`);
      }
    });

    // Step 2: Validate statement and card exist
    await step.run("validate-statement", async () => {
      const supabase = getSupabase();
      const { error } = await (
        supabase as unknown as {
          from: (table: string) => {
            select: (columns: string) => {
              eq: (
                column: string,
                value: string
              ) => {
                single: () => Promise<{
                  error: Error | null;
                }>;
              };
            };
          };
        }
      )
        .from("statements")
        .select("card_id, user_id")
        .eq("id", statementId)
        .single();

      if (error) {
        throw new Error(`Statement ${statementId} not found`);
      }
    });

    // Step 3: Fetch category keywords for auto-categorization
    const keywords = await step.run("fetch-keywords", async () => {
      const supabase = getSupabase();
      const { data } = await (
        supabase as unknown as {
          from: (table: string) => {
            select: (columns: string) => {
              eq: (
                column: string,
                value: string
              ) => {
                order: (
                  column: string,
                  options: { ascending: boolean }
                ) => Promise<{
                  data: Array<{ category_id: string; keyword: string }> | null;
                }>;
              };
            };
          };
        }
      )
        .from("category_keywords")
        .select("category_id, keyword")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }); // First created = first priority

      return (data || []) as Array<{ category_id: string; keyword: string }>;
    });

    // Step 4: Categorize and insert transactions
    const { transactionCount, categorizedCount } = await step.run(
      "categorize-and-insert-transactions",
      async () => {
        const transactionsToInsert = transactions.map((txn) => {
          const transactionDate = new Date(txn.date);

          // Auto-categorize based on keywords
          const category_id = categorizeTransaction(
            { description: txn.description, merchant: txn.merchant },
            keywords
          );

          return {
            user_id: userId,
            statement_id: statementId,
            card_id: cardId,
            merchant: txn.merchant,
            description: txn.description,
            transaction_date: transactionDate.toISOString().split("T")[0], // YYYY-MM-DD
            amount_cents: -Math.abs(Math.round(txn.amount * 100)), // Convert to cents as negative (expense)
            currency: txn.currency,
            type: "expense" as const,
            category_id, // ← Auto-assigned via categorization engine!
          };
        });

        const supabase = getSupabase();
        const { error: txnError } = await (
          supabase as unknown as {
            from: (table: string) => {
              insert: (data: unknown) => Promise<{ error: Error | null }>;
            };
          }
        )
          .from("transactions")
          .insert(transactionsToInsert);

        if (txnError) {
          throw new Error(`Failed to insert transactions: ${txnError.message}`);
        }

        const categorizedCount = transactionsToInsert.filter(
          (t) => t.category_id !== null
        ).length;

        logger.info("inngest.function.categorization_stats", {
          statementId,
          total: transactionsToInsert.length,
          categorized: categorizedCount,
          uncategorized: transactionsToInsert.length - categorizedCount,
        });

        return {
          transactionCount: transactionsToInsert.length,
          categorizedCount,
        };
      }
    );

    // Step 5: Mark statement as completed
    await step.run("mark-completed", async () => {
      const supabase = getSupabase();
      await (
        supabase as unknown as {
          from: (table: string) => {
            update: (data: Record<string, unknown>) => {
              eq: (column: string, value: string) => Promise<unknown>;
            };
          };
        }
      )
        .from("statements")
        .update({
          status: "completed",
          failure_reason: null,
        })
        .eq("id", statementId);

      logger.info("inngest.function.completed", {
        statementId,
        transactionCount,
        categorizedCount,
      });
    });

    return {
      statementId,
      transactionCount,
      categorizedCount,
      status: "completed" as const,
    };
  }
);
