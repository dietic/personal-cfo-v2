"use client";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase-browser";
import type { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    isAdmin: false,
  });

  // Track profile fetch failures to prevent infinite loops
  const profileFetchAttempts = useRef(0);
  const maxProfileFetchAttempts = 3;

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    const getInitialSession = async () => {
      try {
        // Prefer server-side fetch to avoid client RLS/session race on refresh
        const res = await fetch("/api/me", { cache: "no-store" });
        if (res.ok) {
          const json = (await res.json()) as {
            success: boolean;
            data: { user: User; profile: Profile };
          };
          const { user, profile } = json.data;

          // Reset counter on successful fetch
          profileFetchAttempts.current = 0;

          // Also grab the current session for completeness
          const {
            data: { session },
          } = await supabase.auth.getSession();

          setState({
            user,
            profile,
            session: session ?? null,
            loading: false,
            isAdmin: profile?.is_admin ?? false,
          });
          return;
        }

        // Fallback to client session if /api/me is not available (e.g., network)
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (session?.user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          const profile = profileData as Profile | null;
          if (!profile) {
            profileFetchAttempts.current += 1;
            logger.warn("profile_missing_after_refresh", {
              attempt: profileFetchAttempts.current,
              max: maxProfileFetchAttempts,
              userId: session.user.id,
            });

            if (profileFetchAttempts.current >= maxProfileFetchAttempts) {
              logger.error("profile_fetch_exceeded_attempts", {
                userId: session.user.id,
              });
              await supabase.auth.signOut();
              window.location.href = "/login?error=profile_load_failed";
              return;
            }
          } else {
            profileFetchAttempts.current = 0;
          }

          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            isAdmin: profile?.is_admin ?? false,
          });
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            isAdmin: false,
          });
        }
      } catch (error) {
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          isAdmin: false,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch profile on auth change
        // Prefer hitting the server to avoid client-side races
        let profile: Profile | null = null;
        try {
          const res = await fetch("/api/me", { cache: "no-store" });
          if (res.ok) {
            const json = (await res.json()) as {
              success: boolean;
              data: { user: User; profile: Profile };
            };
            profile = json.data.profile;
          }
        } catch {
          // ignore and fallback
        }

        if (!profile) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          profile = (profileData as Profile | null) ?? null;
        }

        setState({
          user: session.user,
          profile,
          session,
          loading: false,
          isAdmin: profile?.is_admin ?? false,
        });

        // Handle specific events
        if (event === "SIGNED_IN") {
          router.refresh();
        }
      } else {
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          isAdmin: false,
        });

        if (event === "SIGNED_OUT") {
          router.push("/login");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } finally {
      // Force a hard redirect to login
      window.location.href = "/login";
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;

    const supabase = createClient();
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", state.user.id)
      .single();

    const profile = profileData as Profile | null;

    setState((prev) => ({
      ...prev,
      profile,
      isAdmin: profile?.is_admin ?? false,
    }));
  }, [state.user]);

  return {
    ...state,
    signOut,
    refreshProfile,
  };
}
