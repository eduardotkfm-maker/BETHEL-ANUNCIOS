import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Gemini 2.5 Flash pricing per 1M tokens
const GEMINI_PRICING = { input: 0.15, output: 0.60 };

function getSupabase() {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    if (!url || !key) return null;
    return createClient(url, key);
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '50mb',
        },
    },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server.' });
    }

    const { videoBase64, mimeType, prompt, user_id } = req.body;

    if (!videoBase64 || !prompt) {
        return res.status(400).json({ error: 'Missing videoBase64 or prompt.' });
    }

    try {
        // --- STEP 1: Convert base64 to binary and upload via resumable upload ---
        const binaryString = Buffer.from(videoBase64, 'base64');
        const videoMime = mimeType || 'video/mp4';

        const uploadInitRes = await fetch(
            `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${geminiKey}`,
            {
                method: 'POST',
                headers: {
                    'X-Goog-Upload-Protocol': 'resumable',
                    'X-Goog-Upload-Command': 'start',
                    'X-Goog-Upload-Header-Content-Length': String(binaryString.length),
                    'X-Goog-Upload-Header-Content-Type': videoMime,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file: { displayName: 'video_analise.mp4' }
                })
            }
        );

        if (!uploadInitRes.ok) {
            const errText = await uploadInitRes.text();
            return res.status(uploadInitRes.status).json({ error: `Upload init failed: ${errText}` });
        }

        const uploadUrl = uploadInitRes.headers.get('X-Goog-Upload-URL');
        if (!uploadUrl) {
            return res.status(500).json({ error: 'Upload URL not returned by Google.' });
        }

        // --- STEP 2: Send video bytes ---
        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Length': String(binaryString.length),
                'X-Goog-Upload-Offset': '0',
                'X-Goog-Upload-Command': 'upload, finalize',
            },
            body: binaryString,
        });

        if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            return res.status(uploadRes.status).json({ error: `Video upload failed: ${errText}` });
        }

        const uploadResult = await uploadRes.json();
        const fileUri = uploadResult.file?.uri;
        const fileName = uploadResult.file?.name;

        if (!fileUri) {
            return res.status(500).json({ error: 'File URI not returned after upload.' });
        }

        // --- STEP 3: Poll until video is processed ---
        let fileState = uploadResult.file?.state || 'PROCESSING';
        let attempts = 0;
        while (fileState === 'PROCESSING' && attempts < 30) {
            await new Promise(r => setTimeout(r, 4000));
            attempts++;

            const statusRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${geminiKey}`
            );
            const statusData = await statusRes.json();
            fileState = statusData.state;

            if (fileState === 'FAILED') {
                return res.status(500).json({ error: 'Gemini failed to process the video.' });
            }
        }

        if (fileState === 'PROCESSING') {
            return res.status(504).json({ error: 'Video processing timed out.' });
        }

        // --- STEP 4: Generate content with Gemini ---
        const generateRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            { fileData: { mimeType: videoMime, fileUri: fileUri } }
                        ]
                    }]
                })
            }
        );

        if (!generateRes.ok) {
            const errText = await generateRes.text();
            return res.status(generateRes.status).json({ error: `Gemini generation failed: ${errText}` });
        }

        const generateData = await generateRes.json();
        const analysis = generateData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const usageMetadata = generateData.usageMetadata;

        // Log usage to Supabase (fire and forget)
        try {
            const promptTokens = usageMetadata?.promptTokenCount || 0;
            const completionTokens = usageMetadata?.candidatesTokenCount || 0;
            const totalTokens = usageMetadata?.totalTokenCount || promptTokens + completionTokens;
            const costUsd = (promptTokens * GEMINI_PRICING.input + completionTokens * GEMINI_PRICING.output) / 1_000_000;

            const supabase = getSupabase();
            if (supabase) {
                await supabase.from('ai_usage_logs').insert({
                    user_id: user_id || null,
                    provider: 'gemini',
                    model: 'gemini-2.5-flash',
                    feature: 'video_clone',
                    prompt_tokens: promptTokens,
                    completion_tokens: completionTokens,
                    total_tokens: totalTokens,
                    estimated_cost_usd: costUsd,
                });
            }
        } catch (logErr) {
            console.warn('Failed to log Gemini usage:', logErr);
        }

        return res.status(200).json({ analysis });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('Gemini proxy error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
