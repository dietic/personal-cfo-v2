-- =============================================
-- BUDGETS TABLE
-- Monthly category budgets
-- =============================================
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL CHECK (LENGTH(currency) = 3),
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  CHECK (period_end >= period_start),
  UNIQUE(user_id, category_id, period_start)
);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own budgets"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(user_id, category_id);
CREATE INDEX idx_budgets_period ON budgets(user_id, period_start, period_end);

-- =============================================
-- ALERTS TABLE
-- User-configured alerts (budget overruns, unusual spikes)
-- =============================================
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rule_type alert_rule_type NOT NULL,
  params_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_triggered_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own alerts"
  ON alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
  ON alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_active ON alerts(user_id, active);

-- =============================================
-- ALERT_NOTIFICATIONS TABLE
-- Alert events log (for future email/push notifications)
-- =============================================
CREATE TABLE alert_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE alert_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own alert notifications"
  ON alert_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alert notifications"
  ON alert_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_alert_notifications_user_id ON alert_notifications(user_id);
CREATE INDEX idx_alert_notifications_alert_id ON alert_notifications(alert_id);
CREATE INDEX idx_alert_notifications_unread ON alert_notifications(user_id, read_at) WHERE read_at IS NULL;

COMMENT ON TABLE budgets IS 'Monthly category budgets with period tracking';
COMMENT ON TABLE alerts IS 'User alert rules (budget_overrun, unusual_spike)';
COMMENT ON TABLE alert_notifications IS 'Alert event log for future email/push notifications';
