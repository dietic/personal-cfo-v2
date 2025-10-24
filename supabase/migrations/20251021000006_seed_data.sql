-- =============================================
-- SEED BANKS
-- Pre-populate banks table with Peruvian banks
-- =============================================
INSERT INTO banks (name, brand_color) VALUES
  ('BCP', '#002C77'),
  ('Interbank', '#00A650'),
  ('BBVA', '#004481'),
  ('Scotiabank', '#EC1C24'),
  ('Diners Club', '#0066B2'),
  ('Mibanco', '#E20074'),
  ('Caja Piura', '#0052A3'),
  ('Caja Arequipa', '#00843D'),
  ('Caja Huancayo', '#DA291C'),
  ('Banco Pichincha', '#FFD100'),
  ('Other', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- CREATE DEFAULT CATEGORIES ON USER SIGNUP
-- Trigger to create 6 preset categories for new users
-- =============================================
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert 6 preset categories for the new user
  INSERT INTO public.categories (user_id, name, emoji, color, is_preset, status) VALUES
    (NEW.id, 'Food', '🍔', '#f97316', TRUE, 'active'),
    (NEW.id, 'Housing', '🏠', '#64748b', TRUE, 'active'),
    (NEW.id, 'Transportation', '🚗', '#14b8a6', TRUE, 'active'),
    (NEW.id, 'Income', '💵', '#6366f1', TRUE, 'active'),
    (NEW.id, 'Entertainment', '🎮', '#a855f7', TRUE, 'active'),
    (NEW.id, 'Shopping', '🛒', '#3b82f6', TRUE, 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to profiles table (runs after handle_new_user)
CREATE TRIGGER on_profile_created_create_categories
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_categories();

COMMENT ON FUNCTION create_default_categories IS 'Creates 6 preset categories for new users on signup';
