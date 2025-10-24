import { z } from "zod";

export const createExcludedKeywordSchema = z.object({
  keyword: z
    .string()
    .min(1, "Keyword is required")
    .max(100, "Keyword must be 100 characters or less")
    .trim(),
});

export const bulkCreateExcludedSchema = z.object({
  keywords: z
    .array(
      z
        .string()
        .min(1, "Keyword is required")
        .max(100, "Keyword must be 100 characters or less")
        .trim()
    )
    .min(1, "At least one keyword is required"),
});

export const updateExcludedKeywordSchema = z.object({
  keyword: z
    .string()
    .min(1, "Keyword is required")
    .max(100, "Keyword must be 100 characters or less")
    .trim(),
});

export type CreateExcludedKeywordInput = z.infer<
  typeof createExcludedKeywordSchema
>;
export type BulkCreateExcludedInput = z.infer<
  typeof bulkCreateExcludedSchema
>;
export type UpdateExcludedKeywordInput = z.infer<
  typeof updateExcludedKeywordSchema
>;
