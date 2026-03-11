/**
 * Local dev server that emulates Vercel serverless functions.
 * Run with: node api-dev-server.mjs
 */
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '.env') });

async function loadHandler(name) {
    // Use tsx to load TypeScript files
    const mod = await import(`./api/${name}.ts`);
    return mod.default;
}

const server = createServer(async (req, res) => {
    // CORS headers for local dev
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://localhost:3001`);
    const route = url.pathname.replace('/api/', '');

    // Collect body
    let body = '';
    for await (const chunk of req) body += chunk;

    // Build mock Vercel request/response
    const mockReq = {
        method: req.method,
        headers: req.headers,
        body: body ? JSON.parse(body) : {},
        query: Object.fromEntries(url.searchParams),
    };

    const mockRes = {
        statusCode: 200,
        _headers: {},
        setHeader(k, v) { this._headers[k] = v; },
        status(code) { this.statusCode = code; return this; },
        json(data) {
            res.writeHead(this.statusCode, {
                ...this._headers,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            });
            res.end(JSON.stringify(data));
        },
    };

    try {
        const handler = await loadHandler(route);
        await handler(mockReq, mockRes);
    } catch (err) {
        console.error(`Error in /api/${route}:`, err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
    }
});

server.listen(3001, () => {
    console.log('API dev server running on http://localhost:3001');
    console.log('Routes: /api/openai-chat, /api/gemini-video');
});
