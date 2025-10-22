"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCards } from "@/hooks/use-cards";
import { useCategories } from "@/hooks/use-categories";
import { useTransactions, type Transaction } from "@/hooks/use-transactions";
import { useTranslation } from "@/hooks/use-translation";
import { Currency } from "@/lib/currency";
import { updateTransactionSchema } from "@/lib/validators/transactions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

interface Props {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function TransactionEditDialog({ open, onClose, transaction }: Props) {
  const { t } = useTranslation();
  const { cards } = useCards();
  const { data: categories = [] } = useCategories();
  const { updateTransaction, isUpdating } = useTransactions();

  const form = useForm<z.input<typeof updateTransactionSchema>>({
    resolver: zodResolver(updateTransactionSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (open && transaction) {
      form.reset({
        card_id: transaction.cards?.id,
        description: transaction.description,
        merchant: transaction.merchant ?? "",
        transaction_date: transaction.transaction_date,
        category_id: transaction.categories?.id ?? undefined,
        currency: transaction.currency,
        // Convert signed amount_cents to positive major units and set type by sign
        amount: Math.abs(transaction.amount_cents) / 100,
        type: transaction.amount_cents < 0 ? "expense" : "income",
      });
    }
  }, [open, transaction, form]);

  const onSubmit = async (values: z.input<typeof updateTransactionSchema>) => {
    if (!transaction) return;
    // Coerce with Zod to proper output types; server maps amount+type to amount_cents
    const parsed = updateTransactionSchema.parse(values);
    await updateTransaction({ id: transaction.id, ...parsed });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{t("transactions.editTransaction")}</DialogTitle>
          <DialogDescription>{t("transactions.subtitle")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <FormField
              control={form.control}
              name="card_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("transactions.card")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value as string | undefined}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("transactions.selectCard")} />
                    </SelectTrigger>
                    <SelectContent>
                      {cards.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t("transactions.description")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("transactions.descriptionPlaceholder")}
                      value={(field.value ?? "") as string}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="merchant"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t("transactions.merchant")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("transactions.merchantPlaceholder")}
                      value={(field.value ?? "") as string}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
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
                    <Input
                      type="number"
                      step="0.01"
                      value={
                        typeof field.value === "number" ||
                        typeof field.value === "string"
                          ? field.value
                          : ""
                      }
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("transactions.currency")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value as string | undefined}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["PEN", "USD", "EUR"] as Currency[]).map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value as "income" | "expense" | undefined}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">
                        {t("transactions.expense")}
                      </SelectItem>
                      <SelectItem value="income">
                        {t("transactions.income")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("transactions.category")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={(field.value as string | undefined) ?? undefined}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("transactions.selectCategory")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUpdating}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isUpdating ? t("transactions.saving") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
