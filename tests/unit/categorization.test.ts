import {
  buildSearchText,
  categorizeTransaction,
  categorizeTransactions,
  containsKeyword,
  findMatchingTransactionsForKeyword,
  normalizeText,
} from "@/lib/categorization";
import { describe, expect, it } from "vitest";

describe("normalizeText", () => {
  it("converts to lowercase", () => {
    expect(normalizeText("STARBUCKS")).toBe("starbucks");
    expect(normalizeText("Netflix")).toBe("netflix");
  });

  it("removes accents", () => {
    expect(normalizeText("café")).toBe("cafe");
    expect(normalizeText("José")).toBe("jose");
    expect(normalizeText("Ñoño")).toBe("nono");
    expect(normalizeText("résumé")).toBe("resume");
  });

  it("strips date prefixes", () => {
    expect(normalizeText("01/15 STARBUCKS")).toBe("starbucks");
    expect(normalizeText("12/31 NETFLIX")).toBe("netflix");
    expect(normalizeText("2025-01-15 UBER")).toBe("uber");
  });

  it("strips transaction code prefixes", () => {
    expect(normalizeText("[TRX] STARBUCKS")).toBe("starbucks");
    expect(normalizeText("*DEBIT* NETFLIX")).toBe("netflix");
    expect(normalizeText("*CREDIT* PAYCHECK")).toBe("paycheck");
    expect(normalizeText("PURCHASE AMAZON")).toBe("amazon");
    expect(normalizeText("COMPRA UBER")).toBe("uber");
  });

  it("removes multiple spaces", () => {
    expect(normalizeText("STARBUCKS   #1234")).toBe("starbucks #1234");
    expect(normalizeText("  NETFLIX  ")).toBe("netflix");
  });

  it("handles empty string", () => {
    expect(normalizeText("")).toBe("");
  });

  it("handles complex combinations", () => {
    expect(normalizeText("01/15 *DEBIT* CAFÉ  JOSÉ")).toBe("cafe jose");
  });
});

describe("buildSearchText", () => {
  it("concatenates description and merchant", () => {
    const result = buildSearchText("NETFLIX.COM", "Netflix");
    expect(result).toBe("netflix.com netflix");
  });

  it("handles null merchant", () => {
    const result = buildSearchText("STARBUCKS #1234", null);
    expect(result).toBe("starbucks #1234");
  });

  it("normalizes both fields", () => {
    const result = buildSearchText("CAFÉ París", "José's Coffee");
    expect(result).toBe("cafe paris jose's coffee");
  });

  it("strips prefixes from description", () => {
    const result = buildSearchText("01/15 UBER TRIP", "Uber");
    expect(result).toBe("uber trip uber");
  });
});

