import { requireAuth } from "@/lib/auth";
import { canCreateCategory, type Plan } from "@/lib/plan";
import {
  createCategorySchema,
  type CreateCategoryInput,
} from "@/lib/validators/categories";
import type { Database } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/settings/categories
 * Returns all categories for the authenticated user
 */
export async function GET() {
  try {
    const { user, supabase } = await requireAuth();

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, emoji, color, status, is_preset, created_at")
      .eq("user_id", user.id)
      .order("is_preset", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch categories" },
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
 * POST /api/settings/categories
 * Create a new user category with plan checks
 */
export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await requireAuth();
    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const input: CreateCategoryInput = parsed.data;

    // Get plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single<{ plan: Database["public"]["Enums"]["plan_type"] }>();
    const plan = profile?.plan ?? "free";

    // Count existing user categories (exclude presets)
    const { count } = await supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_preset", false);

    if (!canCreateCategory(plan as Plan, count ?? 0)) {
      return NextResponse.json(
        {
          error: "Plan limit reached",
          message:
            plan === "free"
              ? "Free plan allows preset categories only. Upgrade to add custom categories."
              : "You've reached your category limit. Upgrade to add more.",
        },
        { status: 402 }
      );
    }

    const { data: created, error: insertError } = await supabase
      .from("categories")
      // @ts-expect-error Supabase typing quirk for Insert
      .insert({
        user_id: user.id,
        name: input.name,
        emoji: input.emoji ?? null,
        color: input.color ?? null,
        is_preset: false,
      })
      .select("id, name, emoji, color, status, is_preset, created_at")
      .single();

    if (insertError) {
      const isUnique = (insertError as { code?: string }).code === "23505";
      return NextResponse.json(
        {
          error: isUnique ? "Duplicate category name" : "Failed to create category",
          details: insertError.message,
        },
        { status: isUnique ? 409 : 500 }
      );
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
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
 
