"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCards } from "@/hooks/use-cards";
import { useTranslation } from "@/hooks/use-translation";
import { RefreshCcw, Upload } from "lucide-react";

type Status = "ALL" | "completed" | "failed" | "processing";

export type Filters = {
  status?: Status;
  cardId?: string;
  search?: string;
};

interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
  onOpenUpload?: () => void;
}

export function StatementsToolbar({ filters, onChange, onOpenUpload }: Props) {
  const { t } = useTranslation();
  const { cards } = useCards();

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("statements.status")}
          </Label>
          <Select
            value={filters.status ?? "ALL"}
            onValueChange={(v) =>
              onChange({
                ...filters,
                status: v === "ALL" ? undefined : (v as Status),
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder={t("statements.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("common.all")}</SelectItem>
              <SelectItem value="completed">
                {t("statements.statusCompleted")}
              </SelectItem>
              <SelectItem value="processing">
                {t("statements.statusProcessing")}
              </SelectItem>
              <SelectItem value="failed">
                {t("statements.statusFailed")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("statements.card")}
          </Label>
          <Select
            value={filters.cardId ?? "ALL"}
            onValueChange={(v) =>
              onChange({ ...filters, cardId: v === "ALL" ? undefined : v })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder={t("statements.card")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("common.all")}</SelectItem>
              {cards.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 md:col-span-1">
          <Label className="text-xs text-muted-foreground">
            {t("common.search")}
          </Label>
          <input
            className="h-9 w-full rounded-md border bg-background px-3 py-1 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-ring"
            placeholder={t("statements.searchPlaceholder")}
            value={filters.search ?? ""}
            onChange={(e) =>
              onChange({ ...filters, search: e.target.value || undefined })
            }
          />
        </div>
      </div>
      <div className="flex items-end justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onOpenUpload}>
          <Upload className="mr-2 h-4 w-4" /> {t("statements.importStatement")}
        </Button>
        <Button variant="outline" size="sm" disabled>
          <RefreshCcw className="mr-2 h-4 w-4" />{" "}
          {t("statements.recategorizeAll")}
        </Button>
      </div>
    </div>
  );
}
