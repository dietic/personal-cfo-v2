"use client";

import { BudgetsSnapshot } from "@/components/dashboard/budgets-snapshot";
import { CardsSummary } from "@/components/dashboard/cards-summary";
import { MonthlyExpensesSummary } from "@/components/dashboard/monthly-expenses-summary";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { WelcomeHeader } from "@/components/dashboard/welcome-header";
import { useAuth } from "@/hooks/use-auth";
import { useCards } from "@/hooks/use-cards";
import { useEffect, useState } from "react";

interface Budget {
  id: string;
  category_name: string;
  emoji: string;
  amount_cents: number;
  spent_cents: number;
  currency: string;
}

interface Transaction {
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
}

export default function DashboardPage() {
  const { profile } = useAuth();

  // Cards from API
  const { cards: userCards, isLoading: cardsLoading } = useCards();
  const cards: Array<{
    id: string;
    name: string;
    bank_name: string;
    bank_color: string | null;
    last_four?: string;
  }> = (userCards || []).map((c) => ({
    id: c.id,
    name: c.name,
    bank_name: c.banks?.name ?? "",
    bank_color: c.banks?.brand_color ?? null,
  }));

  // Budgets state
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetsLoading, setBudgetsLoading] = useState(true);

  // Recent transactions state
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  const currentMonthExpensesCents = 0;
  const previousMonthExpensesCents = 0;

  // Fetch budgets
  useEffect(() => {
    async function fetchBudgets() {
      try {
        setBudgetsLoading(true);
        // TODO: Replace with actual budgets API endpoint when available
        // const response = await fetch("/api/budgets");
        // const data = await response.json();
        // setBudgets(data.data || []);
        setBudgets([]);
      } catch (error) {
        console.error("Failed to fetch budgets:", error);
        setBudgets([]);
      } finally {
        setBudgetsLoading(false);
      }
    }

    fetchBudgets();
  }, []);

  // Fetch recent transactions
  useEffect(() => {
    async function fetchRecentTransactions() {
      try {
        setTransactionsLoading(true);
        const response = await fetch("/api/transactions?pageSize=5&page=1");
        const result = await response.json();

        if (result.success && result.data) {
          // Map API response to component format
          const mapped: Transaction[] = result.data.map(
            (tx: {
              id: string;
              merchant?: string;
              description?: string;
              transaction_date: string;
              categories?: { name: string; emoji: string } | null;
              cards?: { name: string } | null;
              currency: string;
              amount_cents: number;
              type: "income" | "expense";
            }) => ({
              id: tx.id,
              merchant: tx.merchant || "",
              description: tx.description || "",
              transaction_date: tx.transaction_date,
              category_name: tx.categories?.name || null,
              category_emoji: tx.categories?.emoji || null,
              card_name: tx.cards?.name || null,
              currency: tx.currency,
              amount_cents: Math.abs(tx.amount_cents),
              type: tx.type,
            })
          );
          setRecentTransactions(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch recent transactions:", error);
        setRecentTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    }

    fetchRecentTransactions();
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
      <WelcomeHeader />

      {/* Cards section - full width */}
      <CardsSummary cards={cards} isLoading={cardsLoading} />

      {/* Monthly expenses summary */}
      <MonthlyExpensesSummary
        currentMonthCents={currentMonthExpensesCents}
        previousMonthCents={previousMonthExpensesCents}
        currency={profile?.primary_currency || "PEN"}
        isLoading={cardsLoading}
      />

      {/* Budgets and Recent Transactions - same row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BudgetsSnapshot budgets={budgets} isLoading={budgetsLoading} />
        <RecentTransactions
          transactions={recentTransactions}
          isLoading={transactionsLoading}
        />
      </div>
    </div>
  );
}
