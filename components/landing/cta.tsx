"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { ArrowRight, TrendingUp } from "lucide-react";

export function Cta() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 p-12 md:p-16">
        {/* Content */}
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/50 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur">
            <TrendingUp className="h-4 w-4" />
            <span>Join 1,000+ people taking control</span>
          </div>

          <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Ready to understand
            <br />
            <span className="text-primary">where your money goes?</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Stop guessing. Start knowing. Get your free account and see exactly
            how much you spend on everything—in minutes, not hours.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2 text-base shadow-lg">
              Join the waiting list
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Free during beta • No credit card required
            </p>
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      </div>
    </section>
  );
}
