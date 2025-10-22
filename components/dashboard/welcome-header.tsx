"use client";

import { useAuth } from "@/hooks/use-auth";

export function WelcomeHeader() {
  const { profile } = useAuth();

  return (
    <div className="mb-4 md:mb-6">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        Welcome back, {profile?.name || "there"}!
      </h1>
      <p className="mt-1 text-sm text-muted-foreground md:mt-2 md:text-base">
        Here&apos;s an overview of your financial activity
      </p>
    </div>
  );
}
