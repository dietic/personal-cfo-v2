import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

/**
 * GET /api/settings/categories
 * Returns user's active categories; ensures profile exists (trigger seeds defaults)
 */
export async function GET() {
  try {
    const { user, supabase } = await requireAuth();

    // Fetch categories first
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name, emoji, color, status")
      .eq("status", "active")
      .order("name");

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      );
    }

    if (categories && categories.length > 0) {
      return NextResponse.json({ success: true, data: categories });
    }

    // If none, ensure profile exists (this will trigger default categories via DB trigger)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      if (!user.email) {
        return NextResponse.json(
          {
            error:
              "Profile not found and missing email on session to create it",
          },
          { status: 404 }
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: createProfileError } = await (supabaseAdmin as any)
        .from("profiles")
        .insert([{ id: user.id, email: user.email }]);
      if (createProfileError) {
        return NextResponse.json(
          {
            error: "Failed to create profile",
            details: createProfileError.message,
          },
          { status: 500 }
        );
      }
    }

    // Re-fetch categories after profile creation to get seeded defaults
    const { data: seeded, error: refetchError } = await supabase
      .from("categories")
      .select("id, name, emoji, color, status")
      .eq("status", "active")
      .order("name");

    if (refetchError) {
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: seeded ?? [] });
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
