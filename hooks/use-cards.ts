"use client";

import { createClient } from "@/lib/supabase-browser";
import type { CreateCardInput, UpdateCardInput } from "@/lib/validators/cards";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Bank {
  id: string;
  name: string;
  brand_color: string | null;
  logo_url: string | null;
}

export interface Card {
  id: string;
  name: string;
  due_date: number | null;
  created_at: string;
  bank_id: string;
  banks: Bank;
}

/**
 * Fetch all cards for the authenticated user
 */
async function fetchCards(): Promise<Card[]> {
  const response = await fetch("/api/cards");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch cards");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Create a new card
 */
async function createCard(input: CreateCardInput): Promise<Card> {
  const response = await fetch("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || "Failed to create card");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Update a card
 */
async function updateCard({
  id,
  ...input
}: UpdateCardInput & { id: string }): Promise<Card> {
  const response = await fetch(`/api/cards/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update card");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Delete a card
 */
async function deleteCard(id: string): Promise<void> {
  const response = await fetch(`/api/cards/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete card");
  }
}

/**
 * React Query hook for cards CRUD operations
 */
export function useCards() {
  const queryClient = useQueryClient();

  // Fetch cards
  const {
    data: cards = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cards"],
    queryFn: fetchCards,
  });

  // Create card mutation
  const createMutation = useMutation({
    mutationFn: createCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });

  // Update card mutation
  const updateMutation = useMutation({
    mutationFn: updateCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });

  // Delete card mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });

  return {
    cards,
    isLoading,
    error: error as Error | null,
    createCard: createMutation.mutateAsync,
    updateCard: updateMutation.mutateAsync,
    deleteCard: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Fetch all banks for the bank selector
 */
async function fetchBanks(): Promise<Bank[]> {
  // Primary: call REST API directly to avoid any client library edge cases
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/banks?select=id,name,brand_color,logo_url&order=name`;
  const headers = {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
  } as const;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    // Fallback: try supabase-js client in case REST had an issue
    const supabase = createClient();
    const { data, error } = await supabase
      .from("banks")
      .select("id, name, brand_color, logo_url")
      .order("name");
    if (error) throw new Error(error.message);
    return (data ?? []) as Bank[];
  }
  const data = (await res.json()) as Bank[];
  return data ?? [];
}

/**
 * React Query hook to fetch banks
 */
export function useBanks() {
  return useQuery({
    queryKey: ["banks"],
    queryFn: fetchBanks,
    staleTime: 10 * 60 * 1000, // 10 minutes - banks rarely change
  });
}
