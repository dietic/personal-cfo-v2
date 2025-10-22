-- =============================================
-- CARDS TABLE
-- User's credit/debit cards
-- =============================================
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  due_date INTEGER CHECK (due_date >= 1 AND due_date <= 31),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own cards"
  ON cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards"
  ON cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
  ON cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards"
  ON cards FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_bank_id ON cards(bank_id);

-- =============================================
-- STATEMENTS TABLE
-- Uploaded PDF statements metadata (NO file storage)
-- =============================================
CREATE TABLE statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  status statement_status DEFAULT 'processing' NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  file_type TEXT NOT NULL,
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0 NOT NULL CHECK (retry_count >= 0 AND retry_count <= 2)
);

-- Enable RLS
ALTER TABLE statements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own statements"
  ON statements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own statements"
  ON statements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own statements"
  ON statements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own statements"
  ON statements FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_statements_user_id ON statements(user_id);
CREATE INDEX idx_statements_card_id ON statements(card_id);
CREATE INDEX idx_statements_uploaded_at ON statements(user_id, uploaded_at DESC);
CREATE INDEX idx_statements_status ON statements(status);

COMMENT ON TABLE cards IS 'User credit/debit cards';
COMMENT ON TABLE statements IS 'PDF statement upload metadata (files NOT stored permanently)';
COMMENT ON COLUMN statements.retry_count IS 'Max 2 retries for failed extractions';
