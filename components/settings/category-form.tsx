"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocale } from "@/contexts/locale-context";
import { cn } from "@/lib/utils";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/lib/validators/categories";
import { zodResolver } from "@hookform/resolvers/zod";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Check, Loader2, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(50),
  emoji: z.string().max(8).optional().nullable(),
  color: z.string().max(24).optional().nullable(),
});

// Preset colors matching the 6 default categories from seed data
const PRESET_COLORS = [
  { name: "Orange", value: "#f97316" }, // Food 🍔
  { name: "Slate", value: "#64748b" }, // Housing 🏠
  { name: "Teal", value: "#14b8a6" }, // Transportation 🚗
  { name: "Indigo", value: "#6366f1" }, // Income 💵
  { name: "Purple", value: "#a855f7" }, // Entertainment 🎮
  { name: "Blue", value: "#3b82f6" }, // Shopping 🛒
];

export function CategoryFormDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    values: CreateCategoryInput | UpdateCategoryInput
  ) => Promise<void>;
  initial?: { name: string; emoji: string | null; color: string | null } | null;
  isLoading?: boolean;
}) {
  const { t } = useLocale();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [customColorOpen, setCustomColorOpen] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", emoji: "", color: "" },
  });

  useEffect(() => {
    if (props.open) {
      form.reset({
        name: props.initial?.name ?? "",
        emoji: props.initial?.emoji ?? "",
        color: props.initial?.color ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open, props.initial, form]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    form.setValue("emoji", emojiData.emoji);
    setEmojiPickerOpen(false);
  };

  const selectedColor = form.watch("color");
  const isCustomColor =
    selectedColor && !PRESET_COLORS.some((c) => c.value === selectedColor);

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {props.initial
              ? t("settings.categories.editTitle")
              : t("settings.categories.createTitle")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (values) => {
              await props.onSubmit({
                name: values.name.trim(),
                emoji: values.emoji ? values.emoji : null,
                color: values.color ? values.color : null,
              });
              props.onOpenChange(false);
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.categories.name")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("settings.categories.namePh")}
                      aria-label={t("settings.categories.name")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.categories.emoji")}</FormLabel>
                  <Popover
                    open={emojiPickerOpen}
                    onOpenChange={setEmojiPickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-start text-left font-normal h-9",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <span className="text-base mr-2">
                            {field.value || "😀"}
                          </span>
                          <span className="text-sm">
                            {field.value
                              ? t("settings.categories.emoji")
                              : "Select emoji..."}
                          </span>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <EmojiPicker
                        onEmojiClick={handleEmojiClick}
                        width="100%"
                        height={400}
                        theme={Theme.AUTO}
                        searchPlaceHolder="Search emoji..."
                        previewConfig={{ showPreview: false }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("settings.categories.color")}</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => form.setValue("color", color.value)}
                          className={cn(
                            "relative h-7 w-7 rounded-full transition-all hover:scale-110",
                            selectedColor === color.value
                              ? "ring-2 ring-foreground"
                              : ""
                          )}
                          style={{ backgroundColor: color.value }}
                          aria-label={`Select ${color.name} color`}
                        >
                          {selectedColor === color.value && (
                            <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                          )}
                        </button>
                      ))}

                      <Popover
                        open={customColorOpen}
                        onOpenChange={setCustomColorOpen}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "relative h-7 w-7 rounded-full transition-all hover:scale-110 flex items-center justify-center",
                              isCustomColor
                                ? "ring-2 ring-foreground"
                                : "bg-muted"
                            )}
                            style={
                              isCustomColor
                                ? {
                                    backgroundColor: selectedColor ?? undefined,
                                  }
                                : undefined
                            }
                            aria-label="Select custom color"
                          >
                            {isCustomColor ? (
                              <Check className="h-4 w-4 text-white drop-shadow" />
                            ) : (
                              <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3" align="start">
                          <div className="space-y-3">
                            <div className="text-sm font-medium">
                              Custom Color
                            </div>
                            <HexColorPicker
                              color={field.value ?? "#000000"}
                              onChange={(color) =>
                                form.setValue("color", color)
                              }
                              style={{ width: "100%" }}
                            />
                            <div className="flex items-center gap-2">
                              <Input
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  form.setValue("color", e.target.value)
                                }
                                placeholder="#16a34a"
                                className="flex-1 font-mono text-xs"
                              />
                              <div
                                className="h-8 w-8 rounded border border-border flex-shrink-0"
                                style={{
                                  backgroundColor: field.value ?? "#000000",
                                }}
                              />
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => props.onOpenChange(false)}
                disabled={props.isLoading}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={props.isLoading}>
                {props.isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {props.initial ? t("common.update") : t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
