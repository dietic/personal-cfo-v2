import { z } from "zod";

/**
 * Schema for creating a new card
 * Fields: name, bank_id, due_date (optional)
 */
export const createCardSchema = z.object({
  name: z
    .string()
    .min(1, "Card name is required")
    .max(50, "Card name must be 50 characters or less")
    .trim(),
  bank_id: z.string().uuid("Invalid bank ID"),
  due_date: z
    .number()
    .int("Due date must be an integer")
    .min(1, "Due date must be between 1 and 31")
    .max(31, "Due date must be between 1 and 31")
    .optional()
    .nullable(),
});

/**
 * Schema for updating an existing card
 * All fields optional (partial update)
 */
export const updateCardSchema = z.object({
  name: z
    .string()
    .min(1, "Card name is required")
    .max(50, "Card name must be 50 characters or less")
    .trim()
    .optional(),
  bank_id: z.string().uuid("Invalid bank ID").optional(),
  due_date: z
    .number()
    .int("Due date must be an integer")
    .min(1, "Due date must be between 1 and 31")
    .max(31, "Due date must be between 1 and 31")
    .optional()
    .nullable(),
});

/**
 * TypeScript types inferred from schemas
 */
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
