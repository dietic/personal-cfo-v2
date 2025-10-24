-- =============================================
-- CHAT_USAGE TABLE
-- Tracks AI chat queries for plan enforcement and cost monitoring
-- =============================================
CREATE TABLE chat_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  query TEXT NOT NULL CHECK (LENGTH(query) > 0 AND LENGTH(query) <= 500),
  response TEXT NOT NULL CHECK (LENGTH(response) > 0),
  tokens_used INTEGER NOT NULL CHECK (tokens_used > 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE chat_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own chat usage"
  ON chat_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat usage"
  ON chat_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_chat_usage_user_id ON chat_usage(user_id);
CREATE INDEX idx_chat_usage_user_created ON chat_usage(user_id, created_at DESC);

COMMENT ON TABLE chat_usage IS 'Chat query usage tracking for plan limits and cost monitoring';

-- =============================================
-- HELPER FUNCTION: Get monthly chat usage count
-- =============================================
CREATE OR REPLACE FUNCTION get_monthly_chat_usage(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  usage_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO usage_count
  FROM chat_usage
  WHERE user_id = p_user_id
    AND created_at >= DATE_TRUNC('month', NOW())
    AND created_at < DATE_TRUNC('month', NOW()) + INTERVAL '1 month';

  RETURN COALESCE(usage_count, 0);
END;
$$;

COMMENT ON FUNCTION get_monthly_chat_usage(UUID) IS 'Returns count of chat queries in current calendar month for a user';
