-- Migration: 000006_add_admin_role.sql
-- Goal: Add is_admin column to profiles and set the first admin.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Auto-set admin for specific email if it exists
UPDATE public.profiles 
SET is_admin = true 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'admin@bethel.com'
);

-- Ensure future signups with this email get admin automatically (optional but helpful)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, is_admin)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuário'), 
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Bethel'),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE WHEN NEW.email = 'admin@bethel.com' THEN true ELSE false END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
