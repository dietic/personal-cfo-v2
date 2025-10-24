/**
 * Spend by Month for Selected Category
 * Line chart showing monthly spending trend for a single category
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsFilters } from "@/hooks/use-analytics";
import { useCategories } from "@/hooks/use-categories";
import { formatCurrency } from "@/lib/currency";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SpendByCategoryTileProps {
  filters: AnalyticsFilters;
}

interface MonthlySpendData {
  month: string;
  monthLabel: string;
  amount: number;
}

export function SpendByCategoryTile({ filters }: SpendByCategoryTileProps) {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlySpendData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get active categories for dropdown
  const activeCategories = categories.filter((c) => c.status === "active");

  // Auto-select first category when categories load
  useEffect(() => {
    if (
      activeCategories.length > 0 &&
      !selectedCategoryId &&
      !categoriesLoading
    ) {
      setSelectedCategoryId(activeCategories[0].id);
    }
  }, [activeCategories, selectedCategoryId, categoriesLoading]);

  // Fetch monthly spend data when category changes
  useEffect(() => {
    if (!selectedCategoryId || !filters.from || !filters.to) return;

    const fetchMonthlyData = async () => {
      setIsLoadingData(true);
      setError(null);

      try {
        // Fetch transactions for this category and aggregate by month
        // Extract just the date part (YYYY-MM-DD) from ISO strings
        const fromDate = filters.from.split("T")[0];
        const toDate = filters.to.split("T")[0];

        const params = new URLSearchParams({
          categoryId: selectedCategoryId,
          startDate: fromDate,
          endDate: toDate,
          // Note: We don't filter by currency here to get ALL transactions
          // We'll convert amounts when aggregating
        });

        if (filters.account) {
          params.append("cardId", filters.account);
        }

        const res = await fetch(`/api/transactions?${params}&pageSize=1000`);
        if (!res.ok) throw new Error("Failed to fetch transactions");

        const json = await res.json();
        const transactions = json.data || [];

        console.log(
          "Fetched transactions for category:",
          selectedCategoryId,
          "Count:",
          transactions.length
        );

        // Aggregate by month
        const monthMap: Record<string, number> = {};

        transactions.forEach(
          (tx: { transaction_date: string; amount_cents: number }) => {
            const date = new Date(tx.transaction_date);
            const monthKey = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;
            const amount = Math.abs(tx.amount_cents) / 100;

            if (!monthMap[monthKey]) {
              monthMap[monthKey] = 0;
            }
            monthMap[monthKey] += amount;
          }
        );

        // Convert to array and sort by month
        const monthlyArray: MonthlySpendData[] = Object.entries(monthMap)
          .map(([month, amount]) => {
            const [year, monthNum] = month.split("-");
            const date = new Date(parseInt(year), parseInt(monthNum) - 1);
            const monthLabel = date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });

            return {
              month,
              monthLabel,
              amount,
            };
          })
          .sort((a, b) => a.month.localeCompare(b.month));

        setMonthlyData(monthlyArray);
      } catch (err) {
        setError("Failed to load spending data");
        setMonthlyData([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchMonthlyData();
  }, [
    selectedCategoryId,
    filters.from,
    filters.to,
    filters.currency,
    filters.account,
  ]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const totalSpend = monthlyData.reduce((sum, m) => sum + m.amount, 0);

  if (error) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg font-semibold">
            Spend by Month
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-[300px] gap-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categoriesLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg font-semibold">
            Spend by Month
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[300px]">
            <Skeleton className="h-[250px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeCategories.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg font-semibold">
            Spend by Month
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-sm text-muted-foreground">
              No categories available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              Spend by Month
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedCategory && (
                <>
                  {selectedCategory.emoji} {selectedCategory.name} •{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(totalSpend, filters.currency)}
                  </span>
                </>
              )}
            </p>
          </div>

          {/* Category Dropdown */}
          <Select
            value={selectedCategoryId}
            onValueChange={setSelectedCategoryId}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {activeCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <span>{category.emoji}</span>
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoadingData ? (
          <div className="flex items-center justify-center h-[300px]">
            <Skeleton className="h-full w-full" />
          </div>
        ) : monthlyData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-sm text-muted-foreground">
              No spending data for this category in the selected period
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={selectedCategory?.color || "hsl(var(--primary))"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={selectedCategory?.color || "hsl(var(--primary))"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="monthLabel"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value: number) =>
                  formatCurrency(value, filters.currency, { compact: true })
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload as MonthlySpendData;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-semibold text-sm">
                          {data.monthLabel}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(data.amount, filters.currency)}
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
                stroke={selectedCategory?.color || "hsl(var(--primary))"}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
