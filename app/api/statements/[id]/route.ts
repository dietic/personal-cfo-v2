import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/statements/[id]
 */
export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await requireAuth();
    const { id } = await props.params;

    const { error } = await supabase
      .from("statements")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Statement not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to delete statement" },
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
