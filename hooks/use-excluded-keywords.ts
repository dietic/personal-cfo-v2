"use client";

import {
  BulkCreateExcludedInput,
  CreateExcludedKeywordInput,
  UpdateExcludedKeywordInput,
} from "@/lib/validators/excluded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ExcludedKeyword {
  id: string;
  keyword: string;
  created_at: string;
}

async function fetchExcluded(): Promise<ExcludedKeyword[]> {
  const res = await fetch(`/api/settings/excluded`);
  if (!res.ok) throw new Error((await res.json()).error || "Failed to load");
  const json = await res.json();
  return json.data as ExcludedKeyword[];
}

async function createExcluded(
  input: CreateExcludedKeywordInput | BulkCreateExcludedInput
): Promise<ExcludedKeyword[] | ExcludedKeyword> {
  const res = await fetch(`/api/settings/excluded`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Create failed");
  return json.data as any;
}

async function updateExcluded(id: string, input: UpdateExcludedKeywordInput) {
  const res = await fetch(`/api/settings/excluded/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Update failed");
  return json.data as ExcludedKeyword;
}

async function deleteExcluded(id: string) {
  const res = await fetch(`/api/settings/excluded/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
}

export function useExcludedKeywords() {
  const qc = useQueryClient();

  const query = useQuery({ queryKey: ["excluded"], queryFn: fetchExcluded });

  const createMut = useMutation({
    mutationFn: createExcluded,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["excluded"] }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExcludedKeywordInput }) =>
      updateExcluded(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["excluded"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteExcluded(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["excluded"] }),
  });

  return {
    excluded: (query.data ?? []) as ExcludedKeyword[],
    isLoading: query.isLoading,
    error: (query.error as Error) ?? null,
    createExcluded: createMut.mutateAsync,
    updateExcluded: updateMut.mutateAsync,
    deleteExcluded: deleteMut.mutateAsync,
    isCreating: createMut.isPending,
    isUpdating: updateMut.isPending,
    isDeleting: deleteMut.isPending,
  };
}
