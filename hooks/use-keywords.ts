"use client";

import {
  CreateKeywordInput,
  UpdateKeywordInput,
} from "@/lib/validators/keywords";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Keyword {
  id: string;
  category_id: string;
  keyword: string;
  created_at: string;
}

async function fetchKeywords(categoryId: string): Promise<Keyword[]> {
  const res = await fetch(`/api/settings/keywords?categoryId=${categoryId}`);
  if (!res.ok) throw new Error((await res.json()).error || "Failed to load");
  const json = await res.json();
  return json.data as Keyword[];
}

async function createKeyword(input: CreateKeywordInput): Promise<Keyword> {
  const res = await fetch(`/api/settings/keywords`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Create failed");
  return json.data as Keyword;
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

export function useKeywords(categoryId: string | null) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["keywords", categoryId],
    queryFn: () => fetchKeywords(categoryId as string),
    enabled: !!categoryId,
  });

  const createMut = useMutation({
    mutationFn: createKeyword,
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["keywords", vars.category_id] }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateKeywordInput }) =>
      updateKeyword(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["keywords", categoryId] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteKeyword(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["keywords", categoryId] }),
  });

  return {
    keywords: (query.data ?? []) as Keyword[],
    isLoading: query.isLoading,
    error: (query.error as Error) ?? null,
    createKeyword: createMut.mutateAsync,
    updateKeyword: updateMut.mutateAsync,
    deleteKeyword: deleteMut.mutateAsync,
    isCreating: createMut.isPending,
    isUpdating: updateMut.isPending,
    isDeleting: deleteMut.isPending,
  };
}
