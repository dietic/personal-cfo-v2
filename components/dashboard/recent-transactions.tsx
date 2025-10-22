"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  if (isLoading) {
    return (
      <Card className="col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Recent Transactions
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
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Recent Transactions
        </CardTitle>
        <Receipt className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Receipt className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <Link href="/statements">
              <Button variant="outline" size="sm" className="mt-4">
                Upload Statement
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {transaction.category_emoji ? (
                      <span className="text-lg">
                        {transaction.category_emoji}
                      </span>
                    ) : (
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {transaction.merchant || transaction.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                          <span>•</span>
                          <span>{transaction.category_name}</span>
                        </>
                      )}
                      {transaction.card_name && (
                        <>
                          <span>•</span>
                          <span>{transaction.card_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
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
              <Button variant="ghost" size="sm" className="mt-4 w-full">
                View All Transactions
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
