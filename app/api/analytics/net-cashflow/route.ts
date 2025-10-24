/**
 * Net Cashflow Analytics API
 * GET /api/analytics/net-cashflow
 *
 * Returns net cashflow KPI with:
 * - Total net cashflow (income - expenses)
 * - Total income
 * - Total expenses
 * - Delta vs previous period
 * - Sparkline data (daily or weekly bins)
 */

import {
  calculatePercentageChange,
  classifyTransaction,
  getPreviousPeriod,
  getSparklineGranularity,
  roundToTwoDecimals,
} from "@/lib/analytics";
import { requireAuth } from "@/lib/auth";
import {
  convertCurrencyFromMinorUnits,
  fromMinorUnits,
  getExchangeRates,
  type Currency,
} from "@/lib/currency";
import { NetCashflowQuerySchema } from "@/lib/validators/analytics";
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

    const validation = NetCashflowQuerySchema.safeParse(queryParams);
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

    // Get exchange rates for currency conversion
    const rates = await getExchangeRates();

    // Parse dates
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Determine sparkline granularity
    const sparklineGranularity = getSparklineGranularity(fromDate, toDate);

    // Build query for current period transactions
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

    // Calculate totals for current period
    let totalIncomeCents = 0;
    let totalExpensesCents = 0;

    // Aggregate for sparkline
    const sparklineMap = new Map<string, number>();

    for (const tx of typedTransactions) {
      // Convert to target currency
      const amountInTarget = convertCurrencyFromMinorUnits(
        Math.abs(tx.amount_cents),
        tx.currency as Currency,
        currency,
        rates
      );

      // Classify transaction
      const categoryName = tx.categories?.name;
      const classification = classifyTransaction(
        { ...tx, currency: tx.currency as Currency },
        categoryName
      );

      // Update totals
      if (classification === "income") {
        totalIncomeCents += amountInTarget;
      } else {
        totalExpensesCents += amountInTarget;
      }

      // Update sparkline
      const sparklineDate = getSparklineDate(
        tx.transaction_date,
        sparklineGranularity
      );
      const currentNet = sparklineMap.get(sparklineDate) || 0;
      const contribution =
        classification === "income" ? amountInTarget : -amountInTarget;
      sparklineMap.set(sparklineDate, currentNet + contribution);
    }

    const totalIncome = fromMinorUnits(totalIncomeCents);
    const totalExpenses = fromMinorUnits(totalExpensesCents);
    const netCashflow = totalIncome - totalExpenses;

    // Get previous period data for comparison
    const prevPeriod = getPreviousPeriod(fromDate, toDate);
    let prevQuery = supabase
      .from("transactions")
      .select("id, amount_cents, currency, type, category_id, categories(name)")
      .eq("user_id", user.id)
      .gte("transaction_date", prevPeriod.from.toISOString())
      .lte("transaction_date", prevPeriod.to.toISOString());

    if (account) {
      prevQuery = prevQuery.eq("card_id", account);
    }

    const { data: prevTransactions } = await prevQuery;

    // Calculate previous period net
    let prevIncomeCents = 0;
    let prevExpensesCents = 0;

    for (const tx of (prevTransactions || []) as TransactionWithCategory[]) {
      const amountInTarget = convertCurrencyFromMinorUnits(
        Math.abs(tx.amount_cents),
        tx.currency as Currency,
        currency,
        rates
      );

      const categoryName = tx.categories?.name;
      const classification = classifyTransaction(
        { ...tx, currency: tx.currency as Currency },
        categoryName
      );

      if (classification === "income") {
        prevIncomeCents += amountInTarget;
      } else {
        prevExpensesCents += amountInTarget;
      }
    }

    const prevNet = fromMinorUnits(prevIncomeCents - prevExpensesCents);
    const deltaPctPrev = calculatePercentageChange(netCashflow, prevNet);

    // Build sparkline array
    const sparkline = Array.from(sparklineMap.entries())
      .map(([date, netCents]) => ({
        date,
        net: roundToTwoDecimals(fromMinorUnits(netCents)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      data: {
        net: roundToTwoDecimals(netCashflow),
        income: roundToTwoDecimals(totalIncome),
        expenses: roundToTwoDecimals(totalExpenses),
        deltaPctPrev: roundToTwoDecimals(deltaPctPrev),
        sparkline,
      },
    });
  } catch (error) {
    console.error("Net cashflow API error:", error);
    return NextResponse.json(
      { error: true, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Get sparkline date bucket for a transaction date
 */
function getSparklineDate(
  dateStr: string,
  granularity: "day" | "week"
): string {
  const date = new Date(dateStr);

  if (granularity === "day") {
    // Return start of day
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    ).toISOString();
  } else {
    // Return start of week (Sunday)
    const dayOfWeek = date.getUTCDay();
    const weekStart = new Date(date);
    weekStart.setUTCDate(date.getUTCDate() - dayOfWeek);
    weekStart.setUTCHours(0, 0, 0, 0);
    return weekStart.toISOString();
  }
}
