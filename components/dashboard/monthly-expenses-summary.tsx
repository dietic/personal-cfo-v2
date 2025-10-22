"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { TrendingDown, TrendingUp } from "lucide-react";

interface MonthlyExpensesSummaryProps {
  currentMonthCents: number;
  previousMonthCents: number;
  currency: string;
  isLoading?: boolean;
}

export function MonthlyExpensesSummary({
  currentMonthCents,
  previousMonthCents,
  currency,
  isLoading,
}: MonthlyExpensesSummaryProps) {
  const { t } = useTranslation();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium md:text-sm">
            {t("dashboard.expenses.title")}
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const percentageChange =
    previousMonthCents > 0
      ? ((currentMonthCents - previousMonthCents) / previousMonthCents) * 100
      : 0;

  const isIncrease = percentageChange > 0;
  const Icon = isIncrease ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium md:text-sm">
          {t("dashboard.expenses.title")}
        </CardTitle>
        <TrendingDown className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold md:text-2xl">
          {(currentMonthCents / 100).toLocaleString("en-US", {
            style: "currency",
            currency: currency,
          })}
        </div>
        {previousMonthCents > 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            <Icon
              className={`h-3 w-3 ${
                isIncrease ? "text-destructive" : "text-green-500"
              }`}
            />
            <span
              className={`${
                isIncrease ? "text-destructive" : "text-green-500"
              }`}
            >
              {Math.abs(percentageChange).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">
              <span className="hidden sm:inline">{t("dashboard.expenses.vsLastMonth")}</span>
              <span className="sm:hidden">vs last</span>
            </span>
          </div>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {t("dashboard.expenses.currentMonth")}
        </p>
      </CardContent>
    </Card>
  );
}
