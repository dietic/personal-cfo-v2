import { requireAuth } from "@/lib/auth";
import { inngest } from "@/lib/inngest";
import { categorizeByKeywordCore } from "@/lib/inngest/functions/categorize-by-keyword";
import { logger } from "@/lib/logger";
import {
  createKeywordSchema,
  type CreateKeywordInput,
} from "@/lib/validators/keywords";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/settings/keywords?categoryId=...
 * Returns keywords for a given category (required)
 */
export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await requireAuth();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    if (!categoryId) {
      return NextResponse.json(
        { error: "categoryId is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("category_keywords")
      .select(
        "id, category_id, keyword, status, categorized_count, failure_reason, created_at"
      )
      .eq("user_id", user.id)
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch keywords" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings/keywords
 * Create a new keyword for a category
 */
export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await requireAuth();
    const body = await req.json();
    const parsed = createKeywordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const input: CreateKeywordInput = parsed.data;

    // Verify category exists and belongs to user
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("id", input.category_id)
      .eq("user_id", user.id)
      .single();
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check how many uncategorized transactions exist
    const { count } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("category_id", null);

    // Determine initial status based on whether there are transactions to categorize
    const initialStatus = count && count > 0 ? "categorizing" : "active";

    const { data: keyword, error } = await supabase
      .from("category_keywords")
      // @ts-expect-error: insert payload validated
      .insert({
        user_id: user.id,
        category_id: input.category_id,
        keyword: input.keyword,
        status: initialStatus,
      })
      .select(
        "id, category_id, keyword, status, categorized_count, failure_reason, created_at"
      )
      .single();

    if (error) {
      const isUnique = (error as { code?: string }).code === "23505";
      return NextResponse.json(
        {
          error: isUnique ? "Duplicate keyword" : "Failed to create keyword",
          details: error.message,
        },
        { status: isUnique ? 409 : 500 }
      );
    }

    if (!keyword) {
      return NextResponse.json(
        { error: "Failed to create keyword" },
        { status: 500 }
      );
    }

    // If there are uncategorized transactions, queue background job
    if (count && count > 0 && keyword) {
      try {
        await inngest.send({
          name: "transactions/categorize-by-keyword",
          data: {
            userId: user.id,
            // @ts-expect-error: keyword.id exists after null check
            keywordId: keyword.id, // Pass keyword ID for status updates
            keyword: input.keyword,
            categoryId: input.category_id,
          },
        });

        logger.info("keyword.creation.job_enqueued", {
          userId: user.id,
          // @ts-expect-error: keyword.id exists after null check
          keywordId: keyword.id,
          keyword: input.keyword,
          categoryId: input.category_id,
          uncategorizedCount: count,
        });
      } catch (e: unknown) {
        const err = e as Error;
        const msg = err.message || "";

        // Dev fallback: If Inngest isn't configured locally, process inline to keep flow unblocked
        if (
          msg.includes("Inngest API Error") ||
          msg.includes("401") ||
          msg.includes("Event key")
        ) {
          logger.warn("keyword.creation.inngest_missing_key_fallback");
          // Fire and forget to keep response snappy; logs will show completion
          void categorizeByKeywordCore({
            userId: user.id,
            // @ts-expect-error: keyword.id exists after null check
            keywordId: keyword.id,
            keyword: input.keyword,
            categoryId: input.category_id,
          }).catch((err) => {
            logger.error("keyword.creation.inline_processing_failed", {
              error: err.message,
            });
          });
        } else {
          throw err;
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: keyword,
        categorizedCount: 0, // Background job will handle categorization
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
