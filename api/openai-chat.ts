import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'OPENAI_API_KEY not configured on server.' });
    }

    const { messages, model, temperature, response_format } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Missing or invalid "messages" in request body.' });
    }

    try {
        const body: Record<string, unknown> = {
            model: model || 'gpt-4o',
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

        return res.status(200).json(data);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('OpenAI proxy error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