describe("containsKeyword", () => {
  it("finds exact matches", () => {
    expect(containsKeyword("starbucks coffee", "starbucks")).toBe(true);
    expect(containsKeyword("uber trip 123", "uber")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(containsKeyword("netflix premium", "NETFLIX")).toBe(true);
    expect(containsKeyword("STARBUCKS COFFEE", "starbucks")).toBe(true);
  });

  it("is accent-insensitive", () => {
    expect(containsKeyword("cafe paris", "café")).toBe(true);
    expect(containsKeyword("café paris", "cafe")).toBe(true);
  });

  it("finds partial matches", () => {
    expect(containsKeyword("uber eats order", "uber")).toBe(true);
    expect(containsKeyword("starbucks #1234", "star")).toBe(true);
  });

  it("returns false for non-matches", () => {
    expect(containsKeyword("netflix premium", "hulu")).toBe(false);
    expect(containsKeyword("starbucks", "mcdonalds")).toBe(false);
  });
});

describe("categorizeTransaction", () => {
  const keywords = [
    { category_id: "cat-1", keyword: "netflix" },
    { category_id: "cat-2", keyword: "starbucks" },
    { category_id: "cat-3", keyword: "uber" },
  ];

  it("returns category_id for first matching keyword", () => {
    const result = categorizeTransaction(
      { description: "NETFLIX.COM SUBSCRIPTION", merchant: "Netflix" },
      keywords
    );
    expect(result).toBe("cat-1");
  });

  it("searches both description and merchant", () => {
    const result = categorizeTransaction(
      { description: "MONTHLY SUBSCRIPTION", merchant: "Netflix" },
      keywords
    );
    expect(result).toBe("cat-1");
  });

  it("returns null if no match", () => {
    const result = categorizeTransaction(
      { description: "UNKNOWN MERCHANT", merchant: null },
      keywords
    );
    expect(result).toBeNull();
  });

  it("returns null if keywords array is empty", () => {
    const result = categorizeTransaction(
      { description: "NETFLIX.COM", merchant: null },
      []
    );
    expect(result).toBeNull();
  });

  it("returns first match when multiple keywords match", () => {
    const multiKeywords = [
      { category_id: "cat-1", keyword: "uber" },
      { category_id: "cat-2", keyword: "eats" },
    ];
    const result = categorizeTransaction(
      { description: "UBER EATS ORDER", merchant: "Uber Eats" },
      multiKeywords
    );
    expect(result).toBe("cat-1"); // First match wins
  });

  it("is case-insensitive", () => {
    const result = categorizeTransaction(
      { description: "STARBUCKS COFFEE", merchant: null },
      keywords
    );
    expect(result).toBe("cat-2");
  });

  it("is accent-insensitive", () => {
    const accentKeywords = [{ category_id: "cat-1", keyword: "café" }];
    const result = categorizeTransaction(
      { description: "CAFE PARIS", merchant: null },
      accentKeywords
    );
    expect(result).toBe("cat-1");
  });

  it("handles prefixes correctly", () => {
    const result = categorizeTransaction(
      { description: "01/15 *DEBIT* NETFLIX PREMIUM", merchant: null },
      keywords
    );
    expect(result).toBe("cat-1");
  });
});

describe("categorizeTransactions", () => {
  const keywords = [
    { category_id: "cat-1", keyword: "netflix" },
    { category_id: "cat-2", keyword: "starbucks" },
  ];

  const transactions = [
    { id: "txn-1", description: "NETFLIX.COM", merchant: "Netflix" },
    { id: "txn-2", description: "STARBUCKS #1234", merchant: null },
    { id: "txn-3", description: "UNKNOWN", merchant: null },
  ];

  it("categorizes all transactions", () => {
    const results = categorizeTransactions(transactions, keywords);

    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({ id: "txn-1", category_id: "cat-1" });
    expect(results[1]).toEqual({ id: "txn-2", category_id: "cat-2" });
    expect(results[2]).toEqual({ id: "txn-3", category_id: null });
  });

  it("handles empty transactions array", () => {
    const results = categorizeTransactions([], keywords);
    expect(results).toEqual([]);
  });

  it("handles empty keywords array", () => {
    const results = categorizeTransactions(transactions, []);
    expect(results).toHaveLength(3);
    expect(results.every((r) => r.category_id === null)).toBe(true);
  });
});

describe("findMatchingTransactionsForKeyword", () => {
  const transactions = [
    { id: "txn-1", description: "UBER TRIP 123", merchant: "Uber" },
    { id: "txn-2", description: "UBER EATS ORDER", merchant: "Uber Eats" },
    { id: "txn-3", description: "STARBUCKS COFFEE", merchant: null },
    { id: "txn-4", description: "NETFLIX PREMIUM", merchant: "Netflix" },
  ];

  it("finds all transactions matching keyword", () => {
    const results = findMatchingTransactionsForKeyword(
      transactions,
      "uber",
      "cat-transport"
    );

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({ id: "txn-1", category_id: "cat-transport" });
    expect(results[1]).toEqual({ id: "txn-2", category_id: "cat-transport" });
  });

  it("returns empty array if no matches", () => {
    const results = findMatchingTransactionsForKeyword(
      transactions,
      "mcdonalds",
      "cat-food"
    );
    expect(results).toEqual([]);
  });

  it("is case-insensitive", () => {
    const results = findMatchingTransactionsForKeyword(
      transactions,
      "STARBUCKS",
      "cat-food"
    );
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("txn-3");
  });

  it("is accent-insensitive", () => {
    const accentTransactions = [
      { id: "txn-1", description: "CAFÉ PARIS", merchant: null },
      { id: "txn-2", description: "CAFE ROMA", merchant: null },
    ];

    const results = findMatchingTransactionsForKeyword(
      accentTransactions,
      "café",
      "cat-food"
    );
    expect(results).toHaveLength(2);
  });

  it("handles partial matches", () => {
    const results = findMatchingTransactionsForKeyword(
      transactions,
      "net",
      "cat-entertainment"
    );
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("txn-4");
  });

  it("searches both description and merchant", () => {
    const results = findMatchingTransactionsForKeyword(
      [{ id: "txn-1", description: "MONTHLY SUB", merchant: "Netflix" }],
      "netflix",
      "cat-entertainment"
    );
    expect(results).toHaveLength(1);
  });
});
