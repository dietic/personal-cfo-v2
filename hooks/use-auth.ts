"use client";

import { createClient } from "@/lib/supabase-browser";
import type { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  last_name: string | null;
  is_admin: boolean;
  locale: string;
  timezone: string;
  plan: "free" | "plus" | "pro" | "admin";
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

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Fetch profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          const profile = profileData as Profile | null;

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
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        const profile = profileData as Profile | null;

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

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (!state.user) return;

    const supabase = createClient();
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", state.user.id)
      .single();

    const profile = profileData as Profile | null;

    setState((prev) => ({
      ...prev,
      profile,
      isAdmin: profile?.is_admin ?? false,
    }));
  };

  return {
    ...state,
    signOut,
    refreshProfile,
  };
}
