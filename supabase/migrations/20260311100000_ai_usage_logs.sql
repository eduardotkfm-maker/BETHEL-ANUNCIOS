-- Migration: 20260311100000_ai_usage_logs.sql
-- Tabela para registrar custos de uso das IAs (OpenAI + Gemini)

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now() NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    provider text NOT NULL,          -- 'openai' ou 'gemini'
    model text NOT NULL,             -- 'gpt-4o', 'gemini-2.5-flash', etc.
    feature text NOT NULL,           -- 'script_generator', 'ad_analyzer', 'video_clone'
    prompt_tokens integer DEFAULT 0,
    completion_tokens integer DEFAULT 0,
    total_tokens integer DEFAULT 0,
    estimated_cost_usd numeric(10, 6) DEFAULT 0
);

-- RLS: apenas admins podem ler
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_logs_admin_select" ON public.ai_usage_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Inserção aberta (vem das serverless functions via service role ou anon)
CREATE POLICY "ai_usage_logs_insert_all" ON public.ai_usage_logs
    FOR INSERT WITH CHECK (true);

-- Index para consultas de custo por período
CREATE INDEX idx_ai_usage_logs_created ON public.ai_usage_logs (created_at DESC);
CREATE INDEX idx_ai_usage_logs_provider ON public.ai_usage_logs (provider, created_at DESC);
