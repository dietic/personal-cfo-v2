"use client";

import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import {
  TransactionsToolbar,
  type Filters,
} from "@/components/transactions/transactions-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { useState } from "react";

export default function TransactionsPage() {
  const { t } = useTranslation();
  const [openForm, setOpenForm] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("dashboard.navigation.transactions")}
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            {t("transactions.subtitle")}
          </p>
        </div>
      </div>

      <TransactionsToolbar
        filters={filters}
        onChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
        onOpenAdd={() => setOpenForm(true)}
      />
      <TransactionForm open={openForm} onClose={() => setOpenForm(false)} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {t("transactions.allTransactions")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable
            filters={filters}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onChangePageSize={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
