"use client";

import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/validators/categories";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Category {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  status: "active" | "inactive";
  is_preset: boolean;
  created_at: string;
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/settings/categories");
  if (!res.ok) throw new Error((await res.json()).error || "Failed to load");
  const json = await res.json();
  return json.data as Category[];
}

async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const res = await fetch("/api/settings/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || json.error || "Create failed");
  return json.data as Category;
}

async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<Category> {
  const res = await fetch(`/api/settings/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Update failed");
  return json.data as Category;
}

async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`/api/settings/categories/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
}

export function useCategories() {
  const qc = useQueryClient();

  const query = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const createMut = useMutation({
    mutationFn: createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      updateCategory(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  return {
    categories: (query.data ?? []) as Category[],
    data: (query.data ?? []) as Category[],
    isLoading: query.isLoading,
    error: (query.error as Error) ?? null,
    createCategory: createMut.mutateAsync,
    updateCategory: updateMut.mutateAsync,
    deleteCategory: deleteMut.mutateAsync,
    isCreating: createMut.isPending,
    isUpdating: updateMut.isPending,
    isDeleting: deleteMut.isPending,
  };
}
 
