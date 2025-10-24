/**
 * Analytics Hook
 * Data fetching and state management for analytics endpoints
 */

"use client";

import type { Currency } from "@/lib/currency";
import { useQuery } from "@tanstack/react-query";

export interface AnalyticsFilters {
  from: string;
  to: string;
  account?: string;
  currency: Currency;
  granularity?: "week" | "month" | "quarter";
}

export interface SpendByCategoryData {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  pct: number;
  deltaPctPrev: number;
  txCount: number;
}

export interface SpendOverTimeData {
  period: string;
  periodLabel: string;
  amount: number;
  txCount: number;
  topCategory: {
    id: string;
    name: string;
    amount: number;
  } | null;
}

export interface IncomeVsExpensesData {
  period: string;
  periodLabel: string;
  income: number;
  expenses: number;
  net: number;
}

export interface NetCashflowData {
  net: number;
  income: number;
  expenses: number;
  deltaPctPrev: number;
  sparkline: Array<{
    date: string;
    net: number;
  }>;
}

/**
 * Fetch spending by category
 */
export function useSpendByCategory(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", "spend-by-category", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: filters.from,
        to: filters.to,
        currency: filters.currency,
      });

      if (filters.account) {
        params.append("account", filters.account);
      }

      const res = await fetch(`/api/analytics/spend-by-category?${params}`);
      if (!res.ok) throw new Error("Failed to fetch spending by category");

      const json = await res.json();
      return json.data as SpendByCategoryData[];
    },
    enabled: !!(filters.from && filters.to && filters.currency),
  });
}

/**
 * Fetch spending over time
 */
export function useSpendOverTime(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", "spend-over-time", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: filters.from,
        to: filters.to,
        currency: filters.currency,
        granularity: filters.granularity || "month",
      });

      if (filters.account) {
        params.append("account", filters.account);
      }

      const res = await fetch(`/api/analytics/spend-over-time?${params}`);
      if (!res.ok) throw new Error("Failed to fetch spending over time");

      const json = await res.json();
      return json.data as SpendOverTimeData[];
    },
    enabled: !!(filters.from && filters.to && filters.currency),
  });
}

/**
 * Fetch income vs expenses
 */
export function useIncomeVsExpenses(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", "income-vs-expenses", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: filters.from,
        to: filters.to,
        currency: filters.currency,
        granularity: filters.granularity || "month",
      });

      if (filters.account) {
        params.append("account", filters.account);
      }

      const res = await fetch(`/api/analytics/income-vs-expenses?${params}`);
      if (!res.ok) throw new Error("Failed to fetch income vs expenses");

      const json = await res.json();
      return json.data as IncomeVsExpensesData[];
    },
    enabled: !!(filters.from && filters.to && filters.currency),
  });
}

/**
 * Fetch net cashflow
 */
export function useNetCashflow(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ["analytics", "net-cashflow", filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: filters.from,
        to: filters.to,
        currency: filters.currency,
      });

      if (filters.account) {
        params.append("account", filters.account);
      }

      const res = await fetch(`/api/analytics/net-cashflow?${params}`);
      if (!res.ok) throw new Error("Failed to fetch net cashflow");

      const json = await res.json();
      return json.data as NetCashflowData;
    },
    enabled: !!(filters.from && filters.to && filters.currency),
  });
}
