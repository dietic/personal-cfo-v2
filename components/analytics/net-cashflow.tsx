/**
 * Net Cashflow Tile
 * Stunning KPI card with delta and enhanced sparkline
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNetCashflow, type AnalyticsFilters } from "@/hooks/use-analytics";
import { formatCurrency } from "@/lib/currency";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface NetCashflowTileProps {
  filters: AnalyticsFilters;
}

export function NetCashflowTile({ filters }: NetCashflowTileProps) {
  const { data, isLoading, error } = useNetCashflow(filters);

  if (error) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg font-semibold">Net Cashflow</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-[300px] gap-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <span className="text-sm">Failed to load data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg font-semibold">Net Cashflow</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Skeleton className="h-32 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg font-semibold">Net Cashflow</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-sm text-muted-foreground">
              No data for this period
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = data.net >= 0;
  const hasDelta = data.deltaPctPrev !== 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-lg font-semibold">Net Cashflow</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Main KPI with Delta */}
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Net Cashflow
                </p>
                <div className="flex items-baseline gap-3">
                  <p
                    className={`text-4xl font-bold tracking-tight ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(Math.abs(data.net), filters.currency)}
                  </p>
                  {hasDelta && (
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold ${
                        data.deltaPctPrev > 0
                          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                      }`}
                    >
                      {data.deltaPctPrev > 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span className="text-sm">
                        {Math.abs(data.deltaPctPrev).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {hasDelta && (
              <p className="text-xs text-muted-foreground mt-2">
                vs previous period
              </p>
            )}
          </div>

          {/* Income/Expenses Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10 p-4">
              <div className="absolute top-2 right-2 opacity-10">
                <TrendingUp className="h-12 w-12" />
              </div>
              <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">
                Total Income
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                {formatCurrency(data.income, filters.currency)}
              </p>
            </div>

            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 p-4">
              <div className="absolute top-2 right-2 opacity-10">
                <TrendingDown className="h-12 w-12" />
              </div>
              <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-500">
                {formatCurrency(data.expenses, filters.currency)}
              </p>
            </div>
          </div>

          {/* Enhanced Sparkline */}
          {data.sparkline && data.sparkline.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-medium text-muted-foreground mb-3">
                Cashflow Trend
              </p>
              <div className="relative">
                {/* Zero line */}
                <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />

                {/* Bars */}
                <div className="flex items-center gap-1 h-24 relative">
                  {data.sparkline.map((point, idx) => {
                    const maxAbs = Math.max(
                      ...data.sparkline.map((p) => Math.abs(p.net)),
                      1 // Prevent division by zero
                    );
                    const percentage = (Math.abs(point.net) / maxAbs) * 100;
                    const height = Math.max(percentage * 0.4, 4); // Min 4px height
                    const isPositiveBar = point.net >= 0;

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex items-center justify-center group relative"
                      >
                        <div
                          className={`w-full rounded-sm transition-all duration-200 group-hover:opacity-80 cursor-pointer ${
                            isPositiveBar
                              ? "bg-gradient-to-t from-green-500 to-green-400"
                              : "bg-gradient-to-b from-red-500 to-red-400"
                          }`}
                          style={{
                            height: `${height}%`,
                            transform: isPositiveBar
                              ? "translateY(-50%)"
                              : "translateY(50%)",
                          }}
                          title={`${point.date}: ${formatCurrency(
                            point.net,
                            filters.currency
                          )}`}
                        />

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                          <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg px-2 py-1.5 text-xs whitespace-nowrap">
                            <p className="font-semibold">{point.date}</p>
                            <p
                              className={
                                isPositiveBar
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {formatCurrency(point.net, filters.currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
