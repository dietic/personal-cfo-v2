"use client";

import AuthManager, { type AuthState } from "@/lib/auth-manager";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  last_name: string | null;
  is_admin: boolean;
  locale: string;
  timezone: string;
  plan: "free" | "plus" | "pro" | "admin";
  plan_start_date: string;
  primary_currency: string;
  created_at: string;
  updated_at: string;
}

export type { AuthState };

export function useAuth(options: { required?: boolean } = {}) {
  const [state, setState] = useState<AuthState>(() =>
    AuthManager.getInstance().getState()
  );
  const router = useRouter();

  useEffect(() => {
    const authManager = AuthManager.getInstance();

    // Subscribe to auth state changes
    const unsubscribe = authManager.subscribe(setState);

    // Only fetch if we don't have a user and aren't loading
    if (!state.user && !state.isLoading) {
      authManager.fetchUser().catch(() => {
        // Error is already handled in AuthManager
      });
    }

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (options.required && !state.isLoading && !state.user) {
      router.push("/login");
    }
  }, [state.isLoading, state.user, options.required, router]);

  const signOut = async () => {
    await AuthManager.getInstance().signOut();
  };

  const refreshProfile = async () => {
    await AuthManager.getInstance().fetchUser();
  };

  return {
    user: state.user,
    profile: state.profile,
    session: null, // For backward compatibility
    loading: state.isLoading,
    isAdmin: state.profile?.is_admin ?? false,
    error: state.error,
    signOut,
    refreshProfile,
  };
}
