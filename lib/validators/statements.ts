/**
 * Statement validators using Zod
 */

import { z } from "zod";

/**
 * Statement upload schema
 */
export const statementUploadSchema = z.object({
  cardId: z.string().uuid("Invalid card ID"),
  password: z.string().optional(),
  // file will be validated separately as FormData
});

export type StatementUploadInput = z.infer<typeof statementUploadSchema>;

/**
 * Statement processing result schema
 */
export const statementProcessingResultSchema = z.object({
  statementId: z.string().uuid(),
  status: z.enum(["completed", "failed", "processing"]),
  transactionsCount: z.number().int().nonnegative().optional(),
  failureReason: z.string().optional(),
});

export type StatementProcessingResult = z.infer<
  typeof statementProcessingResultSchema
>;

/**
 * Validate file upload constraints
 */
export function validateStatementFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
  const ALLOWED_MIME_TYPES = ["application/pdf"];

  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: "File must be a PDF" };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "File is empty" };
  }

  return { valid: true };
}
