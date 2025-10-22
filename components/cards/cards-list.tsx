"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Card as CardType } from "@/hooks/use-cards";
import { useTranslation } from "@/hooks/use-translation";
import { CreditCard, Edit, MoreVertical, Plus, Trash } from "lucide-react";

interface CardsListProps {
  cards: CardType[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (card: CardType) => void;
  onDelete: (card: CardType) => void;
  onAddCard: () => void;
}

export function CardsList({
  cards,
  isLoading,
  error,
  onEdit,
  onDelete,
  onAddCard,
}: CardsListProps) {
  const { t } = useTranslation();

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center py-12">
        <CreditCard className="mb-4 h-12 w-12 text-destructive" />
        <p className="mb-2 text-sm font-medium text-destructive">
          {t("cards.errorLoading")}
        </p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  // Empty state
  if (cards.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-16 md:py-20">
        <CreditCard className="mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">{t("cards.noCards")}</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          {t("cards.noCardsDescription")}
        </p>
        <Button onClick={onAddCard}>
          <Plus className="mr-2 h-4 w-4" />
          {t("cards.addFirstCard")}
        </Button>
      </Card>
    );
  }

  // Cards grid
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => {
        // Generate gradient based on bank color or use default
        const gradient = card.banks.brand_color
          ? `linear-gradient(135deg, ${card.banks.brand_color} 0%, ${card.banks.brand_color}dd 100%)`
          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

        return (
          <div
            key={card.id}
            className="group relative h-48 overflow-hidden rounded-xl shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
            style={{ background: gradient }}
          >
            {/* Card Content */}
            <div className="relative h-full p-6 text-white">
              {/* Card chip */}
              <div className="mb-6 h-10 w-12 rounded bg-yellow-400/90" />

              {/* Card info */}
              <div className="mb-2">
                <p className="text-xs opacity-80">{card.banks.name}</p>
                <p className="text-lg font-semibold">{card.name}</p>
              </div>

              {/* Due date */}
              {card.due_date && (
                <p className="text-xs opacity-70">
                  {t("cards.dueDate")}: {card.due_date}
                </p>
              )}

              {/* Actions menu */}
              <div className="absolute right-4 top-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">{t("cards.actions")}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(card)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t("cards.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(card)}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      {t("cards.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
