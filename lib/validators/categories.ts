import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be 50 characters or less")
    .trim(),
  emoji: z.string().max(8).optional().nullable(),
  color: z.string().max(24).optional().nullable(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be 50 characters or less")
    .trim()
    .optional(),
  emoji: z.string().max(8).optional().nullable(),
  color: z.string().max(24).optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
