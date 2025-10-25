"use client";

import { ChatWidget } from "@/components/chat";
import { useAuth } from "@/hooks/use-auth";

export function ChatProvider() {
  const { profile, loading } = useAuth();

  // While loading auth/profile, don't render anything
  if (loading) return null;

  // If profile is not available, do not render the chat yet
  if (!profile) return null;

  // Hide chat entirely for free plan users (no bubble, no modal)
  // Use profile.plan directly from useAuth - it's already fresh from the server
  const eligible = profile.plan !== "free";
  if (!eligible) return null;

  // Plus, Pro, and Admin users get full chat access
  return <ChatWidget />;
}
