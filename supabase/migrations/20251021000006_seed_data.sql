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
    (NEW.id, 'Food', '🍔', 'orange', TRUE, 'active'),
    (NEW.id, 'Housing', '🏠', 'slate', TRUE, 'active'),
    (NEW.id, 'Transportation', '🚗', 'teal', TRUE, 'active'),
    (NEW.id, 'Income', '💵', 'indigo', TRUE, 'active'),
    (NEW.id, 'Entertainment', '🎮', 'purple', TRUE, 'active'),
    (NEW.id, 'Shopping', '🛒', 'blue', TRUE, 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to profiles table (runs after handle_new_user)
CREATE TRIGGER on_profile_created_create_categories
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_categories();

COMMENT ON FUNCTION create_default_categories IS 'Creates 6 preset categories for new users on signup';
