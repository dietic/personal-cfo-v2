"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/use-translation";
import { RotateCw } from "lucide-react";

interface RecurringService {
  merchant: string;
  count: number;
  total_cents: number;
  currency: string;
}

interface RecurrentServicesSummaryProps {
  services: RecurringService[];
  isLoading?: boolean;
}

export function RecurrentServicesSummary({
  services,
  isLoading,
}: RecurrentServicesSummaryProps) {
  const { t } = useTranslation();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium md:text-sm">
            {t("dashboard.recurring.title")}
          </CardTitle>
          <RotateCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const topServices = services.slice(0, 3);
  const totalServices = services.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium md:text-sm">
          {t("dashboard.recurring.title")}
        </CardTitle>
        <RotateCw className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold md:text-2xl">{totalServices}</div>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("dashboard.recurring.subscriptions")}
        </p>
        {topServices.length > 0 && (
          <div className="mt-3 space-y-2 md:mt-4">
            {topServices.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-xs md:text-sm"
              >
                <span className="text-muted-foreground">
                  {service.merchant}
                </span>
                <span className="font-medium">
                  {(service.total_cents / 100).toLocaleString("en-US", {
                    style: "currency",
                    currency: service.currency,
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
