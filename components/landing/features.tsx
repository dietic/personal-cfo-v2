"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";

const FEATURES = [
  {
    emoji: "⚡",
    title: "Lightning-fast uploads",
    desc: "Drop your PDF bank statements and get insights in seconds. We extract, parse, and categorize automatically.",
  },
  {
    emoji: "🎯",
    title: "Smart categorization",
    desc: "Set your own rules with keywords. First match wins. Transactions are auto-tagged as they arrive.",
  },
  {
    emoji: "📊",
    title: "Visual analytics",
    desc: "Three crystal-clear charts show spending trends, category breakdowns, and monthly patterns at a glance.",
  },
  {
    emoji: "🔔",
    title: "Real-time alerts",
    desc: "Get notified when you exceed budgets or spending spikes unusually. Stay on top of your money, effortlessly.",
  },
  {
    emoji: "💳",
    title: "Multi-card tracking",
    desc: "Connect all your cards and accounts in one place. See the complete picture, not just fragments.",
  },
  {
    emoji: "🔒",
    title: "Privacy-first",
    desc: "Your PDFs are never stored. We process them in memory and delete immediately after extraction.",
  },
];

export function Features() {
  const { t } = useTranslation();
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      {/* Section header */}
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Everything you need to
          <br />
          <span className="text-primary">master your money</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Powerful features designed for simplicity. No jargon, no clutter—just
          the tools you need.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <Card
            key={f.title}
            className="group border-border transition-all hover:border-primary/40 hover:shadow-lg"
          >
            <CardContent className="pt-6">
              <div className="mb-4 text-lg transition-transform">{f.emoji}</div>
              <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
