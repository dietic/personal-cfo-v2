"use client";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:py-32">
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary sm:px-4 sm:text-sm">
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="whitespace-nowrap">
            Free during beta • No credit card required
          </span>
        </div>

        {/* Headline */}
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:mt-8 sm:text-5xl md:text-7xl lg:text-8xl">
          Take control of
          <br />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            your finances
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-4 max-w-2xl px-2 text-base text-muted-foreground sm:mt-6 sm:text-lg md:text-xl">
          Upload bank statements, auto-categorize transactions, and see exactly
          where your money goes. Built for people who want clarity, not
          complexity.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex w-full flex-col items-center gap-3 px-4 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4 sm:px-0">
          <Button
            size="lg"
            className="w-full gap-2 text-base shadow-lg sm:w-auto"
          >
            Join the waiting list
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2 text-base sm:w-auto"
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            See how it works
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground sm:mt-12 sm:flex-row sm:gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            <span>No PDFs stored</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            <span>Bank-level security</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>

      {/* Gradient background effect */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl sm:h-96 sm:w-96" />

        {/* Floating credit card - top left */}
        <div className="absolute -left-16 top-12 scale-75 opacity-[0.12] sm:-left-8 sm:top-20 sm:scale-90 sm:opacity-[0.15] md:left-8 md:scale-100">
          <div className="rotate-[-15deg] transform">
            <div className="relative h-44 w-72 overflow-hidden rounded-2xl bg-gradient-to-br from-chart-1 to-chart-2 p-5 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-12 rounded bg-warning/20 backdrop-blur-sm" />
                  <div className="text-xs font-semibold text-white/90">
                    VISA
                  </div>
                </div>
                <div>
                  <div className="mb-3 font-mono text-sm tracking-wider text-white/90">
                    •••• •••• •••• 4829
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-white/60">
                        Card Holder
                      </div>
                      <div className="text-xs font-medium text-white/90">
                        JOHN DOE
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/60">Expires</div>
                      <div className="text-xs font-medium text-white/90">
                        12/28
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating credit card - top right */}
        <div className="absolute -right-16 top-24 scale-75 opacity-[0.12] sm:-right-8 sm:top-32 sm:scale-90 sm:opacity-[0.15] md:right-12 md:scale-100">
          <div className="rotate-[12deg] transform">
            <div className="relative h-44 w-72 overflow-hidden rounded-2xl bg-gradient-to-br from-chart-3 to-chart-4 p-5 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-12 rounded bg-white/20 backdrop-blur-sm" />
                  <div className="text-xs font-semibold text-white/90">
                    Mastercard
                  </div>
                </div>
                <div>
                  <div className="mb-3 font-mono text-sm tracking-wider text-white/90">
                    •••• •••• •••• 7392
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-white/60">
                        Card Holder
                      </div>
                      <div className="text-xs font-medium text-white/90">
                        JANE SMITH
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/60">Expires</div>
                      <div className="text-xs font-medium text-white/90">
                        09/27
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating credit card - bottom left */}
        <div className="absolute -left-20 bottom-12 scale-75 opacity-[0.1] sm:-left-12 sm:bottom-20 sm:scale-90 sm:opacity-[0.12] md:left-16 md:scale-100">
          <div className="rotate-[8deg] transform">
            <div className="relative h-44 w-72 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-5 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-12 rounded bg-white/20 backdrop-blur-sm" />
                  <div className="text-xs font-semibold text-white/90">
                    AMEX
                  </div>
                </div>
                <div>
                  <div className="mb-3 font-mono text-sm tracking-wider text-white/90">
                    •••• •••••• •5018
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-white/60">
                        Card Holder
                      </div>
                      <div className="text-xs font-medium text-white/90">
                        ALEX BROWN
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/60">Expires</div>
                      <div className="text-xs font-medium text-white/90">
                        03/29
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating credit card - bottom right */}
        <div className="absolute -right-20 bottom-24 scale-75 opacity-[0.1] sm:-right-12 sm:bottom-32 sm:scale-90 sm:opacity-[0.12] md:right-20 md:scale-100">
          <div className="rotate-[-10deg] transform">
            <div className="relative h-44 w-72 overflow-hidden rounded-2xl bg-gradient-to-br from-chart-5 to-destructive p-5 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-12 rounded bg-white/20 backdrop-blur-sm" />
                  <div className="text-xs font-semibold text-white/90">
                    Discover
                  </div>
                </div>
                <div>
                  <div className="mb-3 font-mono text-sm tracking-wider text-white/90">
                    •••• •••• •••• 8461
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-[10px] text-white/60">
                        Card Holder
                      </div>
                      <div className="text-xs font-medium text-white/90">
                        MARIA GARCIA
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/60">Expires</div>
                      <div className="text-xs font-medium text-white/90">
                        06/26
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
