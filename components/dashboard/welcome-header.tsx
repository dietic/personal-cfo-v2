"use client";

import { useAuth } from "@/hooks/use-auth";

export function WelcomeHeader() {
  const { profile } = useAuth();

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome back, {profile?.name || "there"}!
      </h1>
      <p className="mt-2 text-muted-foreground">
        Here&apos;s an overview of your financial activity
      </p>
    </div>
  );
}
