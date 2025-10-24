/**
 * Categorization Engine
 *
 * Auto-assigns categories to transactions based on user-defined keyword rules.
 * Uses first-match-wins principle with text normalization for robust matching.
 */

/**
 * Normalize text for keyword matching
 * - Converts to lowercase
 * - Removes accents (é → e, ñ → n)
 * - Strips common PDF prefix artifacts
 * - Removes extra whitespace
 */
export function normalizeText(text: string): string {
  if (!text) return "";

  // Convert to lowercase
  let normalized = text.toLowerCase();

  // Remove accents using Unicode normalization
  // NFD splits accented characters into base + combining mark
  // Then we remove the combining marks (Unicode range \u0300-\u036f)
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Strip common PDF prefix artifacts
  // Examples: "01/15 ", "2025-01-15 ", "[TRX] ", "*DEBIT* ", "PURCHASE "
  const prefixPatterns = [
    /^\d{2}\/\d{2}\s+/, // Date format: "01/15 "
    /^\d{4}-\d{2}-\d{2}\s+/, // ISO date: "2025-01-15 "
    /^\[TRX\]\s*/i, // Transaction code
    /^\*DEBIT\*\s*/i, // Debit marker
    /^\*CREDIT\*\s*/i, // Credit marker
    /^PURCHASE\s+/i, // Purchase prefix
    /^COMPRA\s+/i, // Spanish purchase prefix
  ];

  for (const pattern of prefixPatterns) {
    normalized = normalized.replace(pattern, "");
  }

  // Remove multiple spaces and trim
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

/**
 * Build searchable text from transaction description and merchant
 * Concatenates both fields with normalization
 */
export function buildSearchText(
  description: string,
  merchant: string | null
): string {
  const normalizedDesc = normalizeText(description);
  const normalizedMerchant = merchant ? normalizeText(merchant) : "";

  // Concatenate with space separator
  return `${normalizedDesc} ${normalizedMerchant}`.trim();
}

/**
 * Check if searchText contains the given keyword
 * Case-insensitive, accent-insensitive substring match
 * Note: searchText should already be normalized via buildSearchText()
 */
export function containsKeyword(searchText: string, keyword: string): boolean {
  const normalizedKeyword = normalizeText(keyword);
  const normalizedSearchText = normalizeText(searchText);
  return normalizedSearchText.includes(normalizedKeyword);
}

/**
 * Categorize a single transaction based on keyword rules
 * Returns category_id of first matching keyword, or null if no match
 *
 * @param transaction - Transaction with description and merchant
 * @param keywords - Array of category keywords (ordered by priority)
 * @returns category_id or null (uncategorized)
 */
export function categorizeTransaction(
  transaction: { description: string; merchant: string | null },
  keywords: Array<{ category_id: string; keyword: string }>
): string | null {
  if (keywords.length === 0) {
    return null; // No keywords = uncategorized
  }

  const searchText = buildSearchText(
    transaction.description,
    transaction.merchant
  );

  // First match wins
  for (const { category_id, keyword } of keywords) {
    if (containsKeyword(searchText, keyword)) {
      return category_id;
    }
  }

  return null; // No match = uncategorized
}

/**
 * Categorize multiple transactions in bulk
 * Returns array of { id, category_id } for each transaction
 */
export function categorizeTransactions(
  transactions: Array<{
    id: string;
    description: string;
    merchant: string | null;
  }>,
  keywords: Array<{ category_id: string; keyword: string }>
): Array<{ id: string; category_id: string | null }> {
  return transactions.map((txn) => ({
    id: txn.id,
    category_id: categorizeTransaction(
      { description: txn.description, merchant: txn.merchant },
      keywords
    ),
  }));
}

/**
 * Find all transactions that match a specific keyword
 * Used when a new keyword is created to auto-categorize uncategorized transactions
 *
 * @param transactions - Array of uncategorized transactions
 * @param keyword - The new keyword to match
 * @param categoryId - Category to assign to matching transactions
 * @returns Array of { id, category_id } for matching transactions
 */
export function findMatchingTransactionsForKeyword(
  transactions: Array<{
    id: string;
    description: string;
    merchant: string | null;
  }>,
  keyword: string,
  categoryId: string
): Array<{ id: string; category_id: string }> {
  const normalizedKeyword = normalizeText(keyword);

  return transactions
    .filter((txn) => {
      const searchText = buildSearchText(txn.description, txn.merchant);
      return searchText.includes(normalizedKeyword);
    })
    .map((txn) => ({
      id: txn.id,
      category_id: categoryId,
    }));
}
