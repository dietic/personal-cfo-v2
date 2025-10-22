"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import type { Currency } from "@/lib/currency";
import { useEffect, useState } from "react";
import type { Filters } from "./transactions-toolbar";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: Filters;
  onApply: (next: Filters) => void;
  onClear?: () => void;
}

export function FiltersDialog({
  open,
  onOpenChange,
  value,
  onApply,
  onClear,
}: Props) {
  const { t } = useTranslation();
  const [local, setLocal] = useState<Filters>(value);

  useEffect(() => {
    if (open) setLocal(value);
  }, [open, value]);

  const apply = () => {
    onApply(local);
    onOpenChange(false);
  };

  const clear = () => {
    onClear?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t("transactions.filters")}</DialogTitle>
          <DialogDescription>
            {t("transactions.filtersDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              className="text-xs text-muted-foreground"
              htmlFor="start-date"
            >
              {t("transactions.startDate")}
            </label>
            <Input
              id="start-date"
              type="date"
              value={local.startDate ?? ""}
              onChange={(e) =>
                setLocal({ ...local, startDate: e.target.value || undefined })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground" htmlFor="end-date">
              {t("transactions.endDate")}
            </label>
            <Input
              id="end-date"
              type="date"
              value={local.endDate ?? ""}
              onChange={(e) =>
                setLocal({ ...local, endDate: e.target.value || undefined })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">
              {t("transactions.currency")}
            </label>
            <Select
              value={local.currency ?? "ALL"}
              onValueChange={(v: string) =>
                setLocal({
                  ...local,
                  currency: v === "ALL" ? "ALL" : (v as Currency),
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("common.all")}</SelectItem>
                <SelectItem value="PEN">PEN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs text-muted-foreground">
              {t("transactions.searchPlaceholder")}
            </label>
            <Input
              value={local.search ?? ""}
              onChange={(e) =>
                setLocal({ ...local, search: e.target.value || undefined })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={clear}>
            {t("transactions.clearAll")}
          </Button>
          <Button onClick={apply}>{t("transactions.apply")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
