"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useChat } from "@/hooks/use-chat";
import { useTranslation } from "@/hooks/use-translation";
import { X } from "lucide-react";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { UsageIndicator } from "./usage-indicator";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  const { t } = useTranslation();
  const { messages, isLoading, sendMessage, usage } = useChat();

  const handleSend = async (query: string) => {
    await sendMessage(query);
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md [&>button]:hidden"
      >
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <SheetTitle>{t("chat.title")}</SheetTitle>
              <SheetDescription className="sr-only">
                {t("chat.empty.description")}
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              <UsageIndicator usage={usage} />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
        </SheetHeader>

        <ChatMessages messages={messages} isLoading={isLoading} />

        <div className="p-4">
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
