"use client";

import { useLocale } from "@/contexts/locale-context";

/**
 * Hook for accessing translations in components
 * @deprecated Use useLocale() directly from contexts/locale-context
 */
export function useTranslation() {
  return useLocale();
}
