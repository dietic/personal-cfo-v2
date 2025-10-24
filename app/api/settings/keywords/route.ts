import { requireAuth } from "@/lib/auth";
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
      .select("id, category_id, keyword, created_at")
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

    const { data, error } = await supabase
      .from("category_keywords")
      // @ts-expect-error: insert payload validated
      .insert({
        user_id: user.id,
        category_id: input.category_id,
        keyword: input.keyword,
      })
      .select("id, category_id, keyword, created_at")
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

    return NextResponse.json({ success: true, data }, { status: 201 });
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
