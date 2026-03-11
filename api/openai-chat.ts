import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Preço por 1M tokens (GPT-4o) — atualizar conforme pricing da OpenAI
const PRICING: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
};

function getSupabase() {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    if (!url || !key) return null;
    return createClient(url, key);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'OPENAI_API_KEY not configured on server.' });
    }

    const { messages, model, temperature, response_format, feature, user_id } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Missing or invalid "messages" in request body.' });
    }

    const usedModel = model || 'gpt-4o';

    try {
        const body: Record<string, unknown> = {
            model: usedModel,
            messages,
            temperature: temperature ?? 0.7,
        };

        if (response_format) {
            body.response_format = response_format;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        // Log usage to Supabase (fire and forget)
        try {
            const usage = data.usage;
            if (usage) {
                const pricing = PRICING[usedModel] || PRICING['gpt-4o'];
                const costUsd = (usage.prompt_tokens * pricing.input + usage.completion_tokens * pricing.output) / 1_000_000;

                const supabase = getSupabase();
                if (supabase) {
                    await supabase.from('ai_usage_logs').insert({
                        user_id: user_id || null,
                        provider: 'openai',
                        model: usedModel,
                        feature: feature || 'unknown',
                        prompt_tokens: usage.prompt_tokens || 0,
                        completion_tokens: usage.completion_tokens || 0,
                        total_tokens: usage.total_tokens || 0,
                        estimated_cost_usd: costUsd,
                    });
                }
            }
        } catch (logErr) {
            console.warn('Failed to log AI usage:', logErr);
        }

        return res.status(200).json(data);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('OpenAI proxy error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
