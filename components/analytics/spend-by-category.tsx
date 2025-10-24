/**
 * Spend by Category Tile
 * Beautiful donut chart with interactive legend
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSpendByCategory,
  type AnalyticsFilters,
} from "@/hooks/use-analytics";
import { formatCurrency } from "@/lib/currency";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface SpendByCategoryTileProps {
  filters: AnalyticsFilters;
}

export function SpendByCategoryTile({ filters }: SpendByCategoryTileProps) {
  const { data, isLoading, error } = useSpendByCategory(filters);

  if (error) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg font-semibold">
            Spending by Category
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
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[300px]">
            <Skeleton className="h-[250px] w-[250px] rounded-full" />
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
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-sm text-muted-foreground">
              No spending data for this period
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const total = data.reduce((sum, cat) => sum + cat.amount, 0);
  const chartData = data.map((cat) => ({
    name: cat.name,
    value: cat.amount,
    color: cat.color,
    pct: cat.pct,
    deltaPctPrev: cat.deltaPctPrev,
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <CardTitle className="text-lg font-semibold">
          Spending by Category
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Total:{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(total, filters.currency)}
          </span>
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload[0]) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3">
                          <p className="font-semibold text-sm">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(data.value, filters.currency)} (
                            {data.pct.toFixed(1)}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend with detailed info */}
          <div className="space-y-2 flex flex-col justify-center">
            {data.slice(0, 6).map((cat) => (
              <div
                key={cat.categoryId}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0 ring-2 ring-background group-hover:ring-accent"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm font-medium truncate">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(cat.amount, filters.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cat.pct.toFixed(1)}%
                    </p>
                  </div>
                  {cat.deltaPctPrev !== 0 && (
                    <div
                      className={`flex items-center gap-0.5 text-xs font-medium ${
                        cat.deltaPctPrev > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {cat.deltaPctPrev > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(cat.deltaPctPrev).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
            {data.length > 6 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{data.length - 6} more categories
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
