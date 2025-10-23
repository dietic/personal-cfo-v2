/**
 * PDF Extraction Utilities
 *
 * Robust PDF text extraction with password unlock support and text normalization.
 * Based on Python PDFService patterns for handling encrypted PDFs and text artifacts.
 */

import { logger } from "@/lib/logger";
import { spawn } from "node:child_process";
import path from "node:path";
// import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";

// Server-safe: delegate extraction to a Node child process script to avoid Next bundler resolution
async function extractUsingChild(
  buffer: Buffer,
  password?: string
): Promise<string> {
  // const __dirname = path.dirname(fileURLToPath(import.meta.url)); // unused
  const scriptPath = path.resolve(process.cwd(), "scripts", "extract-pdf.mjs");
  await new Promise<void>((resolve, reject) => {
    // Quick existence check
    import("node:fs")
      .then((fs) => {
        fs.access(scriptPath, fs.constants.R_OK, (err) =>
          err ? reject(err) : resolve()
        );
      })
      .catch(reject);
  });

  return new Promise<string>((resolve, reject) => {
    const args: string[] = [];
    if (password) args.push(`--password=${password}`);
    const child = spawn(process.execPath, [scriptPath, ...args], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => {
      out += d.toString("utf8");
    });
    child.stderr.on("data", (d) => {
      err += d.toString("utf8");
    });
    child.on("error", (e) => reject(e));
    child.on("close", () => {
      try {
        const parsed = JSON.parse(out || "{}") as {
          success?: boolean;
          text?: string;
          error?: string;
        };
        if (!parsed.success) {
          reject(
            new Error(parsed.error || err || "Unknown child extractor error")
          );
        } else {
          resolve(parsed.text || "");
        }
      } catch (e) {
        reject(new Error(err || (e as Error).message));
      }
    });
    child.stdin.write(buffer);
    child.stdin.end();
  });
}

interface ExtractionResult {
  success: boolean;
  text: string;
  error?: string;
}

interface UnlockResult {
  success: boolean;
  data: Buffer;
  error?: string;
}

/**
 * Extract text from PDF with optional password unlock
 */
export async function extractTextFromPDF(
  fileBuffer: Buffer,
  password?: string
): Promise<ExtractionResult> {
  try {
    // Delegate to child extractor with the ORIGINAL buffer and provided password.
    // Rationale: pre-processing with pdf-lib (ignoreEncryption) can mangle encrypted PDFs
    // and cause downstream "Incorrect Password" even with the correct password.
    const rawText = await extractUsingChild(fileBuffer, password);

    if (!rawText || !rawText.trim()) {
      return {
        success: false,
        text: "",
        error:
          "No text extracted from PDF. The file may be encrypted, image-only, or corrupt.",
      };
    }

    // Normalize and clean extracted text
    const cleanedText = normalizeExtractedText(rawText);

    return {
      success: true,
      text: cleanedText,
      error: undefined,
    };
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("pdf.extract.error", { error: err.message });
    // Check for encrypted PDF error
    if (
      err.message?.includes("encrypted") ||
      err.message?.includes("Incorrect Password") ||
      err.message?.toLowerCase().includes("password") ||
      err.message?.includes("locked")
    ) {
      return {
        success: false,
        text: "",
        error:
          "PDF is password protected. Please provide the password to unlock.",
      };
    }

    return {
      success: false,
      text: "",
      error: `PDF extraction failed: ${err.message || "Unknown error"}`,
    };
  }
}

/**
 * Unlock password-protected PDF using pdf-lib
 *
 * Note: pdf-lib has limited password support. For production use,
 * consider using a server-side Python service with pikepdf or PyPDF2
 * for more robust password handling.
 *
 * @param fileBuffer - PDF file buffer
 * @param password - Password to unlock PDF (currently unused in basic implementation)
 */
export async function unlockPDF(
  fileBuffer: Buffer,
  _password: string
): Promise<UnlockResult> {
  try {
    // Mark parameter as intentionally unused to satisfy linting while keeping API stable
    void _password;
    // Try to load PDF - pdf-lib will attempt to decrypt if password is in metadata
    // This is a basic implementation; for robust unlocking, use server-side Python/pikepdf
    // TODO: Implement actual password-based decryption using the password parameter
    const pdfDoc = await PDFDocument.load(fileBuffer, {
      ignoreEncryption: true, // Load encrypted PDF, we'll try password extraction separately
    });

    // For now, return the original buffer as pdf-parse will attempt to use the password
    // In a full implementation, you'd want to use a proper PDF password library
    // or call a Python microservice for robust unlocking

    // Save as potentially unlocked PDF
    const savedBytes = await pdfDoc.save();
    const savedBuffer = Buffer.from(savedBytes);

    return {
      success: true,
      data: savedBuffer,
      error: undefined,
    };
  } catch (error: unknown) {
    const err = error as Error;
    if (
      err.message?.includes("password") ||
      err.message?.includes("encrypted") ||
      err.message?.includes("Incorrect")
    ) {
      return {
        success: false,
        data: fileBuffer,
        error: "Incorrect password or PDF is encrypted with unsupported method",
      };
    }

    return {
      success: false,
      data: fileBuffer,
      error: `PDF unlock failed: ${err.message || "Unknown error"}`,
    };
  }
}

/**
 * Normalize extracted text by removing artifacts and common prefixes
 *
 * Some PDFs have text extraction artifacts like random prefixes, repeated characters,
 * or formatting noise. This function cleans them up.
 */
export function normalizeExtractedText(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // Remove common PDF text extraction artifacts
  // 1. Strip leading/trailing whitespace from each line
  cleaned = cleaned
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  // 2. Collapse multiple consecutive spaces to single space
  cleaned = cleaned.replace(/ {2,}/g, " ");

  // 3. Collapse multiple consecutive newlines to max 2 (preserve paragraph breaks)
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // 4. Remove common OCR artifacts (repeated single characters that don't form words)
  // Example: "- - - - -" or ". . . ."
  cleaned = cleaned.replace(/([^\w\s])\s*\1{3,}/g, "");

  // 5. Remove form feed and other control characters except newlines/tabs
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");

  return cleaned.trim();
}

/**
 * Detect if PDF is likely encrypted (before attempting extraction)
 */
export async function isPDFEncrypted(fileBuffer: Buffer): Promise<boolean> {
  try {
    // Try to load without password
    await PDFDocument.load(fileBuffer, { ignoreEncryption: false });
    return false;
  } catch (error: unknown) {
    const err = error as Error;
    if (
      err.message?.includes("encrypted") ||
      err.message?.includes("password")
    ) {
      return true;
    }
    // If it's another error, we can't be sure, so return false
    return false;
  }
}

/**
 * Validate PDF file (MIME type and basic structure)
 */
export function validatePDFBuffer(fileBuffer: Buffer): {
  valid: boolean;
  error?: string;
} {
  if (!fileBuffer || fileBuffer.length === 0) {
    return { valid: false, error: "File buffer is empty" };
  }

  // Check PDF magic number (starts with %PDF-)
  const header = fileBuffer.slice(0, 5).toString("ascii");
  if (!header.startsWith("%PDF-")) {
    return { valid: false, error: "File is not a valid PDF (invalid header)" };
  }

  return { valid: true };
}
