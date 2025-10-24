import { requireAuth } from "@/lib/auth";
import { inngest } from "@/lib/inngest";
import { reassignKeywordCore } from "@/lib/inngest/functions/reassign-keyword";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const reassignSchema = z.object({
  newCategoryId: z.string().uuid(),
});

/**
 * POST /api/settings/keywords/[id]/reassign
 * Reassign a keyword to a new category and re-categorize matching transactions
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const parsed = reassignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { newCategoryId } = parsed.data;

    // Fetch the keyword to reassign
    const { data: keyword, error: fetchError } = await supabase
      .from("category_keywords")
      .select("id, keyword, category_id, status")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !keyword) {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
    }

    // Verify new category exists and belongs to user
    const { data: newCategory, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", newCategoryId)
      .eq("user_id", user.id)
      .single();

    if (categoryError || !newCategory) {
      return NextResponse.json(
        { error: "Target category not found" },
        { status: 404 }
      );
    }

    // Check if keyword already assigned to this category
    // @ts-expect-error: keyword.category_id exists after null check
    if (keyword.category_id === newCategoryId) {
      return NextResponse.json(
        { error: "Keyword already assigned to this category" },
        { status: 400 }
      );
    }

    // Store old category for the job
    // @ts-expect-error: keyword.category_id exists after null check
    const oldCategoryId = keyword.category_id;

    // Update keyword to new category and set status to 'categorizing'
    const { error: updateError } = await supabase
      .from("category_keywords")
      // @ts-expect-error: update payload validated
      .update({
        category_id: newCategoryId,
        status: "categorizing",
        failure_reason: null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to reassign keyword" },
        { status: 500 }
      );
    }

    // Queue the Inngest job to reassign transactions
    try {
      await inngest.send({
        name: "transactions/reassign-keyword",
        data: {
          userId: user.id,
          // @ts-expect-error: keyword exists after null check
          keywordId: keyword.id,
          // @ts-expect-error: keyword exists after null check
          keyword: keyword.keyword,
          oldCategoryId,
          newCategoryId,
        },
      });

      logger.info("keyword.reassign.job_enqueued", {
        userId: user.id,
        // @ts-expect-error: keyword exists after null check
        keywordId: keyword.id,
        // @ts-expect-error: keyword exists after null check
        keyword: keyword.keyword,
        oldCategoryId,
        newCategoryId,
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
        logger.warn("keyword.reassign.inngest_missing_key_fallback");
        // Fire and forget to keep response snappy; logs will show completion
        void reassignKeywordCore({
          userId: user.id,
          // @ts-expect-error: keyword exists after null check
          keywordId: keyword.id,
          // @ts-expect-error: keyword exists after null check
          keyword: keyword.keyword,
          oldCategoryId,
          newCategoryId,
        }).catch((err) => {
          logger.error("keyword.reassign.inline_processing_failed", {
            error: err.message,
          });
        });
      } else {
        throw err;
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
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
