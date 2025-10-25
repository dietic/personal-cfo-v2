/**
 * Analytics Utilities
 * Helper functions for analytics calculations, aggregations, and conversions
 */

import type { Currency, ExchangeRates } from "./currency";
import { convertCurrencyFromMinorUnits, fromMinorUnits } from "./currency";

/**
 * Transaction data structure from database
 */
export interface Transaction {
  id: string;
  amount_cents: number;
  currency: Currency;
  transaction_date: string;
  category_id: string | null;
  type: "income" | "expense";
}

/**
 * Category data structure
 */
export interface Category {
  id: string;
  name: string;
  color: string;
}

/**
 * Convert transaction amount to target currency
 */
export function convertTransactionAmount(
  transaction: Transaction,
  targetCurrency: Currency,
  rates: ExchangeRates
): number {
  if (transaction.currency === targetCurrency) {
    return fromMinorUnits(transaction.amount_cents);
  }

  return (
    convertCurrencyFromMinorUnits(
      transaction.amount_cents,
      transaction.currency,
      targetCurrency,
      rates
    ) / 100
  ); // convertCurrencyFromMinorUnits returns minor units, we need major
}

/**
 * Calculate previous period date range
 * Returns { from, to } for the period immediately preceding the given range
 */
export function getPreviousPeriod(
  from: Date,
  to: Date
): { from: Date; to: Date } {
  const durationMs = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1); // 1ms before current period starts
  const prevFrom = new Date(prevTo.getTime() - durationMs);
  return { from: prevFrom, to: prevTo };
}

/**
 * Calculate percentage change between two values
 * Returns null if previous is 0
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Determine period granularity based on date range
 * < 7 days: daily
 * >= 7 days: weekly
 */
export function getSparklineGranularity(from: Date, to: Date): "day" | "week" {
  const durationDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
  return durationDays < 7 ? "day" : "week";
}

/**
 * Generate date bins for a period
 * @param from Start date
 * @param to End date
 * @param granularity 'day', 'week', 'month', 'quarter'
 * @returns Array of period start dates as ISO strings
 */
export function generatePeriodBins(
  from: Date,
  to: Date,
  granularity: "day" | "week" | "month" | "quarter"
): string[] {
  const bins: string[] = [];

  // Align the starting point to the beginning of the selected period so that
  // the bin keys match the keys produced by getPeriodStart() in the APIs.
  // This was causing all-zero series because bins started at the raw `from`
  // timestamp (e.g., 24th of the month) while aggregation used month-start
  // (e.g., 1st of the month), leading to mismatched keys.
  const start = new Date(from);
  switch (granularity) {
    case "day": {
      // Normalize to 00:00:00 UTC of the same day
      start.setUTCHours(0, 0, 0, 0);
      break;
    }
    case "week": {
      // Start of week (Sunday) at 00:00:00 UTC
      const dayOfWeek = start.getUTCDay();
      start.setUTCDate(start.getUTCDate() - dayOfWeek);
      start.setUTCHours(0, 0, 0, 0);
      break;
    }
    case "month": {
      // First day of the month at 00:00:00 UTC
      const y = start.getUTCFullYear();
      const m = start.getUTCMonth();
      start.setTime(Date.UTC(y, m, 1, 0, 0, 0, 0));
      break;
    }
    case "quarter": {
      // First day of the quarter at 00:00:00 UTC
      const y = start.getUTCFullYear();
      const qStart = Math.floor(start.getUTCMonth() / 3) * 3;
      start.setTime(Date.UTC(y, qStart, 1, 0, 0, 0, 0));
      break;
    }
  }

  const current = start;
  while (current <= to) {
    bins.push(current.toISOString());

    // Increment based on granularity
    switch (granularity) {
      case "day":
        current.setUTCDate(current.getUTCDate() + 1);
        break;
      case "week":
        current.setUTCDate(current.getUTCDate() + 7);
        break;
      case "month":
        current.setUTCMonth(current.getUTCMonth() + 1);
        break;
      case "quarter":
        current.setUTCMonth(current.getUTCMonth() + 3);
        break;
    }
  }

  return bins;
}

