export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          last_name?: string | null;
          is_admin?: boolean;
          locale?: string;
          timezone?: string;
          plan?: "free" | "plus" | "pro" | "admin";
          plan_start_date?: string;
          primary_currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          last_name?: string | null;
          is_admin?: boolean;
          locale?: string;
          timezone?: string;
          plan?: "free" | "plus" | "pro" | "admin";
          plan_start_date?: string;
          primary_currency?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      banks: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          brand_color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          brand_color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          brand_color?: string | null;
          created_at?: string;
        };
      };
      cards: {
        Row: {
          id: string;
          user_id: string;
          bank_id: string;
          name: string;
          due_date: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bank_id: string;
          name: string;
          due_date?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bank_id?: string;
          name?: string;
          due_date?: number | null;
          created_at?: string;
        };
      };
      statements: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          file_name: string;
          status: "processing" | "completed" | "failed";
          uploaded_at: string;
          file_type: string;
          failure_reason: string | null;
          retry_count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id: string;
          file_name: string;
          status?: "processing" | "completed" | "failed";
          uploaded_at?: string;
          file_type: string;
          failure_reason?: string | null;
          retry_count?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          card_id?: string;
          file_name?: string;
          status?: "processing" | "completed" | "failed";
          uploaded_at?: string;
          file_type?: string;
          failure_reason?: string | null;
          retry_count?: number;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          statement_id: string | null;
          card_id: string;
          description: string;
          merchant: string | null;
          transaction_date: string;
          category_id: string | null;
          currency: string;
          amount_cents: number;
          type: "income" | "expense";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          statement_id?: string | null;
          card_id: string;
          description: string;
          merchant?: string | null;
          transaction_date: string;
          category_id?: string | null;
          currency: string;
          amount_cents: number;
          type: "income" | "expense";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          statement_id?: string | null;
          card_id?: string;
          description?: string;
          merchant?: string | null;
          transaction_date?: string;
          category_id?: string | null;
          currency?: string;
          amount_cents?: number;
          type?: "income" | "expense";
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          emoji: string | null;
          color: string | null;
          status: "active" | "inactive";
          created_at: string;
          is_preset: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          emoji?: string | null;
          color?: string | null;
          status?: "active" | "inactive";
          created_at?: string;
          is_preset?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          emoji?: string | null;
          color?: string | null;
          status?: "active" | "inactive";
          created_at?: string;
          is_preset?: boolean;
        };
      };
      category_keywords: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          keyword: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          keyword: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          keyword?: string;
          created_at?: string;
        };
      };
      excluded_keywords: {
        Row: {
          id: string;
          user_id: string;
          keyword: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          keyword: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          keyword?: string;
          created_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount_cents: number;
          currency: string;
          active: boolean;
          created_at: string;
          period_start: string;
          period_end: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount_cents: number;
          currency: string;
          active?: boolean;
          created_at?: string;
          period_start: string;
          period_end: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          amount_cents?: number;
          currency?: string;
          active?: boolean;
          created_at?: string;
          period_start?: string;
          period_end?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          rule_type: "budget_overrun" | "unusual_spike";
          params_json: Json;
          active: boolean;
          created_at: string;
          last_triggered_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          rule_type: "budget_overrun" | "unusual_spike";
          params_json: Json;
          active?: boolean;
          created_at?: string;
          last_triggered_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          rule_type?: "budget_overrun" | "unusual_spike";
          params_json?: Json;
          active?: boolean;
          created_at?: string;
          last_triggered_at?: string | null;
        };
      };
      alert_notifications: {
        Row: {
          id: string;
          user_id: string;
          alert_id: string;
          triggered_at: string;
          message: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          alert_id: string;
          triggered_at?: string;
          message: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          alert_id?: string;
          triggered_at?: string;
          message?: string;
          read_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      plan_type: "free" | "plus" | "pro" | "admin";
      statement_status: "processing" | "completed" | "failed";
      transaction_type: "income" | "expense";
      category_status: "active" | "inactive";
      alert_rule_type: "budget_overrun" | "unusual_spike";
    };
  };
};
