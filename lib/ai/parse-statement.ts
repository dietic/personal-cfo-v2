/**
 * AI Statement Parser using OpenAI GPT-4o
 *
 * Universal bank statement transaction extraction with merchant standardization.
 * Based on the proven Python prompt with robust merchant normalization rules.
 */

import { logger } from "@/lib/logger";
import { extractTextFromPDF } from "@/lib/pdf/extract";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface ParsedTransaction {
  date: string; // ISO format YYYY-MM-DD
  merchant: string;
  description: string;
  amount: number;
  currency: string;
}

export interface ParseResult {
  success: boolean;
  transactions: ParsedTransaction[];
  error?: string;
}

/**
 * Extract transactions from bank statement PDF using AI
 */
export async function parseStatementPDF(
  fileBuffer: Buffer,
  password?: string
): Promise<ParseResult> {
  try {
    // quiet: avoid noisy logs; add structured logs only on errors

    // Extract text from PDF
    const extraction = await extractTextFromPDF(fileBuffer, password);

    if (!extraction.success || !extraction.text) {
      // If text extraction failed but it's an encrypted PDF, return specific error
      if (extraction.error?.includes("password protected")) {
        return {
          success: false,
          transactions: [],
          error: "encrypted",
        };
      }

      return {
        success: false,
        transactions: [],
        error: extraction.error || "Failed to extract text from PDF",
      };
    }

    // optional metrics could be added here if needed

    // Parse transactions using GPT-4o
    const transactions = await extractTransactionsWithAI(extraction.text);

    if (!transactions || transactions.length === 0) {
      return {
        success: false,
        transactions: [],
        error: "No transactions found in statement",
      };
    }

    // keep quiet in success path

    return {
      success: true,
      transactions,
      error: undefined,
    };
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("ai.parse_statement.failed", { error: err.message });
    return {
      success: false,
      transactions: [],
      error: `AI extraction failed: ${err.message || "Unknown error"}`,
    };
  }
}

/**
 * Extract transactions from statement text using OpenAI GPT-4o
 * Now exported for use in background jobs (Inngest)
 */
export async function extractTransactionsWithAI(
  statementText: string
): Promise<ParsedTransaction[]> {
  const prompt = buildExtractionPrompt(statementText);

  // quiet in production

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 8000,
    temperature: 0.1,
  });

  const content = response.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  // quiet in production

  // Parse JSON response
  const transactions = parseAIResponse(content);

  return transactions;
}

/**
 * Build the extraction prompt with merchant standardization rules
 */
