"use client";

import { useLocale } from "@/contexts/locale-context";
import {
  CreateKeywordInput,
  UpdateKeywordInput,
} from "@/lib/validators/keywords";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export interface Keyword {
  id: string;
  category_id: string;
  keyword: string;
  status: "categorizing" | "active" | "failed";
  categorized_count: number;
  failure_reason: string | null;
  created_at: string;
}

async function fetchKeywords(categoryId: string): Promise<Keyword[]> {
  const res = await fetch(`/api/settings/keywords?categoryId=${categoryId}`);
  if (!res.ok) throw new Error((await res.json()).error || "Failed to load");
  const json = await res.json();
  return json.data as Keyword[];
}

async function createKeyword(
  input: CreateKeywordInput
): Promise<{ keyword: Keyword; categorizedCount: number }> {
  const res = await fetch(`/api/settings/keywords`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Create failed");
  return {
    keyword: json.data as Keyword,
    categorizedCount: json.categorizedCount || 0,
  };
}

async function updateKeyword(id: string, input: UpdateKeywordInput) {
  const res = await fetch(`/api/settings/keywords/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Update failed");
  return json.data as Keyword;
}

async function deleteKeyword(id: string) {
  const res = await fetch(`/api/settings/keywords/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
}

async function retryKeyword(id: string) {
  const res = await fetch(`/api/settings/keywords/${id}/retry`, {
    method: "POST",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Retry failed");
}

async function reassignKeyword(id: string, newCategoryId: string) {
  const res = await fetch(`/api/settings/keywords/${id}/reassign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newCategoryId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Reassign failed");
}

export function useKeywords(categoryId: string | null) {
  const qc = useQueryClient();
  const prevKeywordsRef = useRef<Keyword[]>([]);
  const { t } = useLocale();

  const query = useQuery({
    queryKey: ["keywords", categoryId],
    queryFn: () => fetchKeywords(categoryId as string),
    enabled: !!categoryId,
    // Poll every 2s while any keyword is 'categorizing'
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.some(
        (k) => k.status === "categorizing"
      );
      return hasProcessing ? 2000 : false;
    },
  });

  // Show toast when keyword completes categorization
  useEffect(() => {
    const currentKeywords = query.data ?? [];
    const prevKeywords = prevKeywordsRef.current;

    currentKeywords.forEach((current) => {
      const prev = prevKeywords.find((p) => p.id === current.id);

      // Detect status change from 'categorizing' to 'active'
      if (
        prev &&
        prev.status === "categorizing" &&
        current.status === "active"
      ) {
        const count = current.categorized_count;
        if (count > 0) {
          toast.success(
            t("settings.keywords.toasts.categorizeDoneTitle").replace(
              "{keyword}",
              current.keyword
            ),
            {
              description: t(
                "settings.keywords.toasts.categorizeDoneDesc"
              ).replace("{count}", String(count)),
            }
          );
        } else {
          toast.info(
            t("settings.keywords.toasts.activeTitle").replace(
              "{keyword}",
              current.keyword
            ),
            {
              description: t("settings.keywords.toasts.activeDesc"),
            }
          );
        }

        // Invalidate transactions to refresh the list
        qc.invalidateQueries({ queryKey: ["transactions"] });
      }

      // Detect status change to 'failed'
      if (
        prev &&
        prev.status === "categorizing" &&
        current.status === "failed"
      ) {
        toast.error(
          t("settings.keywords.toasts.failedTitle").replace(
            "{keyword}",
            current.keyword
          ),
          {
            description:
              current.failure_reason ||
              t("settings.keywords.toasts.failedDesc").replace(
                "{reason}",
                t("common.error")
              ),
          }
        );
      }
    });

    prevKeywordsRef.current = currentKeywords;
  }, [query.data, qc]);

  const createMut = useMutation({
    mutationFn: createKeyword,
    onSuccess: (result, vars) => {
      qc.invalidateQueries({ queryKey: ["keywords", vars.category_id] });
      // Also invalidate transactions if any were auto-categorized
      if (result.categorizedCount > 0) {
        qc.invalidateQueries({ queryKey: ["transactions"] });
      }
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateKeywordInput }) =>
      updateKeyword(id, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["keywords", categoryId] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteKeyword(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["keywords", categoryId] }),
  });

  const retryMut = useMutation({
    mutationFn: (id: string) => retryKeyword(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["keywords", categoryId] }),
  });

  const reassignMut = useMutation({
    mutationFn: ({
      id,
      newCategoryId,
    }: {
      id: string;
      newCategoryId: string;
    }) => reassignKeyword(id, newCategoryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["keywords"] }); // Invalidate all categories
      qc.invalidateQueries({ queryKey: ["transactions"] }); // Refresh transactions
    },
  });

  return {
    keywords: (query.data ?? []) as Keyword[],
    isLoading: query.isLoading,
    error: (query.error as Error) ?? null,
    createKeyword: createMut.mutateAsync,
    updateKeyword: updateMut.mutateAsync,
    deleteKeyword: deleteMut.mutateAsync,
    retryKeyword: retryMut.mutateAsync,
    reassignKeyword: reassignMut.mutateAsync,
    isCreating: createMut.isPending,
    isUpdating: updateMut.isPending,
    isDeleting: deleteMut.isPending,
    isRetrying: retryMut.isPending,
    isReassigning: reassignMut.isPending,
  };
}
