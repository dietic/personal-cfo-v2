import { requireAuth } from "@/lib/auth";
import { updateTransactionSchema } from "@/lib/validators/transactions";
import type { Database } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/transactions/[id]
 * Update a transaction
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await requireAuth();
    const { id } = await props.params;

    const body = await request.json();
    const parsed = updateTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updates = parsed.data as Partial<Database["public"]["Tables"]["transactions"]["Update"]>;

    // If provided, verify ownership of card and category
    if (updates.card_id) {
      const { data: card } = await supabase
        .from("cards")
        .select("id")
        .eq("id", updates.card_id)
        .eq("user_id", user.id)
        .single();
      if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (updates.category_id) {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("id", updates.category_id)
        .eq("user_id", user.id)
        .single();
      if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Handle amount + type -> amount_cents mapping if client sent an amount
    // We allow either { amount }+{ type }+optional currency, or direct DB fields
    type MaybeAmount = { amount?: number; type?: "income" | "expense" };
    const maybe = body as MaybeAmount;
    if (typeof maybe.amount === "number" && (maybe.type === "income" || maybe.type === "expense")) {
      const amount_cents = Math.round(Math.abs(maybe.amount) * 100) * (maybe.type === "expense" ? -1 : 1);
  (updates as Database["public"]["Tables"]["transactions"]["Update"]).amount_cents = amount_cents as unknown as number;
    }

    // Update (RLS ensures row belongs to user via user_id filter)
    const { data, error } = await supabase
      .from("transactions")
      // @ts-expect-error: Zod validated; matches Database schema
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select(
        `id, description, merchant, transaction_date, currency, amount_cents, type, created_at,
         cards:card_id(id, name),
         categories:category_id(id, name, emoji, color)`
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
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
 * DELETE /api/transactions/[id]
 */
export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await requireAuth();
    const { id } = await props.params;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
