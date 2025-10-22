"use client";

import type { CreateTransactionInput, UpdateTransactionInput } from "@/lib/validators/transactions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Transaction {
  id: string;
  description: string;
  merchant: string | null;
  transaction_date: string; // YYYY-MM-DD
  currency: string; // ISO 4217
  amount_cents: number; // negative for expenses
  type: "income" | "expense";
  created_at: string;
  cards: { id: string; name: string };
  categories: { id: string; name: string; emoji: string | null; color: string | null } | null;
}

async function fetchTransactions(): Promise<Transaction[]> {
  const res = await fetch("/api/transactions");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch transactions");
  }
  const data = await res.json();
  return data.data as Transaction[];
}

async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || "Failed to create transaction");
  }
  const data = await res.json();
  return data.data as Transaction;
}

async function updateTransaction({ id, ...input }: UpdateTransactionInput & { id: string }): Promise<Transaction> {
  const res = await fetch(`/api/transactions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update transaction");
  }
  const data = await res.json();
  return data.data as Transaction;
}

async function deleteTransaction(id: string): Promise<void> {
  const res = await fetch(`/api/transactions/${id}` , { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete transaction");
  }
}

export function useTransactions() {
  const qc = useQueryClient();
  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({ queryKey: ["transactions"], queryFn: fetchTransactions });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const updateMutation = useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });

  return {
    transactions,
    isLoading,
    error: error as Error | null,
    createTransaction: createMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
