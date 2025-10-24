"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState } from "react";

// Default category colors (matching the 6 preset categories from seed data)
const PRESET_COLORS = [
  { name: "Orange", value: "#f97316" }, // Food 🍔
  { name: "Slate", value: "#64748b" }, // Housing 🏠
  { name: "Teal", value: "#14b8a6" }, // Transportation 🚗
  { name: "Indigo", value: "#6366f1" }, // Income 💵
  { name: "Purple", value: "#a855f7" }, // Entertainment 🎮
  { name: "Blue", value: "#3b82f6" }, // Shopping 🛒
];

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  label: string;
}

export function CategoryColorPicker({
  value,
  onChange,
  label,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  const displayColor = value || PRESET_COLORS[0].value;

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
            <div
              className="h-5 w-5 rounded border"
              style={{ backgroundColor: displayColor }}
            />
            <span className="font-mono text-xs">{displayColor}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-3">
            <div className="text-sm font-medium">Select a color</div>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => {
                    onChange(color.value);
                    setOpen(false);
                    setShowCustom(false);
                  }}
                  className={cn(
                    "h-10 w-10 rounded border-2 transition-all hover:scale-110",
                    value?.toLowerCase() === color.value.toLowerCase()
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-border"
                  )}
                  style={{ backgroundColor: color.value }}
                  aria-label={color.name}
                  title={color.name}
                >
                  {value?.toLowerCase() === color.value.toLowerCase() && (
                    <Check className="h-4 w-4 mx-auto text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
            <div className="border-t pt-3">
              {!showCustom ? (
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={() => setShowCustom(true)}
                >
                  Custom color...
                </Button>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="custom-color">Custom color</Label>
                  <div className="flex gap-2">
                    <input
                      id="custom-color"
                      type="color"
                      value={displayColor}
                      onChange={(e) => onChange(e.target.value)}
                      className="h-10 w-full rounded border cursor-pointer"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => {
                        setShowCustom(false);
                        setOpen(false);
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
