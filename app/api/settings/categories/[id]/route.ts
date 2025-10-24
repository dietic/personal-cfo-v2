import { requireAuth } from "@/lib/auth";
import { updateCategorySchema } from "@/lib/validators/categories";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/settings/categories/[id]
 * Update a category (user-owned). Preset categories cannot be modified via is_preset.
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await requireAuth();
    const { id } = await props.params;

    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Update only allowed fields
    const updates = parsed.data;

    const { data, error } = await supabase
      .from("categories")
      // @ts-expect-error: update payload is validated
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, name, emoji, color, status, is_preset, created_at")
      .single();

    if (error) {
      if ((error as { code?: string }).code === "PGRST116") {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      const isUnique = (error as { code?: string }).code === "23505";
      return NextResponse.json(
        {
          error: isUnique ? "Duplicate category name" : "Failed to update category",
          details: error.message,
        },
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
 * DELETE /api/settings/categories/[id]
 * Delete a user-created category. Preset categories are protected by RLS and cannot be deleted.
 */
export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await requireAuth();
    const { id } = await props.params;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      if ((error as { code?: string }).code === "PGRST116") {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to delete category", details: error.message },
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
