"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

interface ChatBubbleProps {
  onClick: () => void;
  hasUnread?: boolean;
  className?: string;
}

export function ChatBubble({
  onClick,
  hasUnread = false,
  className,
}: ChatBubbleProps) {
  const { t } = useTranslation();

  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        className
      )}
      aria-label={t("chat.bubble.label")}
    >
      <MessageCircle className="h-6 w-6" />
      {hasUnread && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
          !
        </span>
      )}
    </Button>
  );
}