/**
 * Fill gaps in time series data with zero values
 * @param data Existing data points with period and amount
 * @param bins All expected period bins
 * @returns Complete array with gaps filled
 */
export function fillTimeSeriesGaps<
  T extends { period: string; amount?: number }
>(data: T[], bins: string[], defaultValues?: Partial<T>): T[] {
  const dataMap = new Map(data.map((d) => [d.period, d]));

  return bins.map((period) => {
    if (dataMap.has(period)) {
      return dataMap.get(period)!;
    }
    // Create zero-filled entry
    return {
      period,
      amount: 0,
      ...defaultValues,
    } as T;
  });
}

/**
 * Classify transaction as income or expense
 * Income: amount > 0 OR category has "income" in name (case-insensitive)
 * Expense: everything else
 */
export function classifyTransaction(
  transaction: Transaction,
  categoryName?: string
): "income" | "expense" {
  // Check explicit type first
  if (transaction.type === "income") return "income";
  if (transaction.type === "expense") return "expense";

  // Check amount (positive = income)
  if (transaction.amount_cents > 0) return "income";

  // Check category name
  if (categoryName && categoryName.toLowerCase().includes("income")) {
    return "income";
  }

  return "expense";
}

/**
 * Calculate statistics for a set of values
 */
export function calculateStats(values: number[]): {
  sum: number;
  avg: number;
  min: number;
  max: number;
  count: number;
} {
  if (values.length === 0) {
    return { sum: 0, avg: 0, min: 0, max: 0, count: 0 };
  }

  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { sum, avg, min, max, count: values.length };
}

/**
 * Detect unusual spending spike
 * @param amount Current amount
 * @param rollingAvg Rolling average of recent amounts
 * @param factor Threshold factor (e.g., 2.0 = 200%)
 * @returns true if amount > rollingAvg * factor
 */
export function isUnusualSpike(
  amount: number,
  rollingAvg: number,
  factor: number = 2.0
): boolean {
  if (rollingAvg === 0) return false;
  return amount > rollingAvg * factor;
}

/**
 * Format period label based on granularity
 * For display purposes in UI
 * - Week: W1, W2, W3, etc. (week number in month)
 * - Month: Jan 2025, Feb 2025, etc.
 * - Quarter: Q1 2025, Q2 2025, etc.
 */
export function formatPeriodLabel(
  periodISOString: string,
  granularity: "week" | "month" | "quarter",
  allPeriods?: string[]
): string {
  const date = new Date(periodISOString);

  switch (granularity) {
    case "week": {
      // Calculate week number within the month
      if (allPeriods) {
        // Get all weeks in the same month
        const weeksInMonth = allPeriods.filter((p) => {
          const pDate = new Date(p);
          return (
            pDate.getUTCFullYear() === date.getUTCFullYear() &&
            pDate.getUTCMonth() === date.getUTCMonth()
          );
        });
        const weekIndex = weeksInMonth.indexOf(periodISOString);
        if (weekIndex >= 0) {
          return `W${weekIndex + 1}`;
        }
      }
      // Fallback: calculate week of month
      const firstDayOfMonth = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
      );
      const weekOfMonth = Math.ceil(
        (date.getUTCDate() + firstDayOfMonth.getUTCDay()) / 7
      );
      return `W${weekOfMonth}`;
    }
    case "month": {
      const year = date.getUTCFullYear();
      const month = date.toLocaleString("en-US", {
        month: "short",
        timeZone: "UTC",
      });
      return `${month} ${year}`;
    }
    case "quarter": {
      const year = date.getUTCFullYear();
      const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
      return `Q${quarter} ${year}`;
    }
    default:
      return periodISOString;
  }
}

/**
 * Round to 2 decimal places
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
