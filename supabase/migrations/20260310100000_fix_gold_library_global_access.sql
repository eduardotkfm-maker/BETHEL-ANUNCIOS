-- Migration: 20260310100000_fix_gold_library_global_access.sql
-- Goal: Ensure ALL gold_library videos are visible to ALL users.
-- Problem: Previous migration (000005) set user_id = agency_id, making videos
-- invisible to new users because RLS filters on user_id.

-- 1. Make ALL gold_library entries global (visible to everyone)
UPDATE public.gold_library SET user_id = NULL WHERE user_id IS NOT NULL;

-- 2. Drop and recreate RLS policies to ensure clean state
DROP POLICY IF EXISTS "Gold library access" ON public.gold_library;
DROP POLICY IF EXISTS "Gold library insert" ON public.gold_library;
DROP POLICY IF EXISTS "Gold library update" ON public.gold_library;
DROP POLICY IF EXISTS "Gold library delete" ON public.gold_library;
DROP POLICY IF EXISTS "Anyone can view gold library." ON public.gold_library;
DROP POLICY IF EXISTS "Only admins can add to gold library." ON public.gold_library;
DROP POLICY IF EXISTS "Only admins can update gold library." ON public.gold_library;
DROP POLICY IF EXISTS "Only admins can delete from gold library." ON public.gold_library;
DROP POLICY IF EXISTS "Gold library is viewable by everyone if it is global, otherwise by owner" ON public.gold_library;
DROP POLICY IF EXISTS "Users can manage their own creatives in gold library" ON public.gold_library;
DROP POLICY IF EXISTS "Users can update/delete their own creatives in gold library" ON public.gold_library;
DROP POLICY IF EXISTS "Users can delete their own creatives in gold library" ON public.gold_library;

-- 3. Ensure RLS is enabled
ALTER TABLE public.gold_library ENABLE ROW LEVEL SECURITY;

-- 4. SELECT: Everyone can see everything
CREATE POLICY "gold_library_select_all" ON public.gold_library
    FOR SELECT USING (true);

-- 5. INSERT: Only admins
CREATE POLICY "gold_library_insert_admin" ON public.gold_library
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- 6. UPDATE: Only admins
CREATE POLICY "gold_library_update_admin" ON public.gold_library
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- 7. DELETE: Only admins
CREATE POLICY "gold_library_delete_admin" ON public.gold_library
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );
