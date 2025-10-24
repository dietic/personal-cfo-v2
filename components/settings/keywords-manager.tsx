"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocale } from "@/contexts/locale-context";
import { useCategories } from "@/hooks/use-categories";
import { useKeywords } from "@/hooks/use-keywords";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const schema = z.object({ keyword: z.string().min(1).max(100) });

export function KeywordsTab() {
  const { t } = useLocale();
  const { categories } = useCategories();
  const customCategories = useMemo(
    () => categories.filter((c) => !c.is_preset),
    [categories]
  );
  const [selected, setSelected] = useState<string | null>(customCategories[0]?.id ?? null);
  const { keywords, isLoading, createKeyword, updateKeyword, deleteKeyword } = useKeywords(selected);

  useEffect(() => {
    if (!selected && customCategories.length > 0) {
      setSelected(customCategories[0].id);
    }
  }, [customCategories, selected]);

  // Create dialog state
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<{ id: string; keyword: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { keyword: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ keyword: edit?.keyword ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, edit, form]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{t("settings.keywords.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("settings.keywords.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="sr-only" htmlFor="category-select">
            {t("settings.keywords.selectCategory")}
          </Label>
          <Select value={selected ?? undefined} onValueChange={setSelected}>
            <SelectTrigger id="category-select" className="w-[220px]">
              <SelectValue placeholder={t("settings.keywords.selectCategory")}/>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {customCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.emoji ? `${c.emoji} ` : ""}{c.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button onClick={() => { setEdit(null); setOpen(true); }} disabled={!selected}>
            {t("settings.keywords.add")}
          </Button>
        </div>
      </div>

      <Card className="p-4 overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="text-muted-foreground">
            <tr className="text-left">
              <th className="py-2 font-medium">{t("settings.keywords.table.keyword")}</th>
              <th className="py-2 font-medium text-right">{t("settings.keywords.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="py-6" colSpan={2}>{t("common.loading")}</td>
              </tr>
            ) : (keywords ?? []).length === 0 ? (
              <tr>
                <td className="py-6 text-muted-foreground" colSpan={2}>
                  {t("settings.keywords.empty")}
                </td>
              </tr>
            ) : (
              (keywords ?? []).map((k) => (
                <tr key={k.id} className="border-t">
                  <td className="py-3">{k.keyword}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEdit({ id: k.id, keyword: k.keyword }); setOpen(true); }}>
                        {t("common.edit")}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(k.id)}>
                            {t("common.delete")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("settings.keywords.deleteTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("settings.keywords.deleteDesc")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                if (!deleteId) return;
                                await deleteKeyword(deleteId);
                                setDeleteId(null);
                              }}
                            >
                              {t("common.delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{edit ? t("settings.keywords.editTitle") : t("settings.keywords.createTitle")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                if (!selected) return;
                if (edit) {
                  await updateKeyword({ id: edit.id, input: { keyword: values.keyword.trim() } });
                  setEdit(null);
                } else {
                  await createKeyword({ category_id: selected, keyword: values.keyword.trim() });
                }
                setOpen(false);
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="keyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("settings.keywords.keyword")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("settings.keywords.keywordPh")} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit">{edit ? t("common.update") : t("common.create")}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
