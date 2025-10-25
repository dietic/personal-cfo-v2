"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransactions, type Transaction } from "@/hooks/use-transactions";
import { useTranslation } from "@/hooks/use-translation";
// import { isSupportedCurrency } from "@/lib/currency";
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
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Pencil,
  Trash,
  Trash2,
} from "lucide-react";
//
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";
import { TransactionEditDialog } from "./transaction-edit-dialog";
import { Filters } from "./transactions-toolbar";

type SortKey =
  | "description"
  | "transaction_date"
  | "category"
  | "card"
  | "currency"
  | "amount";
type SortDir = "asc" | "desc";

function formatAmountNoCurrency(amountCents: number) {
  const n = Math.abs(amountCents) / 100;
  return new Intl.NumberFormat(undefined, {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function categoryColorClasses(color?: string | null) {
  // Support hex values stored in DB (e.g., #f97316) and known token names
  if (!color) return null;

  const isHex = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(color);
  if (isHex) {
    return { borderColor: color, color } as React.CSSProperties;
  }

  const isCssColor = /^(rgb|hsl)a?\(/i.test(color);
  if (isCssColor) {
    return { borderColor: color, color } as React.CSSProperties;
  }

  // Map token names to hex values (aligned with CategoryColorPicker presets)
  const tokenToHex: Record<string, string> = {
    orange: "#f97316",
    slate: "#64748b",
    teal: "#14b8a6",
    indigo: "#6366f1",
    purple: "#a855f7",
    blue: "#3b82f6",
  };

  const hex = tokenToHex[color.toLowerCase?.() ?? ""];
  if (hex) {
    return { borderColor: hex, color: hex } as React.CSSProperties;
  }

  // Fallback: muted
  return {
    borderColor: "var(--muted-foreground)",
    color: "var(--muted-foreground)",
  } as React.CSSProperties;
}

interface Props {
  filters: Filters;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onChangePageSize?: (size: number) => void;
}

export function TransactionsTable({
  filters,
  page = 1,
  pageSize = 25,
  onPageChange,
  onChangePageSize,
}: Props) {
  const { t } = useTranslation();
  const { useList, bulkDelete, isDeleting } = useTransactions();
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [sortKey, setSortKey] = useState<SortKey>("transaction_date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch data from API with server-side sorting
  const { data: listResult, isLoading } = useList({
    filters,
    page,
    pageSize,
    sortBy: sortKey,
    sortDir,
  });
  const transactions = useMemo(
    () => listResult?.data ?? [],
    [listResult?.data]
  );
  const total = listResult?.total ?? 0;

  // No need for client-side filtering and sorting anymore - it's all server-side
  const rows = transactions;

  const allSelected = rows.length > 0 && rows.every((d) => selected[d.id]);
  const someSelected = rows.some((d) => selected[d.id]);
  const headerChecked: boolean | "indeterminate" = allSelected
    ? true
    : someSelected
    ? "indeterminate"
    : false;

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    if (checked) {
      for (const d of rows) next[d.id] = true;
    }
    setSelected(next);
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const onBulkDelete = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    await bulkDelete(ids);
    setSelected({});
  };

  const onSortClick = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const ariaFor = (key: SortKey): "ascending" | "descending" | undefined =>
    sortKey === key
      ? sortDir === "asc"
        ? "ascending"
        : "descending"
      : undefined;

  const SortIcon = ({ active }: { active: boolean }) =>
    active ? (
      sortDir === "asc" ? (
        <ChevronUp className="ml-1 h-3.5 w-3.5" />
      ) : (
        <ChevronDown className="ml-1 h-3.5 w-3.5" />
      )
    ) : (
      <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
    );

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {someSelected ? (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={onBulkDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />{" "}
                {t("transactions.bulkDelete")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {Object.values(selected).filter(Boolean).length}{" "}
                {t("transactions.selected")}
              </span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {t("transactions.showing")} {transactions.length}{" "}
              {t("transactions.of")} {total}
            </div>
          )}
          {/* Simple pager */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => onPageChange?.(page - 1)}
            >
              {t("transactions.previous")}
            </Button>
            <div className="text-sm text-muted-foreground">{page}</div>
            <Button
              variant="outline"
              size="sm"
              disabled={page * pageSize >= total || isLoading}
              onClick={() => onPageChange?.(page + 1)}
            >
              {t("transactions.next")}
            </Button>
            <div className="ml-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t("transactions.itemsPerPage")}
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => onChangePageSize?.(parseInt(v, 10))}
              >
                <SelectTrigger className="h-8 w-[84px]">
                  <SelectValue placeholder="25" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-md border">
          <Table aria-busy={isLoading ? true : undefined}>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">
                  <Checkbox
                    checked={headerChecked}
                    aria-label={t("transactions.selectAll")}
                    onCheckedChange={(v: boolean | "indeterminate") =>
                      toggleAll(Boolean(v))
                    }
                  />
                </TableHead>
                <TableHead
                  className="w-[40%] cursor-pointer"
                  aria-sort={ariaFor("description")}
                  onClick={() => onSortClick("description")}
                >
                  <div className="flex items-center">
                    {t("transactions.description")}{" "}
                    <SortIcon active={sortKey === "description"} />
                  </div>
                </TableHead>
                <TableHead
                  className="w-[12%] cursor-pointer"
                  aria-sort={ariaFor("transaction_date")}
                  onClick={() => onSortClick("transaction_date")}
                >
                  <div className="flex items-center">
                    {t("transactions.date")}{" "}
                    <SortIcon active={sortKey === "transaction_date"} />
                  </div>
                </TableHead>
                <TableHead
                  className="w-[16%] cursor-pointer"
                  aria-sort={ariaFor("category")}
                  onClick={() => onSortClick("category")}
                >
                  <div className="flex items-center">
                    {t("transactions.category")}{" "}
                    <SortIcon active={sortKey === "category"} />
                  </div>
                </TableHead>
                <TableHead
                  className="w-[16%] cursor-pointer"
                  aria-sort={ariaFor("card")}
                  onClick={() => onSortClick("card")}
                >
                  <div className="flex items-center">
                    {t("transactions.card")}{" "}
                    <SortIcon active={sortKey === "card"} />
                  </div>
                </TableHead>
                <TableHead
                  className="w-[80px] cursor-pointer"
                  aria-sort={ariaFor("currency")}
                  onClick={() => onSortClick("currency")}
                >
                  <div className="flex items-center">
                    {t("transactions.currency")}{" "}
                    <SortIcon active={sortKey === "currency"} />
                  </div>
                </TableHead>
                <TableHead
                  className="w-[120px] cursor-pointer text-right"
                  aria-sort={ariaFor("amount")}
                  onClick={() => onSortClick("amount")}
                >
                  <div className="flex items-center justify-end">
                    {t("transactions.amount")}{" "}
                    <SortIcon active={sortKey === "amount"} />
                  </div>
                </TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      <TableCell className="w-8">
                        <Skeleton className="h-4 w-4 rounded" />
                      </TableCell>
                      <TableCell className="w-[40%]">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="mt-2 h-3 w-1/3" />
                      </TableCell>
                      <TableCell className="w-[12%]">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="w-[16%]">
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </TableCell>
                      <TableCell className="w-[16%]">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="w-[80px]">
                        <Skeleton className="h-5 w-10 rounded" />
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <Skeleton className="ml-auto h-4 w-16" />
                      </TableCell>
                      <TableCell className="w-8">
                        <Skeleton className="ml-auto h-4 w-4 rounded" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {rows.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="w-8">
                    <Checkbox
                      checked={!!selected[tx.id]}
                      aria-label={t("transactions.selectRow")}
                      onCheckedChange={(v: boolean | "indeterminate") =>
                        toggleOne(tx.id, Boolean(v))
                      }
                    />
                  </TableCell>
                  <TableCell className="max-w-[640px] w-[40%]">
                    <div className="truncate font-medium">{tx.description}</div>
                    {tx.merchant && (
                      <div className="truncate text-xs text-muted-foreground">
                        {tx.merchant}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="w-[12%]">
                    {new Date(tx.transaction_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="w-[16%]">
                    {tx.categories ? (
                      <Badge
                        variant="outline"
                        className="whitespace-nowrap"
                        style={
                          categoryColorClasses(tx.categories.color) || undefined
                        }
                      >
                        {tx.categories.emoji && (
                          <span className="mr-1">{tx.categories.emoji}</span>
                        )}
                        {tx.categories.name}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="whitespace-nowrap border-muted-foreground text-muted-foreground"
                      >
                        {t("transactions.uncategorized")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="w-[16%] whitespace-nowrap">
                    {tx.cards?.name}
                  </TableCell>
                  <TableCell className="w-[80px]">
                    <Badge
                      variant="outline"
                      className="border-muted-foreground/30 uppercase text-foreground"
                    >
                      {tx.currency}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`w-[120px] text-right tabular-nums ${
                      tx.amount_cents < 0 ? "text-destructive" : "text-success"
                    }`}
                  >
                    {formatAmountNoCurrency(tx.amount_cents)}
                  </TableCell>
                  <TableCell className="w-8 text-right">
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
                        <DropdownMenuItem onClick={() => setEditTx(tx)}>
                          <Pencil className="mr-2 h-4 w-4" /> {t("common.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(tx.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />{" "}
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    {t("transactions.noTransactions")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <TransactionEditDialog
        open={!!editTx}
        onClose={() => setEditTx(null)}
        transaction={editTx}
      />
      <DeleteTransactionDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        transactionId={deleteId}
      />
    </>
  );
}
