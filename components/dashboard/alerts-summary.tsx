"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface AlertsSummaryProps {
  count: number;
  isLoading?: boolean;
}

export function AlertsSummary({ count, isLoading }: AlertsSummaryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium md:text-sm">
            Active Alerts
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const hasAlerts = count > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium md:text-sm">
          Active Alerts
        </CardTitle>
        <AlertCircle
          className={`h-4 w-4 ${
            hasAlerts ? "text-orange-500" : "text-muted-foreground"
          }`}
        />
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold md:text-2xl">{count}</div>
        <p className="mt-1 text-xs text-muted-foreground">
          {hasAlerts ? "Notifications pending" : "All clear"}
        </p>
        <Link href="/alerts">
          <Button
            variant={hasAlerts ? "default" : "outline"}
            size="sm"
            className="mt-3 w-full md:mt-4"
          >
            {hasAlerts ? "View Alerts" : "Manage Alerts"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
