"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/contexts/locale-context";
import { useExcludedKeywords } from "@/hooks/use-excluded-keywords";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const singleSchema = z.object({ keyword: z.string().min(1).max(100) });
const bulkSchema = z.object({ keywords: z.string().min(1) });

export function ExcludedKeywordsTab() {
  const { t } = useLocale();
  const { excluded, isLoading, createExcluded, updateExcluded, deleteExcluded } = useExcludedKeywords();

  const [open, setOpen] = useState<"single" | "bulk" | null>(null);
  const [edit, setEdit] = useState<{ id: string; keyword: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const singleForm = useForm<z.infer<typeof singleSchema>>({
    resolver: zodResolver(singleSchema),
    defaultValues: { keyword: "" },
  });
  const bulkForm = useForm<z.infer<typeof bulkSchema>>({
    resolver: zodResolver(bulkSchema),
    defaultValues: { keywords: "" },
  });

  useEffect(() => {
    if (open === "single") singleForm.reset({ keyword: edit?.keyword ?? "" });
    if (open === "bulk") bulkForm.reset({ keywords: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, edit, singleForm, bulkForm]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("settings.excluded.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("settings.excluded.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => { setEdit(null); setOpen("single"); }}>
            {t("settings.excluded.add")}
          </Button>
          <Button variant="secondary" onClick={() => setOpen("bulk")}>
            {t("settings.excluded.bulkAdd")}
          </Button>
        </div>
      </div>

      <Card className="p-4 overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="text-muted-foreground">
            <tr className="text-left">
              <th className="py-2 font-medium">{t("settings.excluded.table.keyword")}</th>
              <th className="py-2 font-medium text-right">{t("settings.excluded.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="py-6" colSpan={2}>{t("common.loading")}</td>
              </tr>
            ) : (excluded ?? []).length === 0 ? (
              <tr>
                <td className="py-6 text-muted-foreground" colSpan={2}>
                  {t("settings.excluded.empty")}
                </td>
              </tr>
            ) : (
              (excluded ?? []).map((k) => (
                <tr key={k.id} className="border-t">
                  <td className="py-3">{k.keyword}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEdit({ id: k.id, keyword: k.keyword }); setOpen("single"); }}>
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
                            <AlertDialogTitle>{t("settings.excluded.deleteTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("settings.excluded.deleteDesc")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                if (!deleteId) return;
                                await deleteExcluded(deleteId);
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

      {/* Single add/edit dialog */}
      <Dialog open={open === "single"} onOpenChange={(o) => setOpen(o ? "single" : null)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{edit ? t("settings.excluded.editTitle") : t("settings.excluded.createTitle")}</DialogTitle>
          </DialogHeader>
          <Form {...singleForm}>
            <form
              onSubmit={singleForm.handleSubmit(async (values) => {
                if (edit) {
                  await updateExcluded({ id: edit.id, input: { keyword: values.keyword.trim() } });
                  setEdit(null);
                } else {
                  await createExcluded({ keyword: values.keyword.trim() });
                }
                setOpen(null);
              })}
              className="space-y-4"
            >
              <FormField
                control={singleForm.control}
                name="keyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("settings.excluded.keyword")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("settings.excluded.keywordPh")} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(null)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit">{edit ? t("common.update") : t("common.create")}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bulk add dialog */}
      <Dialog open={open === "bulk"} onOpenChange={(o) => setOpen(o ? "bulk" : null)}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t("settings.excluded.bulkTitle")}</DialogTitle>
          </DialogHeader>
          <Form {...bulkForm}>
            <form
              onSubmit={bulkForm.handleSubmit(async (values) => {
                const parsed = values.keywords
                  .split(/,|\n/)
                  .map((s) => s.trim())
                  .filter(Boolean);
                await createExcluded({ keywords: parsed });
                setOpen(null);
              })}
              className="space-y-4"
            >
              <FormField
                control={bulkForm.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("settings.excluded.bulkLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("settings.excluded.bulkPh")} aria-describedby="bulk-hint" />
                    </FormControl>
                    <p id="bulk-hint" className="text-xs text-muted-foreground">
                      {t("settings.excluded.bulkHint")}
                    </p>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(null)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit">{t("settings.excluded.bulkAdd")}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
