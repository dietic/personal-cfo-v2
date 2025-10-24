"use client";

import type { ChatMessage } from "@/hooks/use-chat";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { useEffect, useRef } from "react";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export function ChatMessages({
  messages,
  isLoading = false,
}: ChatMessagesProps) {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <Bot className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <h3 className="mb-2 text-lg font-semibold">{t("chat.empty.title")}</h3>
        <p className="mb-6 text-sm text-muted-foreground">
          {t("chat.empty.description")}
        </p>
        <div className="w-full max-w-sm space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t("chat.examples.title")}
          </p>
          <div className="space-y-1 text-left text-sm text-muted-foreground">
            <p className="rounded-md bg-muted p-2">
              💰 {t("chat.examples.food")}
            </p>
            <p className="rounded-md bg-muted p-2">
              📊 {t("chat.examples.biggest")}
            </p>
            <p className="rounded-md bg-muted p-2">
              🎯 {t("chat.examples.budgets")}
            </p>
            <p className="rounded-md bg-muted p-2">
              📈 {t("chat.examples.income")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3",
            message.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          {message.role === "assistant" && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </div>
          )}

          <div
            className={cn(
              "max-w-[80%] rounded-lg px-4 py-2",
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            )}
          >
            <p className="whitespace-pre-wrap break-words text-sm">
              {message.content}
            </p>
            <p className="mt-1 text-xs opacity-70">
              {message.timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {message.role === "user" && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div className="max-w-[80%] rounded-lg bg-muted px-4 py-2">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50"></span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
