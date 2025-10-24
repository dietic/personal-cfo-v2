"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Smile } from "lucide-react";
import { useState } from "react";

interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
  label: string;
}

export function CategoryEmojiPicker({
  value,
  onChange,
  label,
}: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onChange(emojiData.emoji);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            type="button"
          >
            {value ? (
              <span className="text-2xl">{value}</span>
            ) : (
              <Smile className="h-5 w-5 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground">
              {value ? "Change emoji" : "Select emoji"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={Theme.AUTO}
            searchPlaceholder="Search emoji..."
            previewConfig={{ showPreview: false }}
            width={350}
            height={400}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
