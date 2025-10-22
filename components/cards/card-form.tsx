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
  FormDescription,
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
import { useBanks, useCards, type Card } from "@/hooks/use-cards";
import { useTranslation } from "@/hooks/use-translation";
import { createCardSchema, type CreateCardInput } from "@/lib/validators/cards";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CardFormProps {
  open: boolean;
  onClose: () => void;
  card?: Card | null;
}

export function CardForm({ open, onClose, card }: CardFormProps) {
  const { t } = useTranslation();
  const { createCard, updateCard, isCreating, isUpdating } = useCards();
  const {
    data: banks = [],
    isLoading: isLoadingBanks,
    error: banksError,
  } = useBanks();
  const isEdit = !!card;

  const form = useForm<CreateCardInput>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      name: "",
      bank_id: "",
      due_date: null,
    },
  });

  // Reset form when dialog opens/closes or card changes
  useEffect(() => {
    if (open && card) {
      form.reset({
        name: card.name,
        bank_id: card.bank_id,
        due_date: card.due_date,
      });
    } else if (open && !card) {
      form.reset({
        name: "",
        bank_id: "",
        due_date: null,
      });
    }
  }, [open, card, form]);

  const onSubmit = async (data: CreateCardInput) => {
    try {
      if (isEdit && card) {
        await updateCard({ id: card.id, ...data });
        toast.success(t("cards.cardUpdated"));
      } else {
        await createCard(data);
        toast.success(t("cards.cardCreated"));
      }
      onClose();
      form.reset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("cards.errorCreating");
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("cards.editCard") : t("cards.create")}
          </DialogTitle>
          <DialogDescription>{t("cards.subtitle")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Card Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cards.cardName")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("cards.cardNamePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  {banksError ? (
                    <FormDescription className="text-destructive">
                      {t("common.error")}: {banksError.message}
                    </FormDescription>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bank */}
            <FormField
              control={form.control}
              name="bank_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cards.bank")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger /* keep enabled even while loading to allow opening */
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <SelectValue placeholder={t("cards.selectBank")} />
                          {isLoadingBanks ? (
                            <Loader2 className="h-4 w-4 animate-spin opacity-70" />
                          ) : null}
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {banks.length === 0 && !isLoadingBanks ? (
                        <SelectItem value="" disabled>
                          {t("cards.noBanksAvailable")}
                        </SelectItem>
                      ) : (
                        banks.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Due Date */}
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cards.dueDate")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      placeholder={t("cards.dueDatePlaceholder")}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseInt(value, 10) : null);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("cards.dueDateDescription")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isCreating || isUpdating}
              >
                {t("cards.cancel")}
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? t("cards.update") : t("cards.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
