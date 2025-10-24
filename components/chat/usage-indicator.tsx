"use client";

import { useTranslation } from "@/hooks/use-translation";
import type { ChatUsage } from "@/hooks/use-chat";

interface UsageIndicatorProps {
  usage: ChatUsage | null;
}

export function UsageIndicator({ usage }: UsageIndicatorProps) {
  const { t } = useTranslation();

  if (!usage) return null;

  const isUnlimited = usage.limit === "unlimited";
  const remaining = usage.remaining;
  const limit = usage.limit;

  let usageText = "";
  if (isUnlimited) {
    usageText = t("chat.usage.unlimited");
  } else {
    usageText = t("chat.usage.remaining")
      .replace("{count}", String(remaining))
      .replace("{limit}", String(limit));
  }

  return (
    <p className="text-xs text-muted-foreground">{usageText}</p>
  );
}
