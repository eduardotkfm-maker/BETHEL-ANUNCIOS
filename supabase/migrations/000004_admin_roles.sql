-- Migration: 000004_admin_roles.sql
-- Goal: Add is_admin flag to profiles table for role-based access control.

-- 1. Add is_admin column to profiles table (default false for all users)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- 2. Promote the first admin manually by email (update to match your email)
-- Run this after knowing which user ID to promote:
-- UPDATE public.profiles SET is_admin = true WHERE id = '<your-user-id-uuid>';

-- 3. Securely restrict who can modify is_admin - only service_role can do it.
-- Regular users cannot update their own is_admin flag through the API.
CREATE POLICY "Only admins can update admin status."
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
    -- Prevent regular users from setting themselves as admin
    -- The is_admin field cannot be changed by the user themselves
    -- (this check blocks self-promotion)
    (is_admin = (SELECT is_admin FROM public.profiles WHERE id = auth.uid()))
);

-- 4. Update the gold_library table to restrict insert/delete to admins only
-- Allow all users to SELECT from gold_library
-- Only admins can INSERT, UPDATE, DELETE
ALTER TABLE public.gold_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gold library."
ON public.gold_library FOR SELECT USING (true);

CREATE POLICY "Only admins can add to gold library."
ON public.gold_library FOR INSERT 
WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Only admins can update gold library."
ON public.gold_library FOR UPDATE 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Only admins can delete from gold library."
ON public.gold_library FOR DELETE 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 5. Restrict gold_library_videos storage bucket to admins only for write operations
-- Read = everyone, Write = admins only
CREATE POLICY "Anyone can view gold library videos."
ON storage.objects FOR SELECT USING (bucket_id = 'gold_library_videos');

CREATE POLICY "Only admins can upload to gold library videos."
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'gold_library_videos' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

CREATE POLICY "Only admins can delete from gold library videos."
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'gold_library_videos' AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
