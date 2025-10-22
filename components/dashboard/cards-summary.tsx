"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { CreditCard, Plus } from "lucide-react";
import Link from "next/link";

interface UserCard {
  id: string;
  name: string;
  bank_name: string;
  bank_color: string | null;
  last_four?: string;
}

interface CardsSummaryProps {
  cards: UserCard[];
  isLoading?: boolean;
}

export function CardsSummary({ cards, isLoading }: CardsSummaryProps) {
  const { t } = useTranslation();
  
  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-base font-semibold">
              {t("dashboard.cards.title")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.cards.subtitle")}
            </p>
          </div>
          <CreditCard className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-semibold">
            {t("dashboard.cards.title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.cards.subtitle")}
          </p>
        </div>
        <Link href="/cards">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t("dashboard.cards.addCard")}
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12">
            <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-sm font-medium">{t("dashboard.cards.noCards")}</p>
            <p className="mb-4 text-xs text-muted-foreground">
              {t("dashboard.cards.subtitle")}
            </p>
            <Link href="/cards">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                {t("dashboard.cards.addFirstCard")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map((card) => {
              // Generate gradient based on bank color or use default
              const gradient = card.bank_color
                ? `linear-gradient(135deg, ${card.bank_color} 0%, ${card.bank_color}dd 100%)`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

              return (
                <Link key={card.id} href="/cards">
                  <div
                    className="group relative h-40 cursor-pointer overflow-hidden rounded-xl p-6 text-white shadow-lg transition-transform hover:scale-105"
                    style={{
                      background: gradient,
                    }}
                  >
                    {/* Card chip */}
                    <div className="mb-6 h-10 w-12 rounded bg-yellow-400/90" />

                    {/* Card name/bank */}
                    <div className="mb-2">
                      <p className="text-xs opacity-80">Credit Card</p>
                      <p className="text-lg font-semibold">{card.name}</p>
                    </div>

                    {/* Visa logo or last 4 digits */}
                    <div className="absolute bottom-6 right-6">
                      {card.last_four ? (
                        <p className="text-sm opacity-90">
                          •••• {card.last_four}
                        </p>
                      ) : (
                        <p className="text-xl font-bold opacity-90">VISA</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
