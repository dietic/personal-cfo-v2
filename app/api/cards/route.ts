import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { createCardSchema } from "@/lib/validators/cards";
import type { Database } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cards
 * Fetch all cards for the authenticated user
 */
export async function GET() {
  try {
    const { user, supabase } = await requireAuth();

    // Fetch cards with bank information (RLS automatically filters by user_id)
    const { data: cards, error } = await supabase
      .from("cards")
      .select(
        `
        id,
        name,
        due_date,
        created_at,
        bank_id,
        banks (
          id,
          name,
          brand_color,
          logo_url
        )
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching cards:", error);
      return NextResponse.json(
        { error: "Failed to fetch cards", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: cards });
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
 * POST /api/cards
 * Create a new card (with plan entitlement checks)
 */
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth();

    // Parse and validate request body
    const body = await request.json();
    const validation = createCardSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, bank_id, due_date } = validation.data;

    // Get user's plan
    let { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single<{ plan: Database["public"]["Enums"]["plan_type"] }>();

    // Fallback: create a default profile if it does not exist (handles legacy users created before trigger)
    if (!profile) {
      if (!user.email) {
        return NextResponse.json(
          {
            error: "Profile not found",
            message: "Missing email on session to auto-create profile",
          },
          { status: 404 }
        );
      }

      // Bypass RLS to create the profile for the authenticated user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: createProfileError } = await (supabaseAdmin as any)
        .from("profiles")
        // Insert as an array to align with Supabase typings and avoid TS inference pitfalls
        .insert([{ id: user.id, email: user.email }]);

      if (createProfileError) {
        return NextResponse.json(
          {
            error: "Failed to initialize profile",
            details: createProfileError.message,
          },
          { status: 500 }
        );
      }

      // Re-fetch (or assume defaults)
      const { data: createdProfile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single<{ plan: Database["public"]["Enums"]["plan_type"] }>();

      profile =
        createdProfile ??
        ({ plan: "free" } as {
          plan: Database["public"]["Enums"]["plan_type"];
        });
    }

    // Count existing cards
    const { count: existingCards } = await supabase
      .from("cards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Enforce plan limits (free: 1, plus: 5, pro/admin: unlimited)
    const cardLimits: Record<string, number | null> = {
      free: 1,
      plus: 5,
      pro: null, // unlimited
      admin: null, // unlimited
    };

    const limit = cardLimits[profile.plan as keyof typeof cardLimits];
    if (limit !== null && (existingCards ?? 0) >= limit) {
      return NextResponse.json(
        {
          error: "Plan limit reached",
          message: `Your ${profile.plan} plan allows up to ${limit} card${
            limit === 1 ? "" : "s"
          }. Upgrade to add more.`,
          limit,
          current: existingCards,
        },
        { status: 402 }
      );
    }

    // Verify bank exists
    const { data: bank } = await supabase
      .from("banks")
      .select("id")
      .eq("id", bank_id)
      .single();

    if (!bank) {
      return NextResponse.json({ error: "Bank not found" }, { status: 404 });
    }

    // Create the card (RLS ensures user_id is set correctly)
    const { data: card, error: insertError } = await supabase
      .from("cards")
      // @ts-expect-error: Supabase type inference can resolve insert payload to never here.
      // Payload validated by Zod and matches Database public.tables.cards.Insert shape.
      .insert({
        user_id: user.id,
        name,
        bank_id,
        due_date: due_date ?? null,
      })
      .select(
        `
        id,
        name,
        due_date,
        created_at,
        bank_id,
        banks (
          id,
          name,
          brand_color,
          logo_url
        )
      `
      )
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to create card" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: card }, { status: 201 });
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
