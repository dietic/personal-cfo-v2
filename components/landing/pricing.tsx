"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { Check, Sparkles } from "lucide-react";

export function Pricing() {
  const { t } = useTranslation();

  const PLANS = [
    {
      nameKey: "landing.pricing.free.name",
      price: "$0",
      descKey: "landing.pricing.free.description",
      popular: false,
      features: [
        "landing.pricing.free.feature1",
        "landing.pricing.free.feature2",
        "landing.pricing.free.feature3",
        "landing.pricing.free.feature4",
        "landing.pricing.free.feature5",
        "landing.pricing.free.feature6",
      ],
    },
    {
      nameKey: "landing.pricing.plus.name",
      price: "$19.99",
      descKey: "landing.pricing.plus.description",
      popular: true,
      features: [
        "landing.pricing.plus.feature1",
        "landing.pricing.plus.feature2",
        "landing.pricing.plus.feature3",
        "landing.pricing.plus.feature4",
        "landing.pricing.plus.feature5",
        "landing.pricing.plus.feature6",
        "landing.pricing.plus.feature7",
        "landing.pricing.plus.feature8",
      ],
    },
    {
      nameKey: "landing.pricing.pro.name",
      price: "$49.99",
      descKey: "landing.pricing.pro.description",
      popular: false,
      features: [
        "landing.pricing.pro.feature1",
        "landing.pricing.pro.feature2",
        "landing.pricing.pro.feature3",
        "landing.pricing.pro.feature4",
        "landing.pricing.pro.feature5",
        "landing.pricing.pro.feature6",
        "landing.pricing.pro.feature7",
        "landing.pricing.pro.feature8",
      ],
    },
  ];

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      {/* Section header */}
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          {t("landing.pricing.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {t("landing.pricing.subtitle")}
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid gap-8 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.nameKey}
            className={`relative flex flex-col ${
              plan.popular
                ? "scale-105 border-primary shadow-xl lg:scale-110"
                : "border-border"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-1 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                  <Sparkles className="h-3 w-3" />
                  {t("landing.pricing.popular")}
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{t(plan.nameKey)}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t(plan.descKey)}
              </p>
              <div className="mt-4">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">
                  {t("landing.pricing.monthly")}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((featureKey) => (
                  <li key={featureKey} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <span className="text-sm">{t(featureKey)}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                variant={plan.popular ? "default" : "outline"}
                className="w-full"
              >
                {t("landing.pricing.cta")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
