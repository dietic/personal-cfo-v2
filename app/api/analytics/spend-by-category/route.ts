/**
 * Spend by Category Analytics API
 * GET /api/analytics/    // Build query for transactions
    let query = supabase
      .from("transactions")
      .select("id, amount_cents, currency, category_id, categories(id, name, color)")
      .eq("user_id", user.id)
      .gte("transaction_date", from)
      .lte("transaction_date", to)
      .eq("type", "expense"); // Only expenses for spending analysisategory
 *
 * Returns spending aggregated by category for a given period with:
 * - Amount per category in target currency
 * - Percentage of total spend
 * - Change vs previous period
 * - Transaction count
 */
export const runtime = "nodejs";

import {
  calculatePercentageChange,
  getPreviousPeriod,
  roundToTwoDecimals,
} from "@/lib/analytics";
import { requireAuth } from "@/lib/auth";
import { analyticsCacheKey, withCache } from "@/lib/cache";
import {
  convertCurrencyFromMinorUnits,
  fromMinorUnits,
  getExchangeRates,
  type Currency,
} from "@/lib/currency";
import { logger } from "@/lib/logger";
import { SpendByCategoryQuerySchema } from "@/lib/validators/analytics";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { user, supabase } = await requireAuth();

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      from: searchParams.get("from"),
      to: searchParams.get("to"),
      account: searchParams.get("account") || undefined,
      currency: searchParams.get("currency"),
    };

    const validation = SpendByCategoryQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: true,
          message: "Invalid query parameters",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { from, to, account, currency } = validation.data;

    const cacheKey = analyticsCacheKey({
      userId: user.id,
      endpoint: "spend-by-category",
      params: { from, to, account: account || "", currency },
    });

    const compute = async () => {
      // Get exchange rates for currency conversion
      const rates = await getExchangeRates();

      // Parse dates
      const fromDate = new Date(from);
      const toDate = new Date(to);

      // Build query for current period
      let query = supabase
        .from("transactions")
        .select(
          "id, amount_cents, currency, category_id, categories(id, name, color, status)"
        )
        .eq("user_id", user.id)
        .gte("transaction_date", from)
        .lte("transaction_date", to)
        .eq("type", "expense"); // Only expenses for spending analysis

      // Apply optional account filter
      if (account) {
        query = query.eq("card_id", account);
      }

      const { data: transactions, error: txError } = await query;

      if (txError) {
        throw new Error(`Failed to fetch transaction data: ${txError.message}`);
      }

      // Type guard for transactions
      type TransactionWithCategory = {
        id: string;
        amount_cents: number;
        currency: string;
        category_id: string | null;
        categories: {
          id: string;
          name: string;
          color: string;
          status: string;
        } | null;
      };
      const typedTransactions = (transactions ||
        []) as TransactionWithCategory[];

      // Get previous period data for comparison
      const prevPeriod = getPreviousPeriod(fromDate, toDate);
      let prevQuery = supabase
        .from("transactions")
        .select("id, amount_cents, currency, category_id")
        .eq("user_id", user.id)
        .gte("transaction_date", prevPeriod.from.toISOString())
        .lte("transaction_date", prevPeriod.to.toISOString())
        .eq("type", "expense");

      if (account) {
        prevQuery = prevQuery.eq("card_id", account);
      }

      const { data: prevTransactions, error: prevError } = await prevQuery;

      if (prevError) {
        // Non-fatal: continue without comparison
        logger.warn("Error fetching previous period transactions", {
          prevError,
        });
      }

      // Aggregate by category for current period
      const categoryMap = new Map<
        string,
        {
          categoryId: string;
          name: string;
          color: string;
          amountCents: number;
          txCount: number;
        }
      >();

      for (const tx of typedTransactions) {
        const categoryId = tx.category_id || "uncategorized";
        const categoryData = tx.categories;
        const categoryName = categoryData?.name || "Uncategorized";
        const categoryColor = categoryData?.color || "#6B7280"; // Default gray

        // Convert to target currency
        const amountInTarget = convertCurrencyFromMinorUnits(
          Math.abs(tx.amount_cents), // Absolute value for expenses
          tx.currency as Currency,
          currency,
          rates
        );

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            categoryId,
            name: categoryName,
            color: categoryColor,
            amountCents: 0,
            txCount: 0,
          });
        }

        const existing = categoryMap.get(categoryId)!;
        existing.amountCents += amountInTarget;
        existing.txCount += 1;
      }

      // Calculate total for percentages
      const totalAmountCents = Array.from(categoryMap.values()).reduce(
        (sum, cat) => sum + cat.amountCents,
        0
      );

      // Aggregate previous period by category
      type PrevTransaction = {
        id: string;
        amount_cents: number;
        currency: string;
        category_id: string | null;
      };
      const prevCategoryMap = new Map<string, number>();
      for (const tx of (prevTransactions || []) as PrevTransaction[]) {
        const categoryId = tx.category_id || "uncategorized";
        const amountInTarget = convertCurrencyFromMinorUnits(
          Math.abs(tx.amount_cents),
          tx.currency as Currency,
          currency,
          rates
        );

        prevCategoryMap.set(
          categoryId,
          (prevCategoryMap.get(categoryId) || 0) + amountInTarget
        );
      }

      // Build response with percentages and deltas
      const result = Array.from(categoryMap.values()).map((cat) => {
        const amount = fromMinorUnits(cat.amountCents);
        const pct =
          totalAmountCents > 0 ? (cat.amountCents / totalAmountCents) * 100 : 0;

        const prevAmountCents = prevCategoryMap.get(cat.categoryId) || 0;
        const prevAmount = fromMinorUnits(prevAmountCents);
        const deltaPctPrev = calculatePercentageChange(amount, prevAmount);

        return {
          categoryId: cat.categoryId,
          name: cat.name,
          color: cat.color,
          amount: roundToTwoDecimals(amount),
          pct: roundToTwoDecimals(pct),
          deltaPctPrev: roundToTwoDecimals(deltaPctPrev),
          txCount: cat.txCount,
        };
      });

      // Sort by amount descending
      result.sort((a, b) => b.amount - a.amount);

      return result;
    };

    const data = await withCache(cacheKey, 60_000, compute);

    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": "private, max-age=60" } }
    );
  } catch (err) {
    logger.error("Spend by category API error", { err });
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}
