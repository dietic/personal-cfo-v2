/**
 * Currency Toggle Component
 * Simple button group for selecting currency
 */

"use client";

import { Button } from "@/components/ui/button";
import { Currency } from "@/lib/currency";

interface CurrencyToggleProps {
  value: Currency;
  onChange: (currency: Currency) => void;
}

const currencies: Currency[] = ["PEN", "USD", "EUR"];

export function CurrencyToggle({ value, onChange }: CurrencyToggleProps) {
  return (
    <div className="flex gap-1 rounded-lg border bg-background p-1">
      {currencies.map((currency) => (
        <Button
          key={currency}
          variant={value === currency ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(currency)}
          className="h-7 px-3 text-xs font-medium"
        >
          {currency}
        </Button>
      ))}
    </div>
  );
}
