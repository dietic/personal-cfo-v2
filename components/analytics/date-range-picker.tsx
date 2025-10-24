/**
 * Date Range Picker Component
 * Preset buttons for common date ranges
 */

"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const handlePreset = (days: number) => {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    // Send full ISO strings for accurate date handling
    onChange(fromDate.toISOString(), toDate.toISOString());
  };

  // Calculate which preset is currently active
  const getActivePreset = () => {
    if (!from || !to) return null;

    const fromDate = new Date(from);
    const toDate = new Date(to);
    const daysDiff = Math.round(
      (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Allow some tolerance for time differences
    if (daysDiff >= 28 && daysDiff <= 32) return 30;
    if (daysDiff >= 88 && daysDiff <= 92) return 90;
    if (daysDiff >= 178 && daysDiff <= 182) return 180;
    if (daysDiff >= 363 && daysDiff <= 367) return 365;

    return null;
  };

  const activePreset = getActivePreset();

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <div className="flex gap-1 rounded-lg border bg-background p-1">
        <Button
          variant={activePreset === 30 ? "default" : "ghost"}
          size="sm"
          onClick={() => handlePreset(30)}
          className="h-7 px-3 text-xs"
        >
          30d
        </Button>
        <Button
          variant={activePreset === 90 ? "default" : "ghost"}
          size="sm"
          onClick={() => handlePreset(90)}
          className="h-7 px-3 text-xs"
        >
          90d
        </Button>
        <Button
          variant={activePreset === 180 ? "default" : "ghost"}
          size="sm"
          onClick={() => handlePreset(180)}
          className="h-7 px-3 text-xs"
        >
          6m
        </Button>
        <Button
          variant={activePreset === 365 ? "default" : "ghost"}
          size="sm"
          onClick={() => handlePreset(365)}
          className="h-7 px-3 text-xs"
        >
          1y
        </Button>
      </div>
    </div>
  );
}
