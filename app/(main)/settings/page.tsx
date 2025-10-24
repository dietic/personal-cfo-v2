"use client";

import { CategoriesTab } from "@/components/settings/categories-table";
import { ExcludedKeywordsTab } from "@/components/settings/excluded-keywords";
import { KeywordsTab } from "@/components/settings/keywords-manager";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/locale-context";
import { useState } from "react";

type Tab = "categories" | "keywords" | "excluded";

export default function SettingsPage() {
  const { t } = useLocale();
  const [active, setActive] = useState<Tab>("categories");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("dashboard.navigation.settings")}
        </h2>
        <p className="text-sm text-muted-foreground md:text-base">
          {t("settings.subtitle")}
        </p>
      </div>

      <div className="flex gap-2 border-b">
        <Button
          variant={active === "categories" ? "default" : "ghost"}
          onClick={() => setActive("categories")}
          className="rounded-b-none"
        >
          {t("settings.tabs.categories")}
        </Button>
        <Button
          variant={active === "keywords" ? "default" : "ghost"}
          onClick={() => setActive("keywords")}
          className="rounded-b-none"
        >
          {t("settings.tabs.keywords")}
        </Button>
        <Button
          variant={active === "excluded" ? "default" : "ghost"}
          onClick={() => setActive("excluded")}
          className="rounded-b-none"
        >
          {t("settings.tabs.excluded")}
        </Button>
      </div>

      {active === "categories" && <CategoriesTab />}
      {active === "keywords" && <KeywordsTab />}
      {active === "excluded" && <ExcludedKeywordsTab />}
    </div>
  );
}
