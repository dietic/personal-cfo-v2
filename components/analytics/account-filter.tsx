/**
 * Account Filter Component
 * Optional dropdown to filter by card/account
 */

"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AccountFilterProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  accounts?: Array<{ id: string; name: string }>;
}

export function AccountFilter({
  value,
  onChange,
  accounts = [],
}: AccountFilterProps) {
  if (accounts.length === 0) {
    return null;
  }

  return (
    <Select
      value={value || "all"}
      onValueChange={(v) => onChange(v === "all" ? undefined : v)}
    >
      <SelectTrigger className="w-[180px] h-8 text-xs">
        <SelectValue placeholder="All accounts" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All accounts</SelectItem>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
