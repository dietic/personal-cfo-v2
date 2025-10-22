import { requireAuth } from "@/lib/auth";
import { updateCardSchema } from "@/lib/validators/cards";
import type { Database } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/cards/[id]
 * Update a card
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await requireAuth();
    const { id } = await props.params;

    // Parse and validate request body
    const body = await request.json();
    const validation = updateCardSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updates: Database["public"]["Tables"]["cards"]["Update"] =
      validation.data;

    // If updating bank_id, verify bank exists
    if (updates.bank_id) {
      const { data: bank } = await supabase
        .from("banks")
        .select("id")
        .eq("id", updates.bank_id)
        .single();

      if (!bank) {
        return NextResponse.json({ error: "Bank not found" }, { status: 404 });
      }
    }

    // Update the card (RLS ensures only user's own cards can be updated)
    const { data: card, error: updateError } = await supabase
      .from("cards")
      // @ts-expect-error: Supabase type inference can resolve update payload to never here.
      // The payload is validated with Zod (updateCardSchema) and matches Database public.tables.cards.Update.
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
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

    if (updateError) {
      if (updateError.code === "PGRST116") {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to update card" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: card });
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
 * DELETE /api/cards/[id]
 * Delete a card (cascades to statements and transactions)
 */
export async function DELETE(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await requireAuth();
    const { id } = await props.params;

    // Delete the card (RLS ensures only user's own cards can be deleted)
    // Cascade deletion of statements and transactions is handled by DB constraints
    const { error: deleteError } = await supabase
      .from("cards")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      if (deleteError.code === "PGRST116") {
        return NextResponse.json({ error: "Card not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to delete card" },
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
