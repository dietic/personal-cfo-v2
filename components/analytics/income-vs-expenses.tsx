/**
 * Income vs Expenses Tile
 * Beautiful stacked bar chart with net line overlay
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useIncomeVsExpenses,
  type AnalyticsFilters,
} from "@/hooks/use-analytics";
import { formatCurrency } from "@/lib/currency";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface IncomeVsExpensesTileProps {
  filters: AnalyticsFilters;
  onGranularityChange: (granularity: "week" | "month") => void;
}

export function IncomeVsExpensesTile({
  filters,
  onGranularityChange,
}: IncomeVsExpensesTileProps) {
  const { data, isLoading, error } = useIncomeVsExpenses(filters);

  // Derived values (lightweight computation)
  const totals = (data ?? []).reduce(
    (acc, d) => ({
      income: acc.income + d.income,
      expenses: acc.expenses + d.expenses,
      net: acc.net + d.net,
    }),
    { income: 0, expenses: 0, net: 0 }
  );
  const chartData = (data ?? []).map((d) => ({
    period: d.periodLabel,
    income: d.income,
    expenses: d.expenses,
    net: d.net,
  }));

  if (error) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg font-semibold">
            Income vs Expenses
          </CardTitle>
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
          <CardTitle className="text-lg font-semibold">
            Income vs Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[300px]">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg font-semibold">
            Income vs Expenses
          </CardTitle>
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

  // values computed above

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              Income vs Expenses
            </CardTitle>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Income</p>
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(totals.income, filters.currency)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Expenses
                  </p>
                  <p className="text-sm font-semibold text-red-600">
                    {formatCurrency(totals.expenses, filters.currency)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {totals.net >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Net</p>
                  <p
                    className={`text-sm font-semibold ${
                      totals.net >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(totals.net, filters.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant={filters.granularity === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => onGranularityChange("week")}
            >
              Week
            </Button>
            <Button
              variant={filters.granularity === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => onGranularityChange("month")}
            >
              Month
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={(value) =>
                formatCurrency(value, filters.currency, { compact: true })
              }
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3 space-y-1">
                      <p className="font-semibold text-sm">{data.period}</p>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <p className="text-sm">
                          Income:{" "}
                          <span className="font-semibold text-green-600">
                            {formatCurrency(data.income, filters.currency)}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <p className="text-sm">
                          Expenses:{" "}
                          <span className="font-semibold text-red-600">
                            {formatCurrency(data.expenses, filters.currency)}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t">
                        <p className="text-sm font-semibold">
                          Net:{" "}
                          <span
                            className={
                              data.net >= 0 ? "text-green-600" : "text-red-600"
                            }
                          >
                            {formatCurrency(data.net, filters.currency)}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="income"
              fill="rgb(34, 197, 94)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              fill="rgb(239, 68, 68)"
              radius={[4, 4, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
