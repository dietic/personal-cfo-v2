/**
 * Spend Over Time Analytics API
 * GET /api/analytics/spend-over-time
 *
 * Returns spending aggregated over time periods with:
 * - Total amount per period in target currency
 * - Transaction count per period
 * - Top category for each period
 * - Respects user timezone
 * - Fills gaps with zeros
 */

import {
  fillTimeSeriesGaps,
  generatePeriodBins,
  roundToTwoDecimals,
} from "@/lib/analytics";
import { requireAuth } from "@/lib/auth";
import {
  convertCurrencyFromMinorUnits,
  fromMinorUnits,
  getExchangeRates,
  type Currency,
} from "@/lib/currency";
import { SpendOverTimeQuerySchema } from "@/lib/validators/analytics";
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
      granularity: searchParams.get("granularity") || "month",
    };

    const validation = SpendOverTimeQuerySchema.safeParse(queryParams);
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

    const { from, to, account, currency, granularity } = validation.data;

    // Get user's timezone from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("timezone")
      .eq("id", user.id)
      .single();

    const timezone =
      (profile as { timezone?: string } | null)?.timezone || "UTC";

    // Get exchange rates for currency conversion
    const rates = await getExchangeRates();

    // Parse dates
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Build query for transactions
    let query = supabase
      .from("transactions")
      .select(
        "id, amount_cents, currency, category_id, transaction_date, categories(id, name)"
      )
      .eq("user_id", user.id)
      .gte("transaction_date", from)
      .lte("transaction_date", to)
      .eq("type", "expense") // Only expenses for spending analysis
      .order("transaction_date", { ascending: true });

    // Apply optional account filter
    if (account) {
      query = query.eq("card_id", account);
    }

    const { data: transactions, error: txError } = await query;

    if (txError) {
      console.error("Error fetching transactions:", txError);
      return NextResponse.json(
        { error: true, message: "Failed to fetch transaction data" },
        { status: 500 }
      );
    }

    // Type guard for transactions
    type TransactionWithCategory = {
      id: string;
      amount_cents: number;
      currency: string;
      category_id: string | null;
      transaction_date: string;
      categories: { id: string; name: string } | null;
    };
    const typedTransactions = (transactions || []) as TransactionWithCategory[];

    // Generate all expected period bins
    const bins = generatePeriodBins(fromDate, toDate, granularity, timezone);

    // Helper function to get period start for a date
    const getPeriodStart = (dateStr: string): string => {
      const date = new Date(dateStr);
      switch (granularity) {
        case "week":
          // Start of week (Sunday)
          const dayOfWeek = date.getUTCDay();
          const weekStart = new Date(date);
          weekStart.setUTCDate(date.getUTCDate() - dayOfWeek);
          weekStart.setUTCHours(0, 0, 0, 0);
          return weekStart.toISOString();
        case "month":
          return new Date(
            Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
          ).toISOString();
        case "quarter":
          const quarterStart = Math.floor(date.getUTCMonth() / 3) * 3;
          return new Date(
            Date.UTC(date.getUTCFullYear(), quarterStart, 1)
          ).toISOString();
        default:
          return dateStr;
      }
    };

    // Aggregate transactions by period
    const periodMap = new Map<
      string,
      {
        period: string;
        amountCents: number;
        txCount: number;
        categories: Map<string, { name: string; amountCents: number }>;
      }
    >();

    for (const tx of typedTransactions) {
      const periodStart = getPeriodStart(tx.transaction_date);

      // Convert to target currency
      const amountInTarget = convertCurrencyFromMinorUnits(
        Math.abs(tx.amount_cents),
        tx.currency as Currency,
        currency,
        rates
      );

      if (!periodMap.has(periodStart)) {
        periodMap.set(periodStart, {
          period: periodStart,
          amountCents: 0,
          txCount: 0,
          categories: new Map(),
        });
      }

      const existing = periodMap.get(periodStart)!;
      existing.amountCents += amountInTarget;
      existing.txCount += 1;

      // Track top category
      const categoryData = tx.categories as unknown as {
        id: string;
        name: string;
      } | null;
      if (tx.category_id && categoryData) {
        const catId = tx.category_id;
        const catName = categoryData.name;

        if (!existing.categories.has(catId)) {
          existing.categories.set(catId, { name: catName, amountCents: 0 });
        }
        existing.categories.get(catId)!.amountCents += amountInTarget;
      }
    }

    // Build result with top category per period
    const periodData = Array.from(periodMap.values()).map((p) => {
      // Find top category for this period
      let topCategory: { id: string; name: string; amount: number } | null =
        null;
      if (p.categories.size > 0) {
        const sorted = Array.from(p.categories.entries()).sort(
          (a, b) => b[1].amountCents - a[1].amountCents
        );
        const [topId, topData] = sorted[0];
        topCategory = {
          id: topId,
          name: topData.name,
          amount: roundToTwoDecimals(fromMinorUnits(topData.amountCents)),
        };
      }

      return {
        period: p.period,
        amount: roundToTwoDecimals(fromMinorUnits(p.amountCents)),
        txCount: p.txCount,
        topCategory,
      };
    });

    // Fill gaps with zeros
    const completeData = fillTimeSeriesGaps(periodData, bins, {
      amount: 0,
      txCount: 0,
      topCategory: null,
    });

    return NextResponse.json({ success: true, data: completeData });
  } catch (error) {
    console.error("Spend over time API error:", error);
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}
