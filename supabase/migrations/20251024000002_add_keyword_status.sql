-- =============================================
-- ADD STATUS COLUMN TO CATEGORY_KEYWORDS
-- Track keyword categorization status (categorizing, active, failed)
-- =============================================

-- Create status ENUM type
CREATE TYPE keyword_status AS ENUM ('categorizing', 'active', 'failed');

-- Add status column with default 'active'
ALTER TABLE category_keywords
ADD COLUMN status keyword_status DEFAULT 'active' NOT NULL;

-- Add categorized_count column to track number of transactions categorized
ALTER TABLE category_keywords
ADD COLUMN categorized_count INTEGER DEFAULT 0 NOT NULL;

-- Add failure_reason for failed keywords
ALTER TABLE category_keywords
ADD COLUMN failure_reason TEXT;

-- Add index for polling queries (fetch keywords with status='categorizing')
CREATE INDEX idx_category_keywords_status ON category_keywords(user_id, status);

COMMENT ON COLUMN category_keywords.status IS 'Categorization status: categorizing (job running), active (ready), failed (error)';
COMMENT ON COLUMN category_keywords.categorized_count IS 'Number of transactions auto-categorized by this keyword';
COMMENT ON COLUMN category_keywords.failure_reason IS 'Error message if status is failed';
