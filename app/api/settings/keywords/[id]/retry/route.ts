import { requireAuth } from "@/lib/auth";
import { inngest } from "@/lib/inngest";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/settings/keywords/[id]/retry
 * Retry categorization for a failed keyword
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await requireAuth();
    const { id } = await params;

    // Fetch the keyword to retry
    const { data: keyword, error: fetchError } = await supabase
      .from("category_keywords")
      .select("id, keyword, category_id, status")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !keyword) {
      return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
    }

    // Update status to 'categorizing' and clear failure_reason
    const { error: updateError } = await supabase
      .from("category_keywords")
      // @ts-expect-error: update payload validated
      .update({
        status: "categorizing",
        failure_reason: null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update keyword status" },
        { status: 500 }
      );
    }

    // Queue the Inngest job
    await inngest.send({
      name: "transactions/categorize-by-keyword",
      data: {
        userId: user.id,
        // @ts-expect-error: keyword.id exists after null check
        keywordId: keyword.id,
        // @ts-expect-error: keyword.keyword exists after null check
        keyword: keyword.keyword,
        // @ts-expect-error: keyword.category_id exists after null check
        categoryId: keyword.category_id,
      },
    });

    logger.info("keyword.retry.job_enqueued", {
      userId: user.id,
      // @ts-expect-error: keyword.id exists after null check
      keywordId: keyword.id,
      // @ts-expect-error: keyword.keyword exists after null check
      keyword: keyword.keyword,
    });

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
