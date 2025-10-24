import { z } from "zod";

export const createKeywordSchema = z.object({
  category_id: z.string().uuid("Invalid category ID"),
  keyword: z
    .string()
    .min(1, "Keyword is required")
    .max(100, "Keyword must be 100 characters or less")
    .trim(),
});

export const updateKeywordSchema = z.object({
  keyword: z
    .string()
    .min(1, "Keyword is required")
    .max(100, "Keyword must be 100 characters or less")
    .trim(),
});

export type CreateKeywordInput = z.infer<typeof createKeywordSchema>;
export type UpdateKeywordInput = z.infer<typeof updateKeywordSchema>;
