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
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
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
import { useCategories } from "@/hooks/use-categories";
import { useKeywords } from "@/hooks/use-keywords";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRightLeft,
  CheckCircle2,
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  RotateCw,
  Trash,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({ keyword: z.string().min(1).max(100) });

function getStatusBadge(
  status: "categorizing" | "active" | "failed",
  t: (key: string) => string,
  onRetry?: () => void
) {
  switch (status) {
    case "categorizing":
      return (
        <Badge
          variant="secondary"
          className="bg-muted text-muted-foreground pl-1.5 pr-2"
        >
          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          {t("settings.keywords.table.categorizing")}
        </Badge>
      );
    case "active":
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-600/15 text-emerald-400 pl-1.5 pr-2"
        >
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          {t("settings.keywords.table.active")}
        </Badge>
      );
    case "failed":
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="bg-destructive/10 text-destructive pl-1.5 pr-2"
          >
            <XCircle className="mr-1 h-3.5 w-3.5" />
            {t("settings.keywords.table.failed")}
          </Badge>
          {onRetry && (
            <button
              onClick={onRetry}
              className="p-1 text-muted-foreground hover:text-foreground"
              title={t("common.retry")}
            >
              <RotateCw className="h-3 w-3" />
            </button>
          )}
        </div>
      );
  }
}

export function KeywordsTab() {
  const { t } = useLocale();
  const { categories } = useCategories();
  const activeCategories = useMemo(
    () => categories.filter((c) => c.status === "active"),
    [categories]
  );
  const [selected, setSelected] = useState<string | null>(
    activeCategories[0]?.id ?? null
  );
  const {
    keywords,
    isLoading,
    createKeyword,
    updateKeyword,
    deleteKeyword,
    retryKeyword,
    reassignKeyword,
    isCreating,
    isUpdating,
    isDeleting,
    isReassigning,
  } = useKeywords(selected);

  useEffect(() => {
    if (!selected && activeCategories.length > 0) {
      setSelected(activeCategories[0].id);
    }
  }, [activeCategories, selected]);

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<{ id: string; keyword: string } | null>(
    null
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [reassign, setReassign] = useState<{
    id: string;
    keyword: string;
    fromCategoryId: string;
  } | null>(null);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [selectedToCategory, setSelectedToCategory] = useState<string>("");

  const [page] = useState(1);
  const [pageSize, setPageSize] = useState(25);

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

  const total = (keywords ?? []).length;
  const start = (page - 1) * pageSize + 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Label className="sr-only" htmlFor="category-select">
            {t("settings.keywords.selectCategory")}
          </Label>
          <Select value={selected ?? undefined} onValueChange={setSelected}>
            <SelectTrigger id="category-select" className="w-[220px]">
              <SelectValue
                placeholder={t("settings.keywords.selectCategory")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {activeCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.emoji ? `${c.emoji} ` : ""}
                    {c.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            setEdit(null);
            setOpen(true);
          }}
          disabled={!selected}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("settings.keywords.add")}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {t("settings.keywords.title")}
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
                    <TableHead className="w-[70%]">
                      {t("settings.keywords.table.keyword")}
                    </TableHead>
                    <TableHead className="w-[20%]">
                      {t("settings.keywords.table.status")}
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
                            <Skeleton className="h-5 w-16" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="ml-auto h-4 w-4 rounded" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                  {!isLoading && (keywords ?? []).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        {t("settings.keywords.empty")}
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading &&
                    (keywords ?? [])
                      .slice((page - 1) * pageSize, page * pageSize)
                      .map((k) => (
                        <TableRow key={k.id}>
                          <TableCell className="font-medium">
                            {k.keyword}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(k.status, t, async () => {
                              await retryKeyword(k.id);
                              toast.info(t("settings.keywords.retrying"));
                            })}
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
                                    setOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />{" "}
                                  {t("common.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setReassign({
                                      id: k.id,
                                      keyword: k.keyword,
                                      fromCategoryId: k.category_id,
                                    });
                                    setSelectedToCategory(""); // Reset selection
                                    setReassignOpen(true);
                                  }}
                                >
                                  <ArrowRightLeft className="mr-2 h-4 w-4" />{" "}
                                  {t("settings.keywords.reassign")}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {edit
                ? t("settings.keywords.editTitle")
                : t("settings.keywords.createTitle")}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                if (!selected) return;
                if (edit) {
                  await updateKeyword({
                    id: edit.id,
                    input: { keyword: values.keyword.trim() },
                  });
                  setEdit(null);
                  toast.success(t("settings.keywords.updated"));
                } else {
                  const result = await createKeyword({
                    category_id: selected,
                    keyword: values.keyword.trim(),
                  });

                  // Show success message with categorization stats
                  if (result.categorizedCount > 0) {
                    const message = t(
                      "settings.keywords.autoCategorized"
                    ).replace("{count}", result.categorizedCount.toString());
                    toast.success(t("settings.keywords.created"), {
                      description: message,
                    });
                  } else {
                    toast.success(t("settings.keywords.created"));
                  }
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
                      <Input
                        {...field}
                        placeholder={t("settings.keywords.keywordPh")}
                        disabled={isCreating || isUpdating}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={isCreating || isUpdating}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {edit ? t("common.update") : t("common.create")}
                </Button>
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
              {t("settings.keywords.deleteTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.keywords.deleteDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={async () => {
                if (!deleteId) return;
                await deleteKeyword(deleteId);
                setDeleteId(null);
              }}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t("settings.keywords.reassignTitle")}</DialogTitle>
          </DialogHeader>
          {reassign && (
            <div className="space-y-4">
              <div>
                <Label>{t("settings.keywords.reassignKeyword")}</Label>
                <div className="mt-1.5 text-sm font-medium">
                  {reassign.keyword}
                </div>
              </div>
              <div>
                <Label>{t("settings.keywords.fromCategory")}</Label>
                <Select value={reassign.fromCategoryId} disabled>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("settings.keywords.toCategory")}</Label>
                <Select
                  value={selectedToCategory}
                  onValueChange={setSelectedToCategory}
                  disabled={isReassigning}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t("settings.keywords.selectCategory")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCategories
                      .filter((cat) => cat.id !== reassign.fromCategoryId)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.emoji} {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setReassignOpen(false);
                    setReassign(null);
                    setSelectedToCategory("");
                  }}
                  disabled={isReassigning}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="button"
                  disabled={!selectedToCategory || isReassigning}
                  onClick={async () => {
                    if (!reassign || !selectedToCategory) return;
                    try {
                      await reassignKeyword({
                        id: reassign.id,
                        newCategoryId: selectedToCategory,
                      });
                      setReassignOpen(false);
                      setReassign(null);
                      setSelectedToCategory("");
                      toast.success(t("settings.keywords.reassignSuccess"));
                    } catch (error) {
                      toast.error(
                        error instanceof Error
                          ? error.message
                          : t("common.error")
                      );
                    }
                  }}
                >
                  {isReassigning && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("settings.keywords.reassignButton")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
