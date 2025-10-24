"use client";

import { X } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { UsageIndicator } from "./usage-indicator";

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  const { t } = useTranslation();
  const { messages, isLoading, sendMessage, clearMessages, usage } = useChat();

  const handleSend = async (query: string) => {
    await sendMessage(query);
  };

  const handleClear = () => {
    clearMessages();
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
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
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 text-xs"
                >
                  {t("chat.clear")}
                </Button>
              )}
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

        <div className="border-t p-4">
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
