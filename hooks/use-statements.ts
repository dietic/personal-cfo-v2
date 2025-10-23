"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Statement = {
  id: string;
  file_name: string;
  file_type: string | null;
  status: "completed" | "failed" | "processing";
  failure_reason: string | null;
  uploaded_at: string;
  retry_count: number | null;
  cards: { id: string; name: string } | null;
};

export type StatementFilters = {
  search?: string;
  status?: "completed" | "failed" | "processing" | "ALL";
  cardId?: string;
};

export function useStatements() {
  const qc = useQueryClient();

  function useList({
    filters,
    page = 1,
    pageSize = 25,
  }: {
    filters: StatementFilters;
    page?: number;
    pageSize?: number;
  }) {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.cardId) params.set("cardId", filters.cardId);
    if (filters.status && filters.status !== "ALL")
      params.set("status", filters.status);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    return useQuery<
      { success: true; data: Statement[]; total: number } | undefined
    >({
      queryKey: ["statements", Object.fromEntries(params)],
      queryFn: async () => {
        const res = await fetch(`/api/statements?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch statements");
        return res.json();
      },
      // Always refetch fresh data on mount so newly inserted statements appear immediately
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      // While any item in the current page is processing, poll for updates to auto-refresh status
      refetchInterval: (query) => {
        const hasProcessing = (
          query.state.data as
            | { success: true; data: Statement[]; total: number }
            | undefined
        )?.data?.some((s) => s.status === "processing");
        return hasProcessing ? 2000 : false;
      },
    });
  }

  const { mutateAsync: deleteStatement, isPending: isDeletingOne } =
    useMutation({
      mutationFn: async (id: string) => {
        const res = await fetch(`/api/statements/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete statement");
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: ["statements"] }),
    });

  const { mutateAsync: bulkDelete, isPending: isDeletingBulk } = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch(`/api/statements`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to delete statements");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["statements"] }),
  });

  return {
    useList,
    deleteStatement,
    bulkDelete,
    isDeleting: isDeletingOne || isDeletingBulk,
  };
}
