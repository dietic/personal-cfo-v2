"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useStatements, type Statement } from "@/hooks/use-statements";
import { useTranslation } from "@/hooks/use-translation";
import {
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  Trash,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DeleteStatementDialog } from "./delete-statement-dialog";

export type Filters = {
  search?: string;
  status?: "completed" | "failed" | "processing" | "ALL";
  cardId?: string;
};

function StatusBadge({
  status,
  labelProcessing,
  labelCompleted,
  labelFailed,
}: {
  status: Statement["status"];
  labelProcessing: string;
  labelCompleted: string;
  labelFailed: string;
}) {
  switch (status) {
    case "completed":
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-600/15 text-emerald-400 pl-1.5 pr-2"
        >
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
          {labelCompleted}
        </Badge>
      );
    case "failed":
      return (
        <Badge
          variant="secondary"
          className="bg-destructive/10 text-destructive pl-1.5 pr-2"
        >
          <XCircle className="mr-1 h-3.5 w-3.5" />
          {labelFailed}
        </Badge>
      );
    case "processing":
      return (
        <Badge
          variant="secondary"
          className="bg-muted text-muted-foreground pl-1.5 pr-2"
        >
          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          {labelProcessing}
        </Badge>
      );
  }
}

interface Props {
  filters: Filters;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onChangePageSize?: (size: number) => void;
}

export function StatementsTable({
  filters,
  page = 1,
  pageSize = 25,
  onPageChange,
  onChangePageSize,
}: Props) {
  const { t } = useTranslation();
  const { useList, bulkDelete, isDeleting } = useStatements();
  const { data: listResult, isLoading } = useList({ filters, page, pageSize });
  const statements = listResult?.data ?? [];
  const total = listResult?.total ?? 0;

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const allSelected =
    statements.length > 0 && statements.every((d) => selected[d.id]);
  const someSelected = statements.some((d) => selected[d.id]);
  const headerChecked: boolean | "indeterminate" = allSelected
    ? true
    : someSelected
    ? "indeterminate"
    : false;
  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  );

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    if (checked) for (const d of statements) next[d.id] = true;
    setSelected(next);
  };
  const toggleOne = (id: string, checked: boolean) =>
    setSelected((p) => ({ ...p, [id]: checked }));

  const onBulkDelete = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    await bulkDelete(ids);
    setSelected({});
  };

  // Helper to pretty-print file types (localized)
  function prettyFileType(fileType?: string | null, fileName?: string | null) {
    const fromName = () => {
      if (!fileName) return undefined;
      const dot = fileName.lastIndexOf(".");
      if (dot === -1) return undefined;
      return fileName.slice(dot + 1).toLowerCase();
    };

    const type = (fileType || fromName() || "pdf").toLowerCase();

    if (type.includes("pdf")) return t("statements.fileTypes.pdf");
    if (type.includes("csv")) return t("statements.fileTypes.csv");
    if (type.includes("png")) return t("statements.fileTypes.png");
    if (type.includes("jpeg") || type.includes("jpg"))
      return t("statements.fileTypes.jpg");

    // Fallback: use extension uppercased
    const ext = fromName();
    return ext ? ext.toUpperCase() : type.toUpperCase();
  }

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
                <Trash className="mr-2 h-4 w-4" /> {t("statements.bulkDelete")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedCount} {t("statements.selected")}
              </span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {t("statements.showing")} {statements.length} {t("statements.of")}{" "}
              {total}
            </div>
          )}

          {/* Pager + items per page (inside the card section) */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => onPageChange?.(page - 1)}
            >
              {t("statements.previous")}
            </Button>
            <div className="text-sm text-muted-foreground">{page}</div>
            <Button
              variant="outline"
              size="sm"
              disabled={page * pageSize >= total || isLoading}
              onClick={() => onPageChange?.(page + 1)}
            >
              {t("statements.next")}
            </Button>
            <div className="ml-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t("statements.itemsPerPage")}
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(v: string) =>
                  onChangePageSize?.(parseInt(v, 10))
                }
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
                    aria-label={t("statements.selectAll")}
                    onCheckedChange={(v: boolean | "indeterminate") =>
                      toggleAll(Boolean(v))
                    }
                  />
                </TableHead>
                <TableHead className="w-[40%]">
                  {t("statements.fileName")}
                </TableHead>
                <TableHead className="w-[16%]">
                  {t("statements.card")}
                </TableHead>
                <TableHead className="w-[16%]">
                  {t("statements.status")}
                </TableHead>
                <TableHead className="w-[16%]">
                  {t("statements.uploadedAt")}
                </TableHead>
                <TableHead className="w-[12%]">
                  {t("statements.fileType")}
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
                      <TableCell className="w-[16%]">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="w-[16%]">
                        <Skeleton className="h-5 w-28 rounded-full" />
                      </TableCell>
                      <TableCell className="w-[16%]">
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell className="w-[12%]">
                        <Skeleton className="h-5 w-12 rounded" />
                      </TableCell>
                      <TableCell className="w-8">
                        <Skeleton className="ml-auto h-4 w-4 rounded" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {statements.map((st) => (
                <TableRow key={st.id}>
                  <TableCell className="w-8">
                    <Checkbox
                      checked={!!selected[st.id]}
                      aria-label={t("statements.selectRow")}
                      onCheckedChange={(v: boolean | "indeterminate") =>
                        toggleOne(st.id, Boolean(v))
                      }
                    />
                  </TableCell>
                  <TableCell className="max-w-[640px] w-[40%]">
                    <div className="truncate font-medium">{st.file_name}</div>
                    {st.failure_reason && (
                      <div className="truncate text-xs text-destructive/80">
                        {st.failure_reason}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="w-[16%] whitespace-nowrap">
                    {st.cards?.name ?? "—"}
                  </TableCell>
                  <TableCell className="w-[16%]">
                    <StatusBadge
                      status={st.status}
                      labelProcessing={t("statements.statusProcessing")}
                      labelCompleted={t("statements.statusCompleted")}
                      labelFailed={t("statements.statusFailed")}
                    />
                  </TableCell>
                  <TableCell className="w-[16%] whitespace-nowrap">
                    {new Date(st.uploaded_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="w-[12%]">
                    <Badge
                      variant="outline"
                      className="border-muted-foreground/30 text-foreground"
                    >
                      {prettyFileType(st.file_type, st.file_name)}
                    </Badge>
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
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(st.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />{" "}
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && statements.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    {t("statements.noStatements")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DeleteStatementDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        statementId={deleteId}
      />
    </>
  );
}
