-- Migration: 000003_auth_profiles.sql
-- Goal: Create a public profiles table linked to Supabase Auth and a storage bucket for avatars.

-- 1. Create the `profiles` table to store extra user data
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(1024),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Policies for `profiles`
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Set up a trigger to automatically create a profile entry when a new user signs up via auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Usuário'), 
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Bethel'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function on INSERT in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. Set up Storage Bucket for Avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Avatars
CREATE POLICY "Avatars are publicly accessible." 
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar." 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can update their avatar." 
ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can delete their avatar." 
ON storage.objects FOR DELETE USING (bucket_id = 'avatars');
