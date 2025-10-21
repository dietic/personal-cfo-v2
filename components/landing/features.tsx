"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";

export function Features() {
  const { t } = useTranslation();

  const FEATURES = [
    {
      emoji: "⚡",
      titleKey: "landing.features.fast.title",
      descKey: "landing.features.fast.description",
    },
    {
      emoji: "🎯",
      titleKey: "landing.features.smart.title",
      descKey: "landing.features.smart.description",
    },
    {
      emoji: "📊",
      titleKey: "landing.features.insights.title",
      descKey: "landing.features.insights.description",
    },
    {
      emoji: "🔔",
      titleKey: "landing.features.alerts.title",
      descKey: "landing.features.alerts.description",
    },
    {
      emoji: "💳",
      titleKey: "landing.features.cards.title",
      descKey: "landing.features.cards.description",
    },
    {
      emoji: "🔒",
      titleKey: "landing.features.privacy.title",
      descKey: "landing.features.privacy.description",
    },
  ];

  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      {/* Section header */}
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          {t("landing.features.title")}
          <br />
          <span className="text-primary">{t("landing.features.subtitle")}</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {t("landing.features.description")}
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <Card
            key={f.titleKey}
            className="group border-border transition-all hover:border-primary/40 hover:shadow-lg"
          >
            <CardContent className="pt-6">
              <div className="mb-4 text-lg transition-transform">{f.emoji}</div>
              <h3 className="mb-2 text-xl font-semibold">{t(f.titleKey)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(f.descKey)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
