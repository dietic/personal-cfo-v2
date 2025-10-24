/**
 * Validation schemas for chat feature
 */

import { z } from "zod";

export const chatQuerySchema = z.object({
  query: z
    .string()
    .min(1, "Query cannot be empty")
    .max(500, "Query must be 500 characters or less")
    .trim(),
});

export type ChatQueryInput = z.infer<typeof chatQuerySchema>;
