import { requireAuth } from "@/lib/auth";
import { updateKeywordSchema } from "@/lib/validators/keywords";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/settings/keywords/[id]
 * Update a keyword text
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await requireAuth();
    const { id } = await props.params;
    const body = await request.json();
    const parsed = updateKeywordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("category_keywords")
      // @ts-expect-error: validated
      .update({ keyword: parsed.data.keyword })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, category_id, keyword, created_at")
      .single();

    if (error) {
      if ((error as { code?: string }).code === "PGRST116") {
        return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
      }
      const isUnique = (error as { code?: string }).code === "23505";
      return NextResponse.json(
        { error: isUnique ? "Duplicate keyword" : "Failed to update keyword", details: error.message },
        { status: isUnique ? 409 : 500 }
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
 * DELETE /api/settings/keywords/[id]
 */
export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await requireAuth();
    const { id } = await props.params;

    const { error } = await supabase
      .from("category_keywords")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      if ((error as { code?: string }).code === "PGRST116") {
        return NextResponse.json({ error: "Keyword not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to delete keyword", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
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
