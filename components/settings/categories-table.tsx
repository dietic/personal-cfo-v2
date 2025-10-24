"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
 
import { useLocale } from "@/contexts/locale-context";
import { useCategories, type Category } from "@/hooks/use-categories";
import type { CreateCategoryInput } from "@/lib/validators/categories";
import { CategoryFormDialog } from "./category-form";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export function CategoriesTab() {
  const { t } = useLocale();
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useCategories();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t("settings.categories.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("settings.categories.subtitle")}</p>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          {t("settings.categories.add")}
        </Button>
      </div>

      <Card className="p-4 overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="text-muted-foreground">
            <tr className="text-left">
              <th className="py-2 font-medium">{t("settings.categories.table.name")}</th>
              <th className="py-2 font-medium">{t("settings.categories.table.emoji")}</th>
              <th className="py-2 font-medium">{t("settings.categories.table.color")}</th>
              <th className="py-2 font-medium">{t("settings.categories.table.type")}</th>
              <th className="py-2 font-medium text-right">{t("settings.categories.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="py-6" colSpan={5}>{t("common.loading")}</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td className="py-6 text-muted-foreground" colSpan={5}>
                  {t("settings.categories.empty")}
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="py-3">
                    <span className="inline-flex items-center gap-2">
                      {c.emoji && <span aria-hidden className="text-base">{c.emoji}</span>}
                      <span>{c.name}</span>
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="text-base" aria-label={t("settings.categories.emoji")}>
                      {c.emoji ?? "—"}
                    </span>
                  </td>
                  <td className="py-3">
                    {c.color ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 rounded" style={{ background: c.color }} aria-hidden />
                        <span className="font-mono text-xs">{c.color}</span>
                      </span>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs", c.is_preset ? "bg-muted" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300")}
                      aria-label={c.is_preset ? t("settings.categories.preset") : t("settings.categories.custom")}>
                      {c.is_preset ? t("settings.categories.preset") : t("settings.categories.custom")}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(c); setOpen(true); }} aria-label={t("common.edit")}>
                        {t("common.edit")}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={c.is_preset} onClick={() => setDeleteId(c.id)} aria-label={t("common.delete")}>
                            {t("common.delete")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("settings.categories.deleteTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("settings.categories.deleteDesc")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                if (!deleteId) return;
                                await deleteCategory(deleteId);
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

      <CategoryFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing ? { name: editing.name, emoji: editing.emoji, color: editing.color } : null}
        onSubmit={async (values) => {
          if (editing) {
            await updateCategory({ id: editing.id, input: values });
            setEditing(null);
          } else {
            await createCategory(values as CreateCategoryInput);
          }
        }}
      />
    </div>
  );
}
