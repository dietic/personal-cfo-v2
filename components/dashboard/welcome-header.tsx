"use client";

import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";

export function WelcomeHeader() {
  const { profile } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="mb-4 md:mb-6">
      <h2 className="text-2xl font-bold md:text-3xl">
        {t("dashboard.welcome.title")} {profile?.name || t("dashboard.welcome.fallbackName")}!
      </h2>
      <p className="mt-1 text-sm text-muted-foreground md:mt-2 md:text-base">
        {t("dashboard.welcome.subtitle")}
      </p>
    </div>
  );
}
