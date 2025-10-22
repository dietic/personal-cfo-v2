"use client";

import { useQuery } from "@tanstack/react-query";

export interface Category {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/settings/categories");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to load categories");
  }
  const json = await res.json();
  return (json.data ?? []) as Category[];
}

export function useCategories() {
  return useQuery({ queryKey: ["categories"], queryFn: fetchCategories, staleTime: 5 * 60 * 1000 });
}
