import { requireAuth } from "@/lib/auth";
import { inngest } from "@/lib/inngest";
import { processStatementCore } from "@/lib/inngest/functions/process-statement";
import { logger } from "@/lib/logger";
import { extractTextFromPDF } from "@/lib/pdf/extract";
import { statementUploadSchema } from "@/lib/validators/statements";
import type { Database } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Force Node.js runtime for pdf-parse native dependencies
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/statements
 * Upload and process a bank statement PDF
 *
 * Accepts multipart/form-data with:
 * - file: PDF file
 * - cardId: UUID of the card
 * - password: (optional) PDF password if encrypted
 */
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth();

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const cardId = formData.get("cardId") as string | null;
    const password = (formData.get("password") as string | null) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!cardId) {
      return NextResponse.json(
        { error: "Card ID is required" },
        { status: 400 }
      );
    }

    // Validate input
    const validation = statementUploadSchema.safeParse({
      cardId,
      password,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Validate file type and size
    const MAX_SIZE = 25 * 1024 * 1024; // 25MB
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 25MB limit" },
        { status: 400 }
      );
    }

    // Verify card belongs to user
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("id")
      .eq("id", cardId)
      .eq("user_id", user.id)
      .single();

    if (cardError || !card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Step 1: Extract text from PDF immediately (fast operation, ~1-2 seconds)
    logger.info("statement.upload.extract_start", {
      file: file.name,
      size: file.size,
    });
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    let extractionResult;
    try {
      extractionResult = await extractTextFromPDF(fileBuffer, password);
    } catch (error: unknown) {
      const err = error as Error;
      logger.error("statement.upload.extract_error", { error: err.message });
      return NextResponse.json(
        {
          error: "extraction_failed",
          message: `PDF extraction error: ${err.message || "Unknown error"}`,
        },
        { status: 400 }
      );
    }

    // If extraction failed because PDF is encrypted and no password provided
    if (
      !extractionResult.success &&
      extractionResult.error?.includes("password")
    ) {
      logger.info("statement.upload.encrypted", { file: file.name });
      return NextResponse.json(
        {
          error: "encrypted",
          message: "PDF is password protected. Please provide the password.",
        },
        { status: 400 }
      );
    }

    // If extraction failed for other reasons
    if (!extractionResult.success) {
      logger.error("statement.upload.extraction_failed", {
        reason: extractionResult.error,
      });
      return NextResponse.json(
        {
          error: "extraction_failed",
          message: extractionResult.error || "Failed to extract text from PDF",
        },
        { status: 400 }
      );
    }

    logger.info("statement.upload.extract_success", {
      chars: extractionResult.text.length,
    });

    // Step 2: Create statement metadata with status='processing'
    const statementData: Database["public"]["Tables"]["statements"]["Insert"] =
      {
        user_id: user.id,
        card_id: cardId,
        file_name: file.name,
        file_type: file.type,
        status: "processing",
        retry_count: 0,
      };

    const { data: statement, error: statementError } = await (
      supabase as unknown as {
        from: (table: string) => {
          insert: (
            data: Database["public"]["Tables"]["statements"]["Insert"]
          ) => {
            select: () => {
              single: () => Promise<{
                data: Database["public"]["Tables"]["statements"]["Row"] | null;
                error: unknown;
              }>;
            };
          };
        };
      }
    )
      .from("statements")
      .insert(statementData)
      .select()
      .single();

    if (statementError || !statement) {
      logger.error("statement.upload.create_failed", {
        error: String(statementError),
      });
      return NextResponse.json(
        { error: "Failed to create statement" },
        { status: 500 }
      );
    }

    // Step 3: Queue AI processing job with extracted text (not the PDF file)
    // The PDF is now deleted from memory; only extracted text is passed to background job
    try {
      await inngest.send({
        name: "statement/process",
        data: {
          statementId: statement.id,
          userId: user.id,
          cardId,
          fileName: file.name,
          extractedText: extractionResult.text,
        },
      });
      logger.info("statement.upload.queued", {
        statementId: statement.id,
        chars: extractionResult.text.length,
      });
    } catch (e: unknown) {
      const err = e as Error;
      const msg = err.message || "";
      // Dev fallback: If Inngest isn't configured locally, process inline to keep flow unblocked
      if (
        msg.includes("Inngest API Error") ||
        msg.includes("401") ||
        msg.includes("Event key")
      ) {
        logger.warn("statement.upload.inngest_missing_key_fallback");
        // Fire and forget to keep response snappy; logs will show completion
        void processStatementCore({
          statementId: statement.id,
          userId: user.id,
          cardId,
          fileName: file.name,
          extractedText: extractionResult.text,
        }).catch((err) => {
          logger.error("statement.upload.inline_processing_failed", {
            error: err.message,
          });
        });
      } else {
        throw err;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: statement.id,
        status: "processing",
        message: "Statement text extracted and queued for AI processing",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("statement.upload.error", { error: String(error) });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/statements
 * Lists statements for the authenticated user with basic filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined; // completed|failed|processing
    const cardId = searchParams.get("cardId") || undefined;
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize") || 25))
    );
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("statements")
      .select(
        `id, file_name, file_type, status, failure_reason, uploaded_at, retry_count,
         cards:card_id(id, name)`,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false });

    if (search) {
      const pattern = `%${search}%`;
      query = query.ilike("file_name", pattern);
    }
    if (status) query = query.eq("status", status);
    if (cardId) query = query.eq("card_id", cardId);

    const { data, error, count } = await query.range(from, to);
    if (error) {
      console.error("Supabase error fetching statements:", error);
      return NextResponse.json(
        { error: "Failed to fetch statements" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data, total: count ?? 0 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/statements (bulk)
 * Body: { ids: string[] }
 */
export async function DELETE(request: NextRequest) {
  try {
    const { user, supabase } = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const schema = z.object({ ids: z.array(z.string().uuid()).min(1) });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const { ids } = parsed.data;
    // Deleting statements should cascade delete their transactions (DB ON DELETE CASCADE)
    const { error } = await supabase
      .from("statements")
      .delete()
      .in("id", ids)
      .eq("user_id", user.id);

    if (error) {
      console.error("Supabase error deleting statements:", error);
      return NextResponse.json(
        { error: "Failed to delete statements" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
