"use client";

import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase-browser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

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
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

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

    const notifiedRef = useRef<Set<string>>(new Set());

    const query = useQuery<
      { success: true; data: Statement[]; total: number } | undefined
    >({
      queryKey: ["statements", Object.fromEntries(params)],
      queryFn: async () => {
        const res = await fetch(`/api/statements?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch statements");
        return res.json();
      },
      // One-time fetch on mount; no periodic polling
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    });

    // Conditional polling: every 10s only if there are processing statements in the current list
    useEffect(() => {
      const hasProcessing = query.data?.data?.some(
        (s) => s.status === "processing"
      );
      if (!hasProcessing) return;
      const id = setInterval(() => {
        query.refetch();
      }, 10_000);
      return () => clearInterval(id);
      // Intentionally depend on query.data to toggle polling as status changes
    }, [query.data, query.refetch]);

    // Realtime updates via Supabase instead of polling
    useEffect(() => {
      // Need user id for RLS-safe filtering
      if (!user?.id) return;

      const channel = supabase
        .channel(`statements-updates-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "statements",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // payload.new and payload.old are row snapshots
            type Status = "completed" | "failed" | "processing";
            type Row = {
              id: string;
              user_id: string;
              file_name: string;
              status: Status;
              failure_reason: string | null;
            };

            const newRow = payload.new as Partial<Row> | null;
            const nextStatus =
              (newRow?.status as Status | undefined) ?? undefined;
            const id = newRow?.id;

            if (
              id &&
              nextStatus &&
              (nextStatus === "completed" || nextStatus === "failed")
            ) {
              // De-duplicate toasts per statement id
              if (!notifiedRef.current.has(id)) {
                notifiedRef.current.add(id);
                if (nextStatus === "completed") {
                  toast.success("Statement processed", {
                    description:
                      newRow?.file_name || "Your statement has been processed.",
                  });
                } else {
                  const reason = newRow?.failure_reason || "Processing failed";
                  toast.error("Statement failed", {
                    description: `${
                      newRow?.file_name || "Statement"
                    }: ${reason}`,
                  });
                }
              }
            }

            // Invalidate list to reflect latest status
            qc.invalidateQueries({ queryKey: ["statements"] });
          }
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch {}
      };
    }, [supabase, user?.id, qc]);

    return query;
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
