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
import { useTransactions } from "@/hooks/use-transactions";
import { useTranslation } from "@/hooks/use-translation";
import { Currency } from "@/lib/currency";
import { createTransactionSchema } from "@/lib/validators/transactions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TransactionForm({ open, onClose }: Props) {
  const { t } = useTranslation();
  const { cards } = useCards();
  const { data: categories = [] } = useCategories();
  const { createTransaction, isCreating } = useTransactions();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Use the schema's INPUT type for form values to align with resolver (pre-coercion)
  const form = useForm<z.input<typeof createTransactionSchema>>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      card_id: "",
      description: "",
      merchant: "",
      transaction_date: new Date().toISOString().slice(0, 10),
      category_id: undefined,
      currency: "PEN",
      amount: 0,
      type: "expense",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        card_id: "",
        description: "",
        merchant: "",
        transaction_date: new Date().toISOString().slice(0, 10),
        category_id: undefined,
        currency: "PEN",
        amount: 0,
        type: "expense",
      });
      setSubmitError(null);
    }
  }, [open, form]);

  const onSubmit = async (values: z.input<typeof createTransactionSchema>) => {
    try {
      setSubmitError(null);
      // Validate & coerce using Zod to ensure correct output types
      const parsed = createTransactionSchema.parse(values);
      await createTransaction(parsed);
      onClose();
    } catch (e) {
      const message = e instanceof Error ? e.message : t("common.error");
      setSubmitError(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{t("transactions.addTransaction")}</DialogTitle>
          <DialogDescription>{t("transactions.subtitle")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {/* Card */}
            <FormField
              control={form.control}
              name="card_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("transactions.card")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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

            {/* Date */}
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

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t("transactions.description")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("transactions.descriptionPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Merchant */}
            <FormField
              control={form.control}
              name="merchant"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{t("transactions.merchant")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("transactions.merchantPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
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
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      inputMode="decimal"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Currency */}
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("transactions.currency")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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

            {/* Type */}
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

            {/* Category */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("transactions.category")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("transactions.selectCategory")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.emoji ? `${cat.emoji} ` : ""}
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && (
              <div className="md:col-span-2 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <DialogFooter className="md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isCreating}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isCreating ? t("transactions.adding") : t("transactions.add")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
