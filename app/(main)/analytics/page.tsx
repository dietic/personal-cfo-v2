/**
 * Analytics Page
 * 4-tile interactive analytics dashboard with cross-filtering
 */

"use client";

import { AccountFilter } from "@/components/analytics/account-filter";
import { CurrencyToggle } from "@/components/analytics/currency-toggle";
import { DateRangePicker } from "@/components/analytics/date-range-picker";
import type { AnalyticsFilters } from "@/hooks/use-analytics";
import type { Currency } from "@/lib/currency";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
const SpendByCategoryTile = dynamic(
  () =>
    import("@/components/analytics/spend-by-category").then(
      (m) => m.SpendByCategoryTile
    ),
  { ssr: false }
);
const SpendOverTimeTile = dynamic(
  () =>
    import("@/components/analytics/spend-over-time").then(
      (m) => m.SpendOverTimeTile
    ),
  { ssr: false }
);
const IncomeVsExpensesTile = dynamic(
  () =>
    import("@/components/analytics/income-vs-expenses").then(
      (m) => m.IncomeVsExpensesTile
    ),
  { ssr: false }
);
const NetCashflowTile = dynamic(
  () =>
    import("@/components/analytics/net-cashflow").then(
      (m) => m.NetCashflowTile
    ),
  { ssr: false }
);

export default function AnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<AnalyticsFilters>(() => {
    const now = new Date();
    const defaultFrom = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    const defaultTo = now.toISOString();

    return {
      from: searchParams.get("from") || defaultFrom,
      to: searchParams.get("to") || defaultTo,
      account: searchParams.get("account") || undefined,
      currency: (searchParams.get("currency") as Currency) || "PEN",
    };
  });

  // Independent granularity for each chart
  const [spendOverTimeGranularity, setSpendOverTimeGranularity] = useState<
    "week" | "month"
  >((searchParams.get("spendGranularity") as "week" | "month") || "month");
  const [incomeVsExpensesGranularity, setIncomeVsExpensesGranularity] =
    useState<"week" | "month">(
      (searchParams.get("incomeGranularity") as "week" | "month") || "month"
    );

  // Sync filters to URL (persistent filters)
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("from", filters.from);
    params.set("to", filters.to);
    params.set("currency", filters.currency);
    params.set("spendGranularity", spendOverTimeGranularity);
    params.set("incomeGranularity", incomeVsExpensesGranularity);
    if (filters.account) {
      params.set("account", filters.account);
    }

    router.replace(`/analytics?${params.toString()}`, { scroll: false });
  }, [filters, spendOverTimeGranularity, incomeVsExpensesGranularity, router]);

  const updateFilters = (updates: Partial<AnalyticsFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex min-h-screen flex-col space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Track your spending patterns and make data-driven decisions
          </p>
        </div>

        {/* Global Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker
            from={filters.from}
            to={filters.to}
            onChange={(from, to) => updateFilters({ from, to })}
          />
          <AccountFilter
            value={filters.account}
            onChange={(account) => updateFilters({ account })}
          />
          <CurrencyToggle
            value={filters.currency}
            onChange={(currency) => updateFilters({ currency })}
          />
        </div>
      </div>

      {/* 4-Tile Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tile 1: Spend by Category */}
        <SpendByCategoryTile filters={filters} />

        {/* Tile 2: Spend Over Time */}
        <SpendOverTimeTile
          filters={{ ...filters, granularity: spendOverTimeGranularity }}
          onGranularityChange={setSpendOverTimeGranularity}
        />

        {/* Tile 3: Income vs Expenses */}
        <IncomeVsExpensesTile
          filters={{ ...filters, granularity: incomeVsExpensesGranularity }}
          onGranularityChange={setIncomeVsExpensesGranularity}
        />

        {/* Tile 4: Net Cashflow */}
        <NetCashflowTile filters={filters} />
      </div>
    </div>
  );
}
