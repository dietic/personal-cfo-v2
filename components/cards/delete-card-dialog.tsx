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
import { useCards, type Card } from "@/hooks/use-cards";
import { useTranslation } from "@/hooks/use-translation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteCardDialogProps {
  open: boolean;
  onClose: () => void;
  card: Card | null;
}

export function DeleteCardDialog({
  open,
  onClose,
  card,
}: DeleteCardDialogProps) {
  const { t } = useTranslation();
  const { deleteCard, isDeleting } = useCards();

  const handleDelete = async () => {
    if (!card) return;

    try {
      await deleteCard(card.id);
      toast.success(t("cards.cardDeleted"));
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("cards.errorDeleting");
      toast.error(message);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("cards.deleteConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("cards.deleteConfirmDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("cards.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("cards.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
