import { requireAuth } from "@/lib/auth";
import { createTransactionSchema } from "@/lib/validators/transactions";
import type { Database } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/transactions
 * Returns the user's recent transactions with card and category info
 */
export async function GET() {
  try {
    const { user, supabase } = await requireAuth();

    const { data, error } = await supabase
      .from("transactions")
      .select(
        `id, description, merchant, transaction_date, currency, amount_cents, type, created_at,
         cards:card_id(id, name),
         categories:category_id(id, name, emoji, color)`
      )
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Supabase error fetching transactions:", error);
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/transactions
 * Create a manual transaction; converts amount -> amount_cents and enforces ownership of card/category
 */
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth();

    const body = await request.json();
    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { amount, type, card_id, category_id, currency, description, merchant, transaction_date } = parsed.data;

    // Verify card belongs to user
    const { data: card } = await supabase
      .from("cards")
      .select("id")
      .eq("id", card_id)
      .eq("user_id", user.id)
      .single();
    if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });

    // If category provided, verify it belongs to user
    if (category_id) {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("id", category_id)
        .eq("user_id", user.id)
        .single();
      if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const amount_cents = Math.round(Math.abs(amount) * 100) * (type === "expense" ? -1 : 1);

    const insertPayload: Database["public"]["Tables"]["transactions"]["Insert"] = {
      user_id: user.id,
      card_id,
      description,
      merchant: merchant ?? null,
      transaction_date,
      category_id: category_id ?? null,
      currency,
      amount_cents,
      type,
    };

    const { data: created, error: insertError } = await supabase
      .from("transactions")
      // @ts-expect-error: Supabase type inference can resolve insert payload to never here.
      // Payload validated by Zod and matches Database public.tables.transactions.Insert shape.
      .insert(insertPayload)
      .select(
        `id, description, merchant, transaction_date, currency, amount_cents, type, created_at,
         cards:card_id(id, name),
         categories:category_id(id, name, emoji, color)`
      )
      .single();

    if (insertError) {
      return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
