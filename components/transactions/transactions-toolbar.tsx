"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCards } from "@/hooks/use-cards";
import { useCategories } from "@/hooks/use-categories";
import { useTranslation } from "@/hooks/use-translation";
import type { Currency } from "@/lib/currency";
import { Plus, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export type Filters = {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  cardId?: string;
  currency?: Currency | "ALL";
  search?: string;
};

interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
  onOpenAdd: () => void;
  onImport?: () => void;
}

export function TransactionsToolbar({
  filters,
  onChange,
  onOpenAdd,
  onImport,
}: Props) {
  const { t } = useTranslation();
  const { cards } = useCards();
  const { data: categories = [] } = useCategories();
  const [openFilters, setOpenFilters] = useState(false);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("transactions.category")}
          </Label>
          <Select
            value={filters.categoryId ?? "ALL"}
            onValueChange={(v) =>
              onChange({ ...filters, categoryId: v === "ALL" ? undefined : v })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder={t("transactions.category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("common.all")}</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.emoji ? `${c.emoji} ` : ""}
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
            placeholder={t("transactions.searchPlaceholder")}
            value={filters.search ?? ""}
            onChange={(e) =>
              onChange({ ...filters, search: e.target.value || undefined })
            }
          />
        </div>
        <div className="flex items-end">
          <Popover open={openFilters} onOpenChange={setOpenFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="justify-start">
                <SlidersHorizontal className="mr-2 h-4 w-4" />{" "}
                {t("transactions.moreFilters")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[360px] p-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {t("transactions.card")}
                  </Label>
                  <Select
                    value={filters.cardId ?? "ALL"}
                    onValueChange={(v) =>
                      onChange({
                        ...filters,
                        cardId: v === "ALL" ? undefined : v,
                      })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={t("transactions.card")} />
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      {t("transactions.startDate")}
                    </Label>
                    <input
                      type="date"
                      className="h-9 w-full rounded-md border bg-background px-3 py-1 text-sm outline-none ring-0 focus:border-ring"
                      value={filters.startDate ?? ""}
                      onChange={(e) =>
                        onChange({
                          ...filters,
                          startDate: e.target.value || undefined,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      {t("transactions.endDate")}
                    </Label>
                    <input
                      type="date"
                      className="h-9 w-full rounded-md border bg-background px-3 py-1 text-sm outline-none ring-0 focus:border-ring"
                      value={filters.endDate ?? ""}
                      onChange={(e) =>
                        onChange({
                          ...filters,
                          endDate: e.target.value || undefined,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {t("transactions.currency")}
                  </Label>
                  <Select
                    value={filters.currency ?? "ALL"}
                    onValueChange={(v: string) =>
                      onChange({
                        ...filters,
                        currency: v === "ALL" ? "ALL" : (v as Currency),
                      })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={t("transactions.currency")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">{t("common.all")}</SelectItem>
                      <SelectItem value="PEN">PEN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onChange({
                        ...filters,
                        startDate: undefined,
                        endDate: undefined,
                        currency: "ALL",
                        cardId: undefined,
                      });
                      setOpenFilters(false);
                    }}
                  >
                    {t("transactions.clearAll")}
                  </Button>
                  <Button size="sm" onClick={() => setOpenFilters(false)}>
                    {t("transactions.apply")}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex items-end justify-end gap-2">
        <Button size="sm" onClick={onOpenAdd}>
          <Plus className="mr-2 h-4 w-4" /> {t("transactions.addTransaction")}
        </Button>
      </div>
      {null}
    </div>
  );
}
