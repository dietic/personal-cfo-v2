"use client";

import { AlertsSummary } from "@/components/dashboard/alerts-summary";
import { BudgetsSnapshot } from "@/components/dashboard/budgets-snapshot";
import { CardsSummary } from "@/components/dashboard/cards-summary";
import { MonthlyExpensesSummary } from "@/components/dashboard/monthly-expenses-summary";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { RecurrentServicesSummary } from "@/components/dashboard/recurrent-services-summary";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { profile } = useAuth();

  // TODO: Replace with real data from API
  const isLoading = false;

  // Mock cards data
  const cards: Array<{
    id: string;
    name: string;
    bank_name: string;
    bank_color: string | null;
    last_four?: string;
  }> = [
    {
      id: "1",
      name: "bcp",
      bank_name: "BCP",
      bank_color: "#002855", // BCP blue
      last_four: undefined,
    },
  ];

  const alertsCount = 0;
  const budgets: Array<{
    id: string;
    category_name: string;
    emoji: string;
    amount_cents: number;
    spent_cents: number;
    currency: string;
  }> = [];
  const currentMonthExpensesCents = 0;
  const previousMonthExpensesCents = 0;
  const recurringServices: Array<{
    merchant: string;
    count: number;
    total_cents: number;
    currency: string;
  }> = [];
  const recentTransactions: Array<{
    id: string;
    merchant: string;
    description: string;
    transaction_date: string;
    category_name: string | null;
    category_emoji: string | null;
    card_name: string | null;
    currency: string;
    amount_cents: number;
    type: "income" | "expense";
  }> = [];

  return (
    <div className="space-y-6">
      <WelcomeHeader />

      {/* Cards section - full width */}
      <CardsSummary cards={cards} isLoading={isLoading} />

      {/* Summary cards grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AlertsSummary count={alertsCount} isLoading={isLoading} />
        <MonthlyExpensesSummary
          currentMonthCents={currentMonthExpensesCents}
          previousMonthCents={previousMonthExpensesCents}
          currency={profile?.primary_currency || "PEN"}
          isLoading={isLoading}
        />
        <RecurrentServicesSummary
          services={recurringServices}
          isLoading={isLoading}
        />
        <BudgetsSnapshot budgets={budgets} isLoading={isLoading} />
      </div>

      {/* Recent transactions */}
      <div className="grid gap-4">
        <RecentTransactions
          transactions={recentTransactions}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
