/**
 * Spend Over Time Tile
 * Beautiful area chart with moving average
 */

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpendOverTime, type AnalyticsFilters } from "@/hooks/use-analytics";
import { formatCurrency } from "@/lib/currency";
import { AlertCircle } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SpendOverTimeTileProps {
  filters: AnalyticsFilters;
  onGranularityChange: (granularity: "week" | "month") => void;
}

export function SpendOverTimeTile({
  filters,
  onGranularityChange,
}: SpendOverTimeTileProps) {
  const { data, isLoading, error } = useSpendOverTime(filters);

  // Derived values (lightweight computation)
  const total = (data ?? []).reduce((sum, d) => sum + d.amount, 0);
  const avg = data && data.length > 0 ? total / data.length : 0;
  const chartData = (data ?? []).map((d) => ({
    period: d.periodLabel,
    amount: d.amount,
    average: avg,
  }));

  if (error) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg font-semibold">
            Spending Over Time
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
            Spending Over Time
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
            Spending Over Time
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
              Spending Over Time
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm text-muted-foreground">
                Total:{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(total, filters.currency)}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Avg:{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(avg, filters.currency)}
                </span>
              </p>
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
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
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
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-semibold text-sm">{data.period}</p>
                      <p className="text-sm text-muted-foreground">
                        Amount:{" "}
                        <span className="font-semibold text-foreground">
                          {formatCurrency(data.amount, filters.currency)}
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorAmount)"
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              strokeWidth={1}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
