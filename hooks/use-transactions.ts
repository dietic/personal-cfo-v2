"use client";

import type { Filters } from "@/components/transactions/transactions-toolbar";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/lib/validators/transactions";
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
  categories: {
    id: string;
    name: string;
    emoji: string | null;
    color: string | null;
  } | null;
}

type FetchOptions = {
  filters?: Filters;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  signal?: AbortSignal;
};

async function fetchTransactions({
  filters,
  page = 1,
  pageSize = 25,
  sortBy = "transaction_date",
  sortDir = "desc",
  signal,
}: FetchOptions): Promise<{ data: Transaction[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.startDate) params.set("startDate", filters.startDate);
  if (filters?.endDate) params.set("endDate", filters.endDate);
  if (filters?.categoryId) params.set("categoryId", filters.categoryId);
  if (filters?.cardId) params.set("cardId", filters.cardId);
  if (filters?.currency && filters.currency !== "ALL")
    params.set("currency", filters.currency);
  if ((filters as any)?.search) params.set("search", (filters as any).search);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  params.set("sortBy", sortBy);
  params.set("sortDir", sortDir);

  const res = await fetch(`/api/transactions?${params.toString()}`, { signal });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch transactions");
  }
  const data = await res.json();
  return {
    data: data.data as Transaction[],
    total: (data.total as number) ?? 0,
  };
}

async function createTransaction(
  input: CreateTransactionInput
): Promise<Transaction> {
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

async function updateTransaction({
  id,
  ...input
}: UpdateTransactionInput & { id: string }): Promise<Transaction> {
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
  const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete transaction");
  }
}

export function useTransactions() {
  const qc = useQueryClient();
  // Expose a parametrized getter through a wrapper hook
  function useList(options: FetchOptions) {
    const {
      filters,
      page = 1,
      pageSize = 25,
      sortBy = "transaction_date",
      sortDir = "desc",
    } = options;
    const query = useQuery({
      queryKey: ["transactions", { filters, page, pageSize, sortBy, sortDir }],
      queryFn: ({ signal }) => fetchTransactions({ ...options, signal }),
      placeholderData: (prev) => prev,
    });
    return query;
  }

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

  // Bulk delete mutation using API DELETE /api/transactions
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch("/api/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete transactions");
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });

  return {
    // Listing
    useList,
    // CRUD
    createTransaction: createMutation.mutateAsync,
    updateTransaction: updateMutation.mutateAsync,
    deleteTransaction: deleteMutation.mutateAsync,
    bulkDelete: bulkDeleteMutation.mutateAsync,
    // Flags
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending || bulkDeleteMutation.isPending,
  };
}
