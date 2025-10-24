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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { useExcludedKeywords } from "@/hooks/use-excluded-keywords";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const singleSchema = z.object({ keyword: z.string().min(1).max(100) });
const bulkSchema = z.object({ keywords: z.string().min(1) });

export function ExcludedKeywordsTab() {
  const { t } = useLocale();
  const {
    excluded,
    isLoading,
    createExcluded,
    updateExcluded,
    deleteExcluded,
  } = useExcludedKeywords();

  const [open, setOpen] = useState<"single" | "bulk" | null>(null);
  const [edit, setEdit] = useState<{ id: string; keyword: string } | null>(
    null
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [page] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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

  const total = (excluded ?? []).length;
  const start = (page - 1) * pageSize + 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          onClick={() => {
            setEdit(null);
            setOpen("single");
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("settings.excluded.add")}
        </Button>
        <Button variant="secondary" onClick={() => setOpen("bulk")}>
          {t("settings.excluded.bulkAdd")}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {t("settings.excluded.title")}
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
                    <TableHead className="w-[92%]">
                      {t("settings.excluded.table.keyword")}
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
                            <Skeleton className="ml-auto h-4 w-4 rounded" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                  {!isLoading && (excluded ?? []).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        {t("settings.excluded.empty")}
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading &&
                    (excluded ?? [])
                      .slice((page - 1) * pageSize, page * pageSize)
                      .map((k) => (
                        <TableRow key={k.id}>
                          <TableCell className="font-medium">
                            {k.keyword}
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
                                    setEdit({ id: k.id, keyword: k.keyword });
                                    setOpen("single");
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />{" "}
                                  {t("common.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteId(k.id)}
                                >
                                  <Trash className="mr-2 h-4 w-4" />{" "}
                                  {t("common.delete")}
                                </DropdownMenuItem>
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

      {/* Single add/edit dialog */}
      <Dialog
        open={open === "single"}
        onOpenChange={(o) => setOpen(o ? "single" : null)}
      >
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {edit
                ? t("settings.excluded.editTitle")
                : t("settings.excluded.createTitle")}
            </DialogTitle>
          </DialogHeader>
          <Form {...singleForm}>
            <form
              onSubmit={singleForm.handleSubmit(async (values) => {
                if (edit) {
                  await updateExcluded({
                    id: edit.id,
                    input: { keyword: values.keyword.trim() },
                  });
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
                      <Input
                        {...field}
                        placeholder={t("settings.excluded.keywordPh")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(null)}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit">
                  {edit ? t("common.update") : t("common.create")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bulk add dialog */}
      <Dialog
        open={open === "bulk"}
        onOpenChange={(o) => setOpen(o ? "bulk" : null)}
      >
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
                      <Input
                        {...field}
                        placeholder={t("settings.excluded.bulkPh")}
                        aria-describedby="bulk-hint"
                      />
                    </FormControl>
                    <p id="bulk-hint" className="text-xs text-muted-foreground">
                      {t("settings.excluded.bulkHint")}
                    </p>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(null)}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit">{t("settings.excluded.bulkAdd")}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("settings.excluded.deleteTitle")}
            </AlertDialogTitle>
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
  );
}
