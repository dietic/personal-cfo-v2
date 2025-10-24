"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocale } from "@/contexts/locale-context";
import { CategoriesTab } from "@/components/settings/categories-table";
import { KeywordsTab } from "@/components/settings/keywords-manager";
import { ExcludedKeywordsTab } from "@/components/settings/excluded-keywords";

type TabKey = "categories" | "keywords" | "excluded";

export default function SettingsPage() {
  const { t } = useLocale();
  const [tab, setTab] = useState<TabKey>("categories");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("dashboard.navigation.settings")}
          </h1>
          <p className="text-muted-foreground">
            {t("settings.subtitle")}
          </p>
        </div>
      </div>

      <Card className="p-2">
        <div className="flex items-center gap-2">
          <Button
            variant={tab === "categories" ? "default" : "ghost"}
            onClick={() => setTab("categories")}
            aria-current={tab === "categories"}
            aria-controls="settings-categories-panel"
          >
            {t("settings.tabs.categories")}
          </Button>
          <Button
            variant={tab === "keywords" ? "default" : "ghost"}
            onClick={() => setTab("keywords")}
            aria-current={tab === "keywords"}
            aria-controls="settings-keywords-panel"
          >
            {t("settings.tabs.keywords")}
          </Button>
          <Button
            variant={tab === "excluded" ? "default" : "ghost"}
            onClick={() => setTab("excluded")}
            aria-current={tab === "excluded"}
            aria-controls="settings-excluded-panel"
          >
            {t("settings.tabs.excluded")}
          </Button>
        </div>
      </Card>

      <section id="settings-categories-panel" hidden={tab !== "categories"}>
        <CategoriesTab />
      </section>
      <section id="settings-keywords-panel" hidden={tab !== "keywords"}>
        <KeywordsTab />
      </section>
      <section id="settings-excluded-panel" hidden={tab !== "excluded"}>
        <ExcludedKeywordsTab />
      </section>
    </div>
  );
}
