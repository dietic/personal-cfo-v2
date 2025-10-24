"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLocale } from "@/contexts/locale-context";
import { useCategories, type Category } from "@/hooks/use-categories";
import type { CreateCategoryInput } from "@/lib/validators/categories";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { CategoryFormDialog } from "./category-form";

export function CategoriesTab() {
  const { t } = useLocale();
  const {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
  } = useCategories();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [page] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const total = categories.length;
  const start = (page - 1) * pageSize + 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("settings.categories.add")}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {t("settings.categories.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                {t("transactions.showing")} {total > 0 ? start : 0}{" "}
                {t("transactions.of")} {total}
              </div>
              <div className="flex items-center gap-2">
                <span>{t("transactions.itemsPerPage")}</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => setPageSize(Number(v))}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table aria-busy={isLoading ? true : undefined}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">
                      {t("settings.categories.table.name")}
                    </TableHead>
                    <TableHead className="w-[20%]">
                      {t("settings.categories.table.emoji")}
                    </TableHead>
                    <TableHead className="w-[32%]">
                      {t("settings.categories.table.color")}
                    </TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={`sk-${i}`}>
                          <TableCell>
                            <Skeleton className="h-4 w-3/4" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-8" />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-4 rounded" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="ml-auto h-4 w-4 rounded" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                  {!isLoading && categories.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        {t("settings.categories.empty")}
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading &&
                    categories
                      .slice((page - 1) * pageSize, page * pageSize)
                      .map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">
                            {c.name}
                          </TableCell>
                          <TableCell>
                            <span
                              className="text-base"
                              aria-label={t("settings.categories.emoji")}
                            >
                              {c.emoji ?? "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {c.color ? (
                              <span
                                className="inline-block h-6 w-6 rounded border border-border"
                                style={{ backgroundColor: c.color }}
                                aria-label={`Color: ${c.color}`}
                              />
                            ) : (
                              <span>—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="p-1 text-muted-foreground hover:text-foreground"
                                  aria-label={t("common.moreOptions")}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditing(c);
                                    setOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />{" "}
                                  {t("common.edit")}
                                </DropdownMenuItem>
                                {!c.is_preset && (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDeleteId(c.id)}
                                  >
                                    <Trash className="mr-2 h-4 w-4" />{" "}
                                    {t("common.delete")}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={
          editing
            ? { name: editing.name, emoji: editing.emoji, color: editing.color }
            : null
        }
        isLoading={isCreating || isUpdating}
        onSubmit={async (values) => {
          if (editing) {
            await updateCategory({ id: editing.id, input: values });
            setEditing(null);
          } else {
            await createCategory(values as CreateCategoryInput);
          }
        }}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("settings.categories.deleteTitle")}
            </AlertDialogTitle>
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
  );
}
