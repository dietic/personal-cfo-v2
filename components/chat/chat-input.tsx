"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/use-translation";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder,
}: ChatInputProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, but allow Shift+Enter for newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border bg-background p-4"
    >
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t("chat.inputPlaceholder")}
          disabled={disabled}
          className="min-h-[60px] max-h-[120px] resize-none"
          maxLength={500}
        />
        <Button
          type="submit"
          size="icon"
          disabled={disabled || !input.trim()}
          className="h-[60px] w-[60px] shrink-0"
        >
          <Send className="h-5 w-5" />
          <span className="sr-only">{t("chat.send")}</span>
        </Button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {input.length}/500 • Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
