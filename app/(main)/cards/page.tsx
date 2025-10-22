"use client";

import { CardForm } from "@/components/cards/card-form";
import { CardsList } from "@/components/cards/cards-list";
import { DeleteCardDialog } from "@/components/cards/delete-card-dialog";
import { Button } from "@/components/ui/button";
import type { Card } from "@/hooks/use-cards";
import { useCards } from "@/hooks/use-cards";
import { useTranslation } from "@/hooks/use-translation";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function CardsPage() {
  const { t } = useTranslation();
  const { cards, isLoading, error } = useCards();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [deletingCard, setDeletingCard] = useState<Card | null>(null);

  const handleEdit = (card: Card) => {
    setEditingCard(card);
    setIsFormOpen(true);
  };

  const handleDelete = (card: Card) => {
    setDeletingCard(card);
    setIsDeleteOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCard(null);
  };

  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
    setDeletingCard(null);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("cards.title")}
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            {t("cards.subtitle")}
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {t("cards.addCard")}
        </Button>
      </div>

      {/* Cards List */}
      <CardsList
        cards={cards}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddCard={() => setIsFormOpen(true)}
      />

      {/* Card Form Dialog */}
      <CardForm
        open={isFormOpen}
        onClose={handleFormClose}
        card={editingCard}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCardDialog
        open={isDeleteOpen}
        onClose={handleDeleteClose}
        card={deletingCard}
      />
    </div>
  );
}
