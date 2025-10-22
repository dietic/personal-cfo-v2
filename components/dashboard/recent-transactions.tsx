"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { Receipt } from "lucide-react";
import Link from "next/link";

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

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function RecentTransactions({
  transactions,
  isLoading,
}: RecentTransactionsProps) {
  const { t } = useTranslation();
  
  if (isLoading) {
    return (
      <Card className="lg:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium md:text-sm">
            {t("dashboard.transactions.title")}
          </CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium md:text-sm">
          {t("dashboard.transactions.title")}
        </CardTitle>
        <Receipt className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <Receipt className="mb-3 h-10 w-10 text-muted-foreground md:mb-4 md:h-12 md:w-12" />
            <p className="text-xs text-muted-foreground md:text-sm">
              {t("dashboard.transactions.noTransactions")}
            </p>
            <Link href="/statements">
              <Button variant="outline" size="sm" className="mt-3 md:mt-4">
                {t("dashboard.transactions.uploadStatement")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between gap-2 rounded-lg p-2 transition-colors hover:bg-muted/50 md:gap-3 md:p-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted md:h-10 md:w-10">
                    {transaction.category_emoji ? (
                      <span className="text-base md:text-lg">
                        {transaction.category_emoji}
                      </span>
                    ) : (
                      <Receipt className="h-3 w-3 text-muted-foreground md:h-4 md:w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium md:text-sm">
                      {transaction.merchant || transaction.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground md:gap-2 md:text-xs">
                      <span>
                        {new Date(
                          transaction.transaction_date
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {transaction.category_name && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">
                            {transaction.category_name}
                          </span>
                        </>
                      )}
                      {transaction.card_name && (
                        <>
                          <span className="hidden md:inline">•</span>
                          <span className="hidden md:inline">
                            {transaction.card_name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p
                    className={`text-xs font-semibold md:text-sm ${
                      transaction.type === "income"
                        ? "text-green-500"
                        : "text-foreground"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {(transaction.amount_cents / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: transaction.currency,
                    })}
                  </p>
                </div>
              </div>
            ))}
            <Link href="/transactions">
              <Button variant="ghost" size="sm" className="mt-3 w-full md:mt-4">
                {t("dashboard.transactions.viewAll")}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
