-- Create custom types
CREATE TYPE plan_type AS ENUM ('free', 'plus', 'pro', 'admin');
CREATE TYPE statement_status AS ENUM ('processing', 'completed', 'failed');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE category_status AS ENUM ('active', 'inactive');
CREATE TYPE alert_rule_type AS ENUM ('budget_overrun', 'unusual_spike');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- Extends auth.users with app-specific fields
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  last_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE NOT NULL,
  locale TEXT DEFAULT 'en' NOT NULL CHECK (locale IN ('en', 'es')),
  timezone TEXT DEFAULT 'America/Lima' NOT NULL,
  plan plan_type DEFAULT 'free' NOT NULL,
  plan_start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  primary_currency TEXT DEFAULT 'PEN' NOT NULL CHECK (LENGTH(primary_currency) = 3),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- BANKS TABLE
-- Pre-seeded list of supported banks
-- =============================================
CREATE TABLE banks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  brand_color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS (public read)
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view banks"
  ON banks FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify banks"
  ON banks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Index
CREATE INDEX idx_banks_name ON banks(name);

COMMENT ON TABLE banks IS 'Pre-seeded list of supported banks';
COMMENT ON TABLE profiles IS 'User profiles extending auth.users with app-specific fields';
