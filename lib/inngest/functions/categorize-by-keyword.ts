/**
 * Inngest Function: Categorize Uncategorized Transactions by Keyword
 *
 * Background job that:
 * 1. Receives a new keyword and category ID
 * 2. Fetches all uncategorized transactions for the user
 * 3. Finds transactions matching the keyword
 * 4. Updates matching transactions with the category
 *
 * Triggered when a user creates a keyword and there are >500 uncategorized transactions
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

export type CategorizeByKeywordInput = {
  userId: string;
  keywordId: string;
  keyword: string;
  categoryId: string;
};

export type CategorizeByKeywordResult = {
  userId: string;
  keywordId: string;
  keyword: string;
  categorizedCount: number;
  status: "active" | "failed";
};

/**
 * Core logic for categorizing transactions by keyword.
 * Can be called directly (inline) or from Inngest background job.
 */
export async function categorizeByKeywordCore(
  input: CategorizeByKeywordInput
): Promise<CategorizeByKeywordResult> {
  const { userId, keywordId, keyword, categoryId } = input;

  logger.info("categorize_by_keyword.start", {
    userId,
    keywordId,
    keyword,
    categoryId,
  });

  try {
    const supabase = getSupabase();

    // Step 1: Fetch all uncategorized transactions
    const { data: uncategorizedTxns, error: fetchError } = await (
      supabase as unknown as {
        from: (table: string) => {
          select: (columns: string) => {
            eq: (
              column: string,
              value: string
            ) => {
              is: (
                column: string,
                value: null
              ) => Promise<{
                data: Array<{
                  id: string;
                  description: string;
                  merchant: string | null;
                }> | null;
                error: Error | null;
              }>;
            };
          };
        };
      }
    )
      .from("transactions")
      .select("id, description, merchant")
      .eq("user_id", userId)
      .is("category_id", null);

    if (fetchError) {
      throw new Error(`Failed to fetch transactions: ${fetchError.message}`);
    }

    logger.info("categorize_by_keyword.fetched_transactions", {
      userId,
      count: uncategorizedTxns?.length || 0,
    });

    // Step 2: Find matches for this keyword
    const matches = findMatchingTransactionsForKeyword(
      uncategorizedTxns || [],
      keyword,
      categoryId
    );

    logger.info("categorize_by_keyword.found_matches", {
      userId,
      keyword,
      matchCount: matches.length,
    });

    // Step 3: Update transactions in chunks
    let categorizedCount = 0;

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
            categorizedCount++;
          }
        }

        logger.info("categorize_by_keyword.chunk_completed", {
          userId,
          chunkStart: i,
          chunkEnd: Math.min(i + CHUNK_SIZE, matches.length),
          updated: categorizedCount,
        });
      }
    } else {
      logger.info("categorize_by_keyword.no_matches", { userId });
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
        categorized_count: categorizedCount,
      })
      .eq("id", keywordId);

    if (updateError) {
      logger.error("categorize_by_keyword.failed_to_update_status", {
        userId,
        keywordId,
        error: updateError.message,
      });
    } else {
      logger.info("categorize_by_keyword.status_updated", {
        userId,
        keywordId,
        categorizedCount,
      });
    }

    logger.info("categorize_by_keyword.completed", {
      userId,
      keywordId,
      keyword,
      categoryId,
      categorizedCount,
    });

    return {
      userId,
      keywordId,
      keyword,
      categorizedCount,
      status: "active",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error("categorize_by_keyword.failed", {
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
      logger.error("categorize_by_keyword.failed_to_update_status", {
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
      categorizedCount: 0,
      status: "failed",
    };
  }
}

/**
 * Inngest background job wrapper.
 * Delegates to categorizeByKeywordCore for actual processing.
 */
export const categorizeByKeyword = inngest.createFunction(
  {
    id: "categorize-by-keyword",
    name: "Categorize Uncategorized Transactions by Keyword",
    retries: 2,
  },
  { event: "transactions/categorize-by-keyword" },
  async ({ event }) => {
    const { userId, keywordId, keyword, categoryId } = event.data;
    return categorizeByKeywordCore({ userId, keywordId, keyword, categoryId });
  }
);
