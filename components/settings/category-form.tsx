"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/contexts/locale-context";
import { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validators/categories";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(50),
  emoji: z.string().max(8).optional().nullable(),
  color: z.string().max(24).optional().nullable(),
});

export function CategoryFormDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
  initial?: { name: string; emoji: string | null; color: string | null } | null;
}) {
  const { t } = useLocale();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", emoji: "", color: "" },
  });

  useEffect(() => {
    if (props.open) {
      form.reset({
        name: props.initial?.name ?? "",
        emoji: props.initial?.emoji ?? "",
        color: props.initial?.color ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open, props.initial, form]);

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {props.initial ? t("settings.categories.editTitle") : t("settings.categories.createTitle")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await props.onSubmit({
                name: values.name.trim(),
                emoji: values.emoji ? values.emoji : null,
                color: values.color ? values.color : null,
              });
              props.onOpenChange(false);
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.categories.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("settings.categories.namePh")}
                      aria-label={t("settings.categories.name")}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("settings.categories.emoji")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="🍔"
                        aria-label={t("settings.categories.emoji")}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("settings.categories.color")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="#16a34a"
                        aria-label={t("settings.categories.color")}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => props.onOpenChange(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit">{props.initial ? t("common.update") : t("common.create")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
