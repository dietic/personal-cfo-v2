/**
 * Inngest Function: Reassign Keyword to New Category
 *
 * Background job that:
 * 1. Receives keyword text and old/new category IDs
 * 2. Finds all transactions matching the keyword text (regardless of current category)
 * 3. Updates matching transactions to the new category
 * 4. Updates keyword status to 'active' or 'failed'
 *
 * Triggered when a user reassigns a keyword to a different category
 */

import { findMatchingTransactionsForKeyword } from "@/lib/categorization";
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

export type ReassignKeywordInput = {
  userId: string;
  keywordId: string;
  keyword: string;
  oldCategoryId: string;
  newCategoryId: string;
};

export type ReassignKeywordResult = {
  userId: string;
  keywordId: string;
  keyword: string;
  reassignedCount: number;
  status: "active" | "failed";
};

/**
 * Core logic for reassigning a keyword to a new category.
 * Can be called directly (inline) or from Inngest background job.
 */
export async function reassignKeywordCore(
  input: ReassignKeywordInput
): Promise<ReassignKeywordResult> {
  const { userId, keywordId, keyword, oldCategoryId, newCategoryId } = input;

  logger.info("reassign_keyword.start", {
    userId,
    keywordId,
    keyword,
    oldCategoryId,
    newCategoryId,
  });

  try {
    const supabase = getSupabase();

    // Step 1: Fetch all transactions for the user
    const { data: allTransactions, error: fetchError } = await (
      supabase as unknown as {
        from: (table: string) => {
          select: (columns: string) => {
            eq: (
              column: string,
              value: string
            ) => Promise<{
              data: Array<{
                id: string;
                description: string;
                merchant: string | null;
                category_id: string | null;
              }> | null;
              error: Error | null;
            }>;
          };
        };
      }
    )
      .from("transactions")
      .select("id, description, merchant, category_id")
      .eq("user_id", userId);

    if (fetchError) {
      throw new Error(`Failed to fetch transactions: ${fetchError.message}`);
    }

    logger.info("reassign_keyword.fetched_transactions", {
      userId,
      count: allTransactions?.length || 0,
    });

    // Step 2: Find transactions that match the keyword
    const matches = findMatchingTransactionsForKeyword(
      allTransactions || [],
      keyword,
      newCategoryId
    );

    logger.info("reassign_keyword.found_matches", {
      userId,
      keyword,
      matchCount: matches.length,
    });

    // Step 3: Update matching transactions to new category
    let reassignedCount = 0;

    if (matches.length > 0) {
      const CHUNK_SIZE = 100;

      for (let i = 0; i < matches.length; i += CHUNK_SIZE) {
        const chunk = matches.slice(i, i + CHUNK_SIZE);

        for (const match of chunk) {
          const { error } = await (
            supabase as unknown as {
              from: (table: string) => {
                update: (data: Record<string, string>) => {
                  eq: (
                    column: string,
                    value: string
                  ) => {
                    eq: (
                      column: string,
                      value: string
                    ) => Promise<{ error: Error | null }>;
                  };
                };
              };
            }
          )
            .from("transactions")
            .update({ category_id: match.category_id })
            .eq("id", match.id)
            .eq("user_id", userId);

          if (!error) {
            reassignedCount++;
          }
        }

        logger.info("reassign_keyword.chunk_completed", {
          userId,
          chunkStart: i,
          chunkEnd: Math.min(i + CHUNK_SIZE, matches.length),
          updated: reassignedCount,
        });
      }
    } else {
      logger.info("reassign_keyword.no_matches", { userId });
    }

    // Step 4: Update keyword status to 'active' and set categorized_count
    const { error: updateError } = await (
      supabase as unknown as {
        from: (table: string) => {
          update: (data: Record<string, string | number>) => {
            eq: (
              column: string,
              value: string
            ) => Promise<{ error: Error | null }>;
          };
        };
      }
    )
      .from("category_keywords")
      .update({
        status: "active",
        categorized_count: reassignedCount,
      })
      .eq("id", keywordId);

    if (updateError) {
      logger.error("reassign_keyword.failed_to_update_status", {
        userId,
        keywordId,
        error: updateError.message,
      });
    } else {
      logger.info("reassign_keyword.status_updated", {
        userId,
        keywordId,
        reassignedCount,
      });
    }

    logger.info("reassign_keyword.completed", {
      userId,
      keywordId,
      keyword,
      oldCategoryId,
      newCategoryId,
      reassignedCount,
    });

    return {
      userId,
      keywordId,
      keyword,
      reassignedCount,
      status: "active",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error("reassign_keyword.failed", {
      userId,
      keywordId,
      error: errorMessage,
    });

    // Update keyword status to 'failed' with error message
    try {
      const supabase = getSupabase();
      await (
        supabase as unknown as {
          from: (table: string) => {
            update: (data: Record<string, string>) => {
              eq: (
                column: string,
                value: string
              ) => Promise<{ error: Error | null }>;
            };
          };
        }
      )
        .from("category_keywords")
        .update({
          status: "failed",
          failure_reason: errorMessage,
        })
        .eq("id", keywordId);
    } catch (updateError) {
      logger.error("reassign_keyword.failed_to_update_status", {
        userId,
        keywordId,
        updateError:
          updateError instanceof Error
            ? updateError.message
            : String(updateError),
      });
    }

    return {
      userId,
      keywordId,
      keyword,
      reassignedCount: 0,
      status: "failed",
    };
  }
}

/**
 * Inngest background job wrapper.
 * Delegates to reassignKeywordCore for actual processing.
 */
export const reassignKeyword = inngest.createFunction(
  {
    id: "reassign-keyword",
    name: "Reassign Keyword to New Category",
    retries: 2,
  },
  { event: "transactions/reassign-keyword" },
  async ({ event }) => {
    const { userId, keywordId, keyword, oldCategoryId, newCategoryId } =
      event.data;
    return reassignKeywordCore({
      userId,
      keywordId,
      keyword,
      oldCategoryId,
      newCategoryId,
    });
  }
);
