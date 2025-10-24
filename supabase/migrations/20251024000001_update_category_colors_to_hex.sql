-- =============================================
-- UPDATE CATEGORY COLORS FROM NAMES TO HEX
-- Convert Tailwind color names to hex values
-- =============================================

UPDATE public.categories
SET color = CASE color
  WHEN 'orange' THEN '#f97316'
  WHEN 'slate' THEN '#64748b'
  WHEN 'teal' THEN '#14b8a6'
  WHEN 'indigo' THEN '#6366f1'
  WHEN 'purple' THEN '#a855f7'
  WHEN 'blue' THEN '#3b82f6'
  ELSE color  -- Keep as-is if already hex or other value
END
WHERE color IN ('orange', 'slate', 'teal', 'indigo', 'purple', 'blue');
