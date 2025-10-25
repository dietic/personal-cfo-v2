"use client";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

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
  isLoading: boolean;
  error: Error | null;
}

// Singleton auth manager to prevent multiple fetches
class AuthManager {
  private static instance: AuthManager | null = null;
  private user: User | null = null;
  private profile: Profile | null = null;
  private loading = false;
  private error: Error | null = null;
  private promise: Promise<{ user: User; profile: Profile } | null> | null =
    null;
  private listeners: Set<(state: AuthState) => void> = new Set();

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private constructor() {
    // Private constructor for singleton
  }

  getState(): AuthState {
    return {
      user: this.user,
      profile: this.profile,
      isLoading: this.loading,
      error: this.error,
    };
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  async fetchUser(): Promise<{ user: User; profile: Profile } | null> {
    // If already fetching, return the same promise
    if (this.promise) {
      logger.info("AuthManager: Returning existing promise");
      return this.promise;
    }

    // If we have a user and not loading, return cached
    if (this.user && this.profile && !this.loading) {
      logger.info("AuthManager: Returning cached user");
      return { user: this.user, profile: this.profile };
    }

    this.loading = true;
    this.error = null;
    this.notify();

    this.promise = this.performFetch();

    try {
      const result = await this.promise;
      if (result) {
        this.user = result.user;
        this.profile = result.profile;
      } else {
        this.user = null;
        this.profile = null;
      }
      this.loading = false;
      this.notify();
      return result;
    } catch (err) {
      this.error = err as Error;
      this.loading = false;
      this.user = null;
      this.profile = null;
      this.notify();
      throw err;
    } finally {
      this.promise = null;
    }
  }

  private async performFetch(): Promise<{
    user: User;
    profile: Profile;
  } | null> {
    logger.info("AuthManager: Starting auth fetch");

    // Try /api/me first
    try {
      const res = await fetch("/api/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          logger.info("AuthManager: /api/me succeeded");
          return {
            user: data.data.user,
            profile: data.data.profile,
          };
        }
      }
    } catch (_err) {
      logger.warn("AuthManager: /api/me failed, trying Supabase");
    }

    // Fallback to Supabase
    const supabase = createClient();
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData?.session?.user) {
      logger.info("AuthManager: No session found");
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", sessionData.session.user.id)
      .single();

    if (!profile) {
      logger.warn("AuthManager: Session exists but no profile");
      return null;
    }

    logger.info("AuthManager: Supabase fallback succeeded");
    return {
      user: sessionData.session.user,
      profile: profile as Profile,
    };
  }

  clearUser() {
    this.user = null;
    this.profile = null;
    this.loading = false;
    this.error = null;
    this.promise = null;
    this.notify();
  }

  async signOut() {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } finally {
      this.clearUser();
      // Force a hard redirect to login
      window.location.href = "/login";
    }
  }
}

export default AuthManager;