function buildExtractionPrompt(statementText: string): string {
  return `Extract ALL purchase transactions, fees and interests from this bank statement.

IMPORTANT INSTRUCTIONS:
1. Extract ONLY actual purchases/transactions (merchant charges, purchases, payments, interests, fees)
2. EXCLUDE: balance transfers, payments between accounts, adjustments
3. Determine the statement period from the FIRST PAGE header (e.g., "Statement period", "Periodo", "Del ... al ..."). Use this to infer the CORRECT YEAR for each transaction date when the statement lists dates without a year.
4. For each transaction return these fields:
   - date: full ISO date in format YYYY-MM-DD (include the correct year inferred from the statement period; if the period spans months/years, use the appropriate year for each date)
   - merchant: standardized merchant name (see merchant standardization rules below)
   - description: complete original merchant/transaction description as printed (preserve names, remove internal codes)
   - amount: numeric amount (positive number, use dot as decimal separator)
   - currency: currency code (PEN, USD, EUR, etc.)
5. Handle multiple currencies if present.
6. Return ONLY the JSON array with no additional text.

MERCHANT STANDARDIZATION RULES:

When standardizing merchant names:
- Normalize the raw description before matching: trim, collapse spaces, remove diacritics, and strip store/location noise (districts, "PE/PERU", "LIMA", "SUC/STORE #", "TIENDA", "S.A.", "SAC", "E.I.R.L.", "E-COM", "ECOM", "POS", "APP", "WEB", "QR", card scheme codes).
- Use brand inference, not exact lists. Prefer widely known consumer brands based on general knowledge of companies operating globally and in Latin America (food delivery, supermarkets, electronics, apparel, streaming, marketplaces, app stores, ride-hailing).
- Fuzzy/substring match common brand tokens and variants (ignore case/punctuation): e.g., "RAPPI", "RAPPI*RESTAURANTES", "RAPPI PRIME" → "Rappi"; "UBER TRIP/UBER*EATS" → "Uber" or "Uber Eats"; "GOOGLE*"/"Google Play" → "Google Play"; "APPLE.COM/BILL/ITUNES" → "Apple"; "AMAZON*"/"AMZN" → "Amazon"; "MERCADOPAGO/MERCADO PAGO" → infer underlying merchant if present, else "Mercado Pago".
- If the string contains a domain or host, map it to the brand: take the registrable domain (before the TLD) and title-case it (e.g., "STEAMGAMES.COM", "OPENAI.COM", "SPOTIFY.COM", "SHEIN.COM", "ALiexpress.com", "NETFLIX.COM" → "Steam", "OpenAI", "Spotify", "Shein", "Netflix").
- For payments via gateways/aggregators (e.g., "NIUBIZ", "IZIPAY", "CULQI", "STRIPE", "PAYU", "DLOCAL", "MERCADO PAGO"):
  1) Look left/right for a recognizable merchant token in the same line; if found, use that merchant.
  2) If none is present, return the aggregator name itself (e.g., "Niubiz") only as a fallback.
- **Collapse "brand + descriptor" to the brand only:** If a recognized brand token appears and is immediately followed by a generic descriptor, drop everything after the brand. Examples:
  - "APPARKA CLINICA", "APPARKA GUARDIA CIVIL", "APPARKA SEDE XYZ" → "Apparka"
  - "RAPPI RESTAURANTES", "COOLBOX TIENDA 123", "SMARTFIT LOS OLIVOS" → "Rappi", "Coolbox", "Smartfit"
  - This rule applies unless the suffix forms a distinct, widely known sub-brand (keep "Uber Eats", "Google Play").
- **CRITICAL: Remove transaction type suffixes and country codes:** Many bank statements append transaction type indicators or country codes after merchant names. These must be stripped from the merchant field. Examples:
  - "Smart Fit Peru MIRAFLORES PE CONSUMO" → "Smart Fit Peru MIRAFLORES" (remove "PE CONSUMO")
  - "STARBUCKS LIMA PE COMPRA" → "Starbucks Lima" (remove "PE COMPRA")
  - "WALMART PERU PE DEBITO" → "Walmart Peru" (remove "PE DEBITO")
  - Common suffixes to remove: "PE CONSUMO", "PE COMPRA", "PE DEBITO", "USD CONSUMO", "EUR COMPRA", "CONSUMO", "COMPRA", "DEBITO", "CREDITO", "PURCHASE", "DEBIT", "CREDIT"
- Descriptor stop-list (strip when following a brand token; ignore accents/case): clinica, restaurante(s), farmacia(s), guardia civil, comisaria, sede, sucursal, agencia, tienda, local, sede central, oficina, mall, centro comercial, larcomar, miraflores, san isidro, san borja, surco, los olivos, independencia, callao, arequipa, trujillo, chiclayo, cusco, piura, loja, lima, peru, pe, s.a., sac, eirl, sa, suc, store, store numbers, consumo, compra, debito, credito, purchase, debit, credit.
- Handle local brand noise and branches: remove neighborhood/district names and store numbers; keep just the brand (e.g., "COOLBOX MIRAFLORES" → "Coolbox"; "SAGA FALABELLA LARCOMAR" → "Saga Falabella").
- Prefer the more specific sub-brand when unambiguous (e.g., "Uber Eats" over "Uber" if "EATS" appears; "Google Play" over "Google" if "GOOGLE*" + app/billing pattern).
- Use proper capitalization (e.g., "Makro" not "MAKRO").
- Only return "Unknown" when no recognizable brand token, domain, or aggregator-adjacent merchant can be inferred with high confidence — do not return "Unknown" for well-known brands.

EXPECTED OUTPUT FORMAT - JSON array:
[
  {
    "date": "2025-05-12",
    "merchant": "Makro",
    "description": "MAKRO INDEPENDENCIA LIMA PE",
    "amount": 195.50,
    "currency": "PEN"
  }
]

STATEMENT CONTENT:
${statementText}

Extract ALL purchase transactions. Return ONLY the JSON array with no additional text.`;
}

/**
 * Parse AI response and extract JSON array of transactions
 */
function parseAIResponse(content: string): ParsedTransaction[] {
  // Try to extract JSON from code blocks first
  const codeBlockMatch = content.match(/```(?:json)?\s*(\[.*?\])\s*```/s);

  let jsonStr: string;

  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  } else {
    // Try to find JSON array in response
    const jsonStart = content.indexOf("[");
    const jsonEnd = content.lastIndexOf("]") + 1;

    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      jsonStr = content.substring(jsonStart, jsonEnd);
    } else {
      throw new Error("No JSON array found in AI response");
    }
  }

  try {
    const parsed = JSON.parse(jsonStr) as unknown;

    if (!Array.isArray(parsed)) {
      throw new Error("AI response is not an array");
    }

    // Validate and transform transactions
    return parsed.map((txn: Record<string, unknown>) => ({
      date: (txn.date as string) || "",
      merchant: (txn.merchant as string) || "Unknown",
      description:
        (txn.description as string) || (txn.merchant as string) || "",
      amount: parseFloat(txn.amount as number | string as string) || 0,
      currency: (txn.currency as string) || "PEN",
    }));
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("ai.parse_statement.invalid_json", { error: err.message });
    throw new Error(`Invalid JSON in AI response: ${err.message}`);
  }
}
