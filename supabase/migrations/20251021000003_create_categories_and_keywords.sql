-- =============================================
-- CATEGORIES TABLE
-- User-defined transaction categories
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT,
  color TEXT,
  status category_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_preset BOOLEAN DEFAULT FALSE NOT NULL,
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id AND is_preset = FALSE);

-- Indexes
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_user_status ON categories(user_id, status);

-- =============================================
-- CATEGORY_KEYWORDS TABLE
-- Keywords for auto-categorization
-- =============================================
CREATE TABLE category_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, category_id, keyword)
);

-- Enable RLS
ALTER TABLE category_keywords ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own keywords"
  ON category_keywords FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own keywords"
  ON category_keywords FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own keywords"
  ON category_keywords FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own keywords"
  ON category_keywords FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_category_keywords_user_id ON category_keywords(user_id);
CREATE INDEX idx_category_keywords_category_id ON category_keywords(category_id);
CREATE INDEX idx_category_keywords_keyword ON category_keywords(user_id, LOWER(keyword));

-- =============================================
-- EXCLUDED_KEYWORDS TABLE
-- Keywords that prevent auto-categorization
-- =============================================
CREATE TABLE excluded_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, keyword)
);

-- Enable RLS
ALTER TABLE excluded_keywords ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own excluded keywords"
  ON excluded_keywords FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own excluded keywords"
  ON excluded_keywords FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own excluded keywords"
  ON excluded_keywords FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_excluded_keywords_user_id ON excluded_keywords(user_id);
CREATE INDEX idx_excluded_keywords_keyword ON excluded_keywords(user_id, LOWER(keyword));

COMMENT ON TABLE categories IS 'User transaction categories with preset system categories';
COMMENT ON COLUMN categories.is_preset IS 'System categories cannot be deleted (6 defaults per user)';
COMMENT ON TABLE category_keywords IS 'Keywords for first-match categorization';
COMMENT ON TABLE excluded_keywords IS 'Keywords that mark transactions as Uncategorized';
