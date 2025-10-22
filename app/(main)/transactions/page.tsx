"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCards } from "@/hooks/use-cards";
import { useTransactions } from "@/hooks/use-transactions";
import { useTranslation } from "@/hooks/use-translation";
import { CreateTransactionInput, createTransactionSchema } from "@/lib/validators/transactions";
import { formatCurrency, isSupportedCurrency } from "@/lib/currency";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";

export default function TransactionsPage() {
  const { t } = useTranslation();
  const { transactions, isLoading, createTransaction, isCreating } = useTransactions();
  const { cards } = useCards();

  const defaultCurrency = "PEN"; // could be read from profile later

  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      card_id: "",
      description: "",
      merchant: "",
      transaction_date: new Date().toISOString().slice(0, 10),
      category_id: undefined,
      currency: defaultCurrency,
      amount: 0,
      type: "expense",
    },
  });

  const onSubmit = async (values: CreateTransactionInput) => {
    await createTransaction(values);
    form.reset({ ...form.getValues(), description: "", amount: 0, merchant: "" });
  };

  const sorted = useMemo(() =>
    [...transactions].sort((a, b) => (a.transaction_date < b.transaction_date ? 1 : -1)),
    [transactions]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("dashboard.navigation.transactions")}</h2>
          <p className="text-sm text-muted-foreground md:text-base">{t("transactions.subtitle")}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("transactions.addTransaction")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3 md:grid-cols-6">
              <FormField
                control={form.control}
                name="card_id"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("transactions.card")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("transactions.selectCard")} />
                      </SelectTrigger>
                      <SelectContent>
                        {cards.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t("transactions.description")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("transactions.descriptionPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("transactions.amount")}</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("transactions.type")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">{t("transactions.expense")}</SelectItem>
                        <SelectItem value="income">{t("transactions.income")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transaction_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("transactions.date")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-6 flex justify-end pt-1">
                <Button size="sm" type="submit" disabled={isCreating}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("transactions.add")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("transactions.recent")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">{t("common.loading")}</div>
          ) : (
            <div className="divide-y rounded-md border">
              {sorted.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{tx.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(tx.transaction_date).toLocaleDateString()} • {tx.cards?.name}
                      {tx.categories ? ` • ${tx.categories.name}` : ""}
                    </div>
                  </div>
                  <div className={`${tx.amount_cents < 0 ? "text-destructive" : "text-success"} font-medium tabular-nums`}>
                    {formatCurrency(
                      Math.abs(tx.amount_cents) / 100,
                      isSupportedCurrency(tx.currency) ? tx.currency : "USD"
                    )}
                  </div>
                </div>
              ))}
              {sorted.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">{t("transactions.noTransactions")}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
