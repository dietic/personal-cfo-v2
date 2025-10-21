"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { Check, Sparkles } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect to get started",
    popular: false,
    features: [
      "1 card",
      "2 statements per month",
      "6 system categories",
      "Basic analytics",
      "Keyword categorization",
    ],
  },
  {
    name: "Plus",
    price: "$19.99",
    period: "/month",
    description: "Best for individuals",
    popular: true,
    features: [
      "5 cards",
      "Unlimited statements",
      "Up to 25 custom categories",
      "Advanced analytics",
      "Budget tracking",
      "6 real-time alerts",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    price: "$49.99",
    period: "/month",
    description: "For power users",
    popular: false,
    features: [
      "Unlimited cards",
      "Unlimited statements",
      "Unlimited categories",
      "Full analytics suite",
      "15 budgets",
      "10 alerts",
      "Dedicated support",
    ],
  },
];

export function Pricing() {
  const { t } = useTranslation();
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      {/* Section header */}
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Simple, transparent pricing
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Start free. Upgrade when you&apos;re ready. Cancel anytime—no
          questions asked.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid gap-8 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
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
                  Most popular
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
              <div className="mt-4">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                variant={plan.popular ? "default" : "outline"}
                className="w-full"
              >
                {plan.name === "Free" ? "Start free" : "Join waiting list"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust badge */}
      <div className="mt-12 text-center text-sm text-muted-foreground">
        💳 No credit card required during beta • 🔒 Secure payment via Stripe
        (coming soon)
      </div>
    </section>
  );
}
