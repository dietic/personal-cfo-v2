"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import Link from "next/link";

interface Budget {
  id: string;
  category_name: string;
  emoji: string;
  amount_cents: number;
  spent_cents: number;
  currency: string;
}

interface BudgetsSnapshotProps {
  budgets: Budget[];
  isLoading?: boolean;
}

export function BudgetsSnapshot({ budgets, isLoading }: BudgetsSnapshotProps) {
  if (isLoading) {
    return (
      <Card className="sm:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budgets</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-2 w-full animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topBudgets = budgets.slice(0, 3);

  return (
    <Card className="sm:col-span-2 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Budgets</CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {topBudgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 md:py-8">
            <p className="text-xs text-muted-foreground md:text-sm">
              No budgets set yet
            </p>
            <Link href="/budgets">
              <Button variant="outline" size="sm" className="mt-3 md:mt-4">
                Create Budget
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {topBudgets.map((budget) => {
              const percentage = Math.min(
                (budget.spent_cents / budget.amount_cents) * 100,
                100
              );
              const isOverBudget = budget.spent_cents > budget.amount_cents;

              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <span className="text-sm md:text-base">
                        {budget.emoji}
                      </span>
                      <span className="text-xs font-medium md:text-sm">
                        {budget.category_name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground md:text-sm">
                      {(budget.spent_cents / 100).toLocaleString("en-US", {
                        style: "currency",
                        currency: budget.currency,
                      })}{" "}
                      /{" "}
                      {(budget.amount_cents / 100).toLocaleString("en-US", {
                        style: "currency",
                        currency: budget.currency,
                      })}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full transition-all ${
                        isOverBudget
                          ? "bg-destructive"
                          : percentage >= 80
                          ? "bg-orange-500"
                          : "bg-primary"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <Link href="/budgets">
              <Button variant="ghost" size="sm" className="mt-2 w-full">
                View All Budgets
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
