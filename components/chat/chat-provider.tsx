"use client";

import { ChatWidget } from "@/components/chat";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

export function ChatProvider() {
  const { profile, loading, refreshProfile } = useAuth();
  const [serverEligible, setServerEligible] = useState<boolean | null>(null);

  // Ensure we have the latest plan (handles server-side plan changes)
  useEffect(() => {
    refreshProfile().catch(() => void 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On refresh, double-check plan from the server in case client state is stale
  useEffect(() => {
    if (loading) return;
    // If client already says eligible (non-free), skip network check
    if (profile && profile.plan !== "free") {
      setServerEligible(true);
      return;
    }
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null;
        const json = (await res.json()) as {
          success: boolean;
          data: { profile: { plan: "free" | "plus" | "pro" | "admin" } };
        };
        return json.data.profile.plan;
      })
      .then((plan) => {
        if (cancelled) return;
        if (!plan) {
          setServerEligible(false);
        } else {
          setServerEligible(plan !== "free");
        }
      })
      .catch(() => {
        if (!cancelled) setServerEligible(null);
      });
    return () => {
      cancelled = true;
    };
  }, [loading, profile]);

  // Compute eligibility without hooks to keep hook order stable across renders
  const eligible = (() => {
    if (profile && profile.plan !== "free") return true;
    if (serverEligible !== null) return serverEligible;
    return false;
  })();

  // While loading auth/profile, don't render anything
  if (loading) return null;

  // If profile is not available, do not render the chat yet
  if (!profile) return null;

  // Hide chat entirely for free plan users (no bubble, no modal)
  if (!eligible) return null;

  // Plus, Pro, and Admin users get full chat access
  return <ChatWidget />;
}
