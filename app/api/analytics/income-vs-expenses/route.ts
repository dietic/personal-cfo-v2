/**
 * Income vs Expenses Analytics API
 * GET /api/analytics/income-vs-expenses
 *
 * Returns income and expenses aggregated by period with:
 * - Income amount (positive magnitude)
 * - Expenses amount (positive magnitude)
 * - Net cashflow (income - expenses)
 * - Respects user timezone
 * - Fills gaps with zeros
 */

import {
  classifyTransaction,
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
import { IncomeVsExpensesQuerySchema } from "@/lib/validators/analytics";
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

    const validation = IncomeVsExpensesQuerySchema.safeParse(queryParams);
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

    // Build query for transactions (all types)
    let query = supabase
      .from("transactions")
      .select(
        "id, amount_cents, currency, type, transaction_date, category_id, categories(name)"
      )
      .eq("user_id", user.id)
      .gte("transaction_date", from)
      .lte("transaction_date", to)
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
      type: "income" | "expense";
      transaction_date: string;
      category_id: string | null;
      categories: { name: string } | null;
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
        incomeCents: number;
        expensesCents: number;
      }
    >();

    for (const tx of typedTransactions) {
      const periodStart = getPeriodStart(tx.transaction_date);

      // Convert to target currency
      const amountInTarget = convertCurrencyFromMinorUnits(
        Math.abs(tx.amount_cents), // Always use absolute value
        tx.currency as Currency,
        currency,
        rates
      );

      if (!periodMap.has(periodStart)) {
        periodMap.set(periodStart, {
          period: periodStart,
          incomeCents: 0,
          expensesCents: 0,
        });
      }

      const existing = periodMap.get(periodStart)!;

      // Classify transaction as income or expense
      const categoryName = tx.categories?.name;
      const classification = classifyTransaction(
        { ...tx, currency: tx.currency as Currency },
        categoryName
      );

      if (classification === "income") {
        existing.incomeCents += amountInTarget;
      } else {
        existing.expensesCents += amountInTarget;
      }
    }

    // Build result with income, expenses, and net
    const periodData = Array.from(periodMap.values()).map((p) => {
      const income = fromMinorUnits(p.incomeCents);
      const expenses = fromMinorUnits(p.expensesCents);
      const net = income - expenses;

      return {
        period: p.period,
        income: roundToTwoDecimals(income),
        expenses: roundToTwoDecimals(expenses),
        net: roundToTwoDecimals(net),
      };
    });

    // Fill gaps with zeros
    const completeData = fillTimeSeriesGaps(periodData, bins, {
      income: 0,
      expenses: 0,
      net: 0,
    });

    return NextResponse.json({ success: true, data: completeData });
  } catch (error) {
    console.error("Income vs expenses API error:", error);
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}
