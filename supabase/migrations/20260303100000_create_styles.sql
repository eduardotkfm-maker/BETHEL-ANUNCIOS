-- Migration: Create styles table and seed initial data
-- Goal: Allow dynamic styles (folders) for users in Gold Library

CREATE TABLE IF NOT EXISTS public.styles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(name, user_id)
);

-- Habilitar RLS
ALTER TABLE public.styles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Styles are viewable by everyone if global, otherwise by owner" ON public.styles
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own styles" ON public.styles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own styles" ON public.styles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own styles" ON public.styles
    FOR DELETE USING (auth.uid() = user_id);

-- Semear dados iniciais
INSERT INTO public.styles (name)
VALUES 
    ('TELA DIVIDIDA'),
    ('SENTADO MOSTRANDO TELA'),
    ('SELFIE'),
    ('NOVELINHA'),
    ('NOTÍCIA'),
    ('NO CARRO SOZINHO'),
    ('NO CARRO EM DUAS PESSOAS'),
    ('MOSTRANDO O PRODUTO'),
    ('FALSO PODCAST'),
    ('CAMINHANDO'),
    ('CÂMERA TRASEIRA 0.5'),
    ('CAIXA DE PERGUNTAS'),
    ('ANTES x DEPOIS - iPad'),
    ('2 PESSOAS CONVERSANDO')
ON CONFLICT DO NOTHING;
