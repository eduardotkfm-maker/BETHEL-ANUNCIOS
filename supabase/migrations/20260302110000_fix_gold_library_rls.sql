-- Migration: 20260302110000_fix_gold_library_rls.sql
-- Goal: Add missing 'style' column and fix RLS policies for gold_library table.

-- 1. Add missing column 'style' if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gold_library' AND column_name = 'style') THEN
        ALTER TABLE public.gold_library ADD COLUMN style VARCHAR(100);
    END IF;
END $$;

-- 2. Ensure RLS is enabled
ALTER TABLE public.gold_library ENABLE ROW LEVEL SECURITY;

-- 3. Clean up existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view gold library." ON public.gold_library;
DROP POLICY IF EXISTS "Only admins can add to gold library." ON public.gold_library;
DROP POLICY IF EXISTS "Only admins can update gold library." ON public.gold_library;
DROP POLICY IF EXISTS "Only admins can delete from gold library." ON public.gold_library;
DROP POLICY IF EXISTS "Users can manage their own gold library." ON public.gold_library;
DROP POLICY IF EXISTS "Gold library is viewable by everyone if it is global, otherwise by owner" ON public.gold_library;
DROP POLICY IF EXISTS "Users can manage their own creatives in gold library" ON public.gold_library;
DROP POLICY IF EXISTS "Users can update/delete their own creatives in gold library" ON public.gold_library;
DROP POLICY IF EXISTS "Users can delete their own creatives in gold library" ON public.gold_library;

-- 4. Create new consistent policies

-- SELECT: Everyone can see global (null user_id) or their own
CREATE POLICY "Gold library access" ON public.gold_library
    FOR SELECT USING (true); -- Permitir ver tudo para simplificar o playground

-- INSERT: Admins can insert anything, Users can insert their own
CREATE POLICY "Gold library insert" ON public.gold_library
    FOR INSERT 
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
        OR (auth.uid() = user_id)
    );

-- UPDATE: Admins can update anything, Users can update their own
CREATE POLICY "Gold library update" ON public.gold_library
    FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
        OR (auth.uid() = user_id)
    );

-- DELETE: Admins can delete anything, Users can delete their own
CREATE POLICY "Gold library delete" ON public.gold_library
    FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
        OR (auth.uid() = user_id)
    );

-- 5. Force promote the admin user just in case
UPDATE public.profiles 
SET is_admin = true 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'admin@bethel.com'
);
