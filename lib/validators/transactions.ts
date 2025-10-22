import { z } from "zod";

/**
 * Schemas for Transactions
 * We accept `amount` as a decimal number in the API payload and convert it
 * to `amount_cents` on the server. Type determines sign: expense=-, income=+.
 */

export const transactionTypeSchema = z.enum(["income", "expense"]);

export const createTransactionSchema = z.object({
  card_id: z.string().uuid("Invalid card ID"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description must be 200 characters or less")
    .trim(),
  merchant: z.string().max(100).trim().optional().nullable(),
  transaction_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/g, "Date must be YYYY-MM-DD"),
  category_id: z.string().uuid().optional().nullable(),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code")
    .transform((s) => s.toUpperCase()),
  amount: z.number().finite().max(10_000_000, "Amount too large"),
  type: transactionTypeSchema,
});

export const updateTransactionSchema = z.object({
  card_id: z.string().uuid().optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200)
    .trim()
    .optional(),
  merchant: z.string().max(100).trim().optional().nullable(),
  transaction_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/g, "Date must be YYYY-MM-DD")
    .optional(),
  category_id: z.string().uuid().optional().nullable(),
  currency: z
    .string()
    .length(3)
    .transform((s) => s.toUpperCase())
    .optional(),
  amount: z.number().finite().max(10_000_000).optional(),
  type: transactionTypeSchema.optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
