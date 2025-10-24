/**
 * Context Builder for AI Chat
 * Builds user financial context from last 6 months of transactions
 */

// @ts-nocheck - Supabase types are complex, will fix in type refinement pass
/* eslint-disable @typescript-eslint/no-explicit-any */

import { getSupabaseAdmin } from "@/lib/supabase";

export interface UserFinancialContext {
  summary: {
    totalSpend: number;
    totalIncome: number;
    netCashflow: number;
    currency: string;
    timezone: string;
  };
  spendByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  spendByMonth: Array<{
    month: string;
    amount: number;
  }>;
  budgets: Array<{
    category: string;
    allocated: number;
    spent: number;
    remaining: number;
    progress: number;
  }>;
  topMerchants: Array<{
    merchant: string;
    amount: number;
  }>;
  recentTransactions: Array<{
    date: string;
    description: string;
    amount: number;
    category: string;
  }>;
}

/**
 * Build financial context for a user (last 6 months)
 * Optimized to minimize token usage (~2,000-3,000 tokens)
 */
export async function buildUserContext(
  userId: string
): Promise<UserFinancialContext> {
  const supabase = getSupabaseAdmin();

  // Get user profile for currency and timezone
  const { data: profile } = await supabase
    .from("profiles")
    .select("primary_currency, timezone")
    .eq("id", userId)
    .single();

  const primaryCurrency = profile?.primary_currency || "PEN";
  const timezone = profile?.timezone || "America/Lima";

  // Calculate date range (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sixMonthsAgoISO = sixMonthsAgo.toISOString().split("T")[0];

  // Fetch last 6 months of transactions (limit 1000)
  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      id,
      amount_cents,
      currency,
      transaction_date,
      description,
      merchant,
      type,
      category_id,
      categories (name)
    `
    )
    .eq("user_id", userId)
    .gte("transaction_date", sixMonthsAgoISO)
    .order("transaction_date", { ascending: false })
    .limit(1000);

  const txs = transactions || [];

  // Calculate summary
  let totalSpend = 0;
  let totalIncome = 0;

  txs.forEach((tx) => {
    const amount = tx.amount_cents / 100;
    if (tx.type === "income" || amount > 0) {
      totalIncome += Math.abs(amount);
    } else {
      totalSpend += Math.abs(amount);
    }
  });

  const netCashflow = totalIncome - totalSpend;

  // Aggregate spend by category
  const categoryMap = new Map<string, number>();
  txs.forEach((tx) => {
    if (tx.type === "expense" || tx.amount_cents < 0) {
      const categoryName = tx.categories?.name || "Uncategorized";
      const amount = Math.abs(tx.amount_cents / 100);
      categoryMap.set(
        categoryName,
        (categoryMap.get(categoryName) || 0) + amount
      );
    }
  });

  const spendByCategory = Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpend > 0 ? (amount / totalSpend) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Aggregate spend by month
  const monthMap = new Map<string, number>();
  txs.forEach((tx) => {
    if (tx.type === "expense" || tx.amount_cents < 0) {
      const month = tx.transaction_date.substring(0, 7); // YYYY-MM
      const amount = Math.abs(tx.amount_cents / 100);
      monthMap.set(month, (monthMap.get(month) || 0) + amount);
    }
  });

  const spendByMonth = Array.from(monthMap.entries())
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  // Get active budgets
  const { data: budgetData } = await supabase
    .from("budgets")
    .select(
      `
      amount_cents,
      currency,
      category_id,
      categories (name)
    `
    )
    .eq("user_id", userId)
    .eq("active", true);

  const budgets =
    budgetData?.map((b) => {
      const categoryName = b.categories?.name || "Unknown";
      const allocated = b.amount_cents / 100;
      const spent =
        txs
          .filter(
            (tx) =>
              tx.category_id === b.category_id &&
              (tx.type === "expense" || tx.amount_cents < 0)
          )
          .reduce((sum, tx) => sum + Math.abs(tx.amount_cents / 100), 0) || 0;
      const remaining = Math.max(0, allocated - spent);
      const progress = allocated > 0 ? (spent / allocated) * 100 : 0;

      return {
        category: categoryName,
        allocated,
        spent,
        remaining,
        progress,
      };
    }) || [];

  // Get top merchants
  const merchantMap = new Map<string, number>();
  txs.forEach((tx) => {
    if (tx.merchant && (tx.type === "expense" || tx.amount_cents < 0)) {
      const amount = Math.abs(tx.amount_cents / 100);
      merchantMap.set(
        tx.merchant,
        (merchantMap.get(tx.merchant) || 0) + amount
      );
    }
  });

  const topMerchants = Array.from(merchantMap.entries())
    .map(([merchant, amount]) => ({ merchant, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Get recent transactions (last 10)
  const recentTransactions = txs.slice(0, 10).map((tx) => ({
    date: tx.transaction_date,
    description: tx.description || tx.merchant || "Unknown",
    amount: tx.amount_cents / 100,
    category: tx.categories?.name || "Uncategorized",
  }));

  return {
    summary: {
      totalSpend,
      totalIncome,
      netCashflow,
      currency: primaryCurrency,
      timezone,
    },
    spendByCategory,
    spendByMonth,
    budgets,
    topMerchants,
    recentTransactions,
  };
}

/**
 * Format context as a concise JSON string for AI (minimize tokens)
 */
export function formatContextForAI(context: UserFinancialContext): string {
  return JSON.stringify(
    {
      summary: context.summary,
      topCategories: context.spendByCategory.slice(0, 5),
      monthlyTrend: context.spendByMonth,
      budgets: context.budgets.slice(0, 5),
      topMerchants: context.topMerchants.slice(0, 5),
      recentTx: context.recentTransactions.slice(0, 5),
    },
    null,
    0
  );
}
