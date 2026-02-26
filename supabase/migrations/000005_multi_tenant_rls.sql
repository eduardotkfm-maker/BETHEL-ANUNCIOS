-- Migration: Standardize User Identification and Enable RLS
-- Goal: Ensure all user-specific tables have a user_id column and RLS is active.

-- 1. ADICIONAR COLUNA user_id CASO NÃO EXISTA E VINCULAR AO AUTH.USERS

-- Table: products
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'user_id') THEN
        ALTER TABLE public.products ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Table: creative_production_tasks
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'creative_production_tasks' AND column_name = 'user_id') THEN
        ALTER TABLE public.creative_production_tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Table: gold_library
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gold_library' AND column_name = 'user_id') THEN
        ALTER TABLE public.gold_library ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. MIGRAR DADOS EXISTENTES (Opcional, mas útil se já houver dados vinculados a agency_id/client_id)
UPDATE public.products SET user_id = agency_id WHERE user_id IS NULL AND agency_id IS NOT NULL;
UPDATE public.creative_production_tasks SET user_id = client_id WHERE user_id IS NULL AND client_id IS NOT NULL;
UPDATE public.gold_library SET user_id = agency_id WHERE user_id IS NULL AND agency_id IS NOT NULL;

-- 3. HABILITAR RLS EM TODAS AS TABELAS

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_production_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_library ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS DE RLS (Acesso isolado por Usuário)

-- Products
DROP POLICY IF EXISTS "Users can manage their own products" ON public.products;
CREATE POLICY "Users can manage their own products" ON public.products
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Creative Production Tasks
DROP POLICY IF EXISTS "Users can manage their own tasks" ON public.creative_production_tasks;
CREATE POLICY "Users can manage their own tasks" ON public.creative_production_tasks
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Gold Library: Global view for null user_id (examples), private for owned items
DROP POLICY IF EXISTS "Users can manage their own gold library" ON public.gold_library;
CREATE POLICY "Gold library is viewable by everyone if it is global, otherwise by owner" ON public.gold_library
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own creatives in gold library" ON public.gold_library
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update/delete their own creatives in gold library" ON public.gold_library
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own creatives in gold library" ON public.gold_library
    FOR DELETE USING (auth.uid() = user_id);

-- Table: niches
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'niches' AND column_name = 'user_id') THEN
        ALTER TABLE public.niches ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE public.niches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own niches" ON public.niches;
CREATE POLICY "Niches are viewable by everyone if global, otherwise by owner" ON public.niches
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own niches" ON public.niches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update/delete their own niches" ON public.niches
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own niches" ON public.niches
    FOR DELETE USING (auth.uid() = user_id);
