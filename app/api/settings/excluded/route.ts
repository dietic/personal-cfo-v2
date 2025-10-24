import { requireAuth } from "@/lib/auth";
import {
  bulkCreateExcludedSchema,
  createExcludedKeywordSchema,
  type BulkCreateExcludedInput,
} from "@/lib/validators/excluded";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/settings/excluded
 * Returns all excluded keywords for the user
 */
export async function GET() {
  try {
    const { user, supabase } = await requireAuth();
    const { data, error } = await supabase
      .from("excluded_keywords")
      .select("id, keyword, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch excluded keywords" },
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
 * POST /api/settings/excluded
 * Create one or many excluded keywords
 */
export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await requireAuth();
    const body = await req.json();

    // Support either { keyword } or { keywords: [] }
    let inputs: string[] = [];
    const single = createExcludedKeywordSchema.safeParse(body);
    if (single.success) {
      inputs = [single.data.keyword];
    } else {
      const bulk = bulkCreateExcludedSchema.safeParse(body);
      if (!bulk.success) {
        return NextResponse.json(
          { error: "Validation failed", details: bulk.error.flatten() },
          { status: 400 }
        );
      }
      const payload: BulkCreateExcludedInput = bulk.data;
      inputs = payload.keywords;
    }

    // Deduplicate and trim
    const values = Array.from(
      new Set(inputs.map((k) => k.trim()).filter((k) => k.length > 0))
    );
    if (values.length === 0) {
      return NextResponse.json(
        { error: "No valid keywords provided" },
        { status: 400 }
      );
    }

    const rows = values.map((k) => ({ user_id: user.id, keyword: k }));
    const { data, error } = await supabase
      .from("excluded_keywords")
      // @ts-expect-error: validated payload
      .insert(rows)
      .select("id, keyword, created_at");

    if (error) {
      // Some inserts may fail on unique constraint; we can surface a partial success
      const isUnique = (error as { code?: string }).code === "23505";
      return NextResponse.json(
        {
          error: isUnique
            ? "Some keywords already exist"
            : "Failed to create excluded keywords",
          details: error.message,
        },
        { status: isUnique ? 409 : 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: data ?? [] },
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
