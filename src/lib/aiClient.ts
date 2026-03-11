/* eslint-disable @typescript-eslint/no-explicit-any */

const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

async function callOpenAI(params: {
    messages: Array<{ role: string; content: string }>;
    model?: string;
    temperature?: number;
    response_format?: { type: string };
}): Promise<string> {
    const res = await fetch('/api/openai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `OpenAI proxy error: ${res.status}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '{}';
}


export const analyzePoorPerformingAds = async (
    csvData: any[],
    goldReferences: any[]
): Promise<{ title: string; script: string }> => {
    const sampleData = csvData.slice(0, 5);

    const prompt = `
Você é um Copywriter de Alta Performance e Estrategista de Dados. Seu objetivo é salvar um funil que está performando mal.
Abaixo estão DADOS REAIS da conta de anúncios:
${JSON.stringify(sampleData, null, 2)}

E aqui estão as Referências da 'Biblioteca de Ouro' (o que já funciona e deve servir de inspiração):
${JSON.stringify(goldReferences, null, 2)}

SUA TAREFA:
1. Analise os piores desempenhos e identifique o "ponto de ruptura" (CTR baixo? CPM alto?).
2. Crie um Roteiro de Vídeo Premium (Reels/TikTok) que ignore o que não funcionou e use a estrutura narrativa das referências de ouro.
3. Foque em um Gancho Único e uma Quebra de Objeção que ninguém no mercado está usando ainda.

REGRAS:
- Formato JSON estrito.
- Title: Nome estratégico para a esteira.
- Script: Roteiro completo com indicações visuais e de fala.
`;

    try {
        const text = await callOpenAI({
            model: "gpt-4o",
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });
        return JSON.parse(text);
    } catch (e) {
        console.error("Erro na geração da OpenAI:", e);
        throw new Error("Falha ao analisar com IA. Verifique as chaves e cota da conta.");
    }
};

// ─── SISTEMA HÍBRIDO: GEMINI (Visão + Áudio) → GPT (Copywriting) ─────────────

export const modelCreativeFromVideo = async (
    videoBase64: string,
    mimeType: string,
    productData: any
): Promise<{ title: string; script: string }> => {
    if (!geminiKey) {
        throw new Error("Chave VITE_GEMINI_API_KEY não encontrada no .env!");
    }

    // ── FASE 1: Gemini analisa o vídeo (visão + áudio nativo) ──────────────
    const geminiPrompt = `
Você é um Analista de Criativos Publicitários. Analise este vídeo de anúncio e forneça:

1. **TRANSCRIÇÃO COMPLETA**: Transcreva TUDO que é falado no vídeo, palavra por palavra.
2. **TEXTOS NA TELA**: Liste todos os textos/legendas que aparecem no vídeo.
3. **ESTRUTURA NARRATIVA**: Descreva o fluxo do vídeo (Hook → Desenvolvimento → CTA).
4. **ELEMENTOS VISUAIS**: Cenário, enquadramento, transições, cores dominantes.
5. **TOM E ENERGIA**: Tom de voz (amigável? urgente? profissional?), trilha sonora, ritmo dos cortes.
6. **DURAÇÃO ESTIMADA** de cada seção (Hook, Corpo, CTA).

Responda em português do Brasil de forma detalhada e organizada.
`;

    let geminiAnalysis = '';
    const fileSizeMB = (videoBase64.length * 0.75 / 1024 / 1024).toFixed(1);
    console.log(`📤 Enviando vídeo para Gemini File API (${fileSizeMB}MB, ${mimeType})...`);

    try {
        // ── PASSO 1: Upload do vídeo para a File API do Google ──────────────
        const binaryString = atob(videoBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const videoBlob = new Blob([bytes], { type: mimeType });

        // Iniciar upload resumable
        const uploadInitRes = await fetch(
            `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${geminiKey}`,
            {
                method: 'POST',
                headers: {
                    'X-Goog-Upload-Protocol': 'resumable',
                    'X-Goog-Upload-Command': 'start',
                    'X-Goog-Upload-Header-Content-Length': String(videoBlob.size),
                    'X-Goog-Upload-Header-Content-Type': mimeType,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file: { displayName: 'video_analise.mp4' }
                })
            }
        );

        if (!uploadInitRes.ok) {
            const errText = await uploadInitRes.text();
            throw new Error(`Falha ao iniciar upload: ${uploadInitRes.status} - ${errText}`);
        }

        const uploadUrl = uploadInitRes.headers.get('X-Goog-Upload-URL');
        if (!uploadUrl) throw new Error('URL de upload não retornada pelo Google.');

        console.log('📤 Upload URL obtida, enviando bytes do vídeo...');

        // Enviar os bytes reais do vídeo
        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Length': String(videoBlob.size),
                'X-Goog-Upload-Offset': '0',
                'X-Goog-Upload-Command': 'upload, finalize',
            },
            body: videoBlob
        });

        if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            throw new Error(`Falha no upload do vídeo: ${uploadRes.status} - ${errText}`);
        }

        const uploadResult = await uploadRes.json();
        const fileUri = uploadResult.file?.uri;
        const fileName = uploadResult.file?.name;

        if (!fileUri) throw new Error('URI do arquivo não retornada após upload.');
        console.log(`✅ Vídeo enviado com sucesso: ${fileName}`);

        // ── PASSO 2: Aguardar processamento do vídeo ───────────────────────
        let fileState = uploadResult.file?.state || 'PROCESSING';
        while (fileState === 'PROCESSING') {
            console.log('⏳ Aguardando Gemini processar o vídeo...');
            await new Promise(r => setTimeout(r, 4000));

            const statusRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${geminiKey}`
            );
            const statusData = await statusRes.json();
            fileState = statusData.state;

            if (fileState === 'FAILED') {
                throw new Error('O Gemini falhou ao processar o vídeo. Tente um formato diferente.');
            }
        }

        console.log('🧠 Vídeo processado, iniciando análise com Gemini 2.5 Flash...');

        // ── PASSO 3: Chamar generateContent (Versão Ultra Estável)
        const generateRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: geminiPrompt },
                            { fileData: { mimeType: mimeType, fileUri: fileUri } }
                        ]
                    }]
                })
            }
        );

        if (!generateRes.ok) {
            const errText = await generateRes.text();
            throw new Error(`Erro na geração do Gemini: ${generateRes.status} - ${errText}`);
        }

        const generateData = await generateRes.json();
        geminiAnalysis = generateData.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!geminiAnalysis) {
            throw new Error('O Gemini não retornou análise. Tente novamente.');
        }

        console.log('✅ Gemini analisou o vídeo com sucesso!');
    } catch (geminiError: any) {
        console.error('❌ Erro detalhado do Gemini:', geminiError);
        throw new Error(geminiError?.message || 'Falha ao analisar o vídeo com Gemini.');
    }

    // ── FASE 2: GPT-4o escreve o roteiro com base na análise do Gemini ─────
    const gptPrompt = `
Você é um Engenheiro de Criativos Sênior e Copywriter de Elite.

Um agente de IA especializado em vídeo acabou de "assistir" um anúncio de alta performance do concorrente e gerou a seguinte análise detalhada:

--- INÍCIO DA ANÁLISE DO VÍDEO ---
${geminiAnalysis}
--- FIM DA ANÁLISE DO VÍDEO ---

DADOS DO NOSSO PRODUTO:
NOME: ${productData?.name || 'Não informado'}
NICHO: ${productData?.niche || 'Geral'}
DOR RESOLVIDA: ${productData?.pain_solved || 'Melhorar cenário atual'}
ENTREGÁVEIS: ${productData?.deliverables || 'Sistema'}

SUA TAREFA:
1. Use a transcrição e a estrutura narrativa do vídeo como "MOLDE".
2. REESCREVA um roteiro 100% novo para vender O NOSSO PRODUTO.
3. Mantenha o ritmo, o tom e a energia que fizeram o vídeo original reter a atenção.
4. MELHORE o gancho. Se o original era bom, o seu tem que ser IRRESISTÍVEL.

🛑 REGRAS DE OURO:
- NÃO copie as falas. Modele apenas a ESTRUTURA e o RITMO.
- Use jargões atuais e vocabulário nativo (Reels/TikTok).
- Inclua instruções visuais e de gravação.
- Formato: JSON estrito com as chaves "title" (string) e "script" (string).
- O campo "script" deve ser um texto LIMPO e formatado em Markdown, sem envolver as cenas em chaves ou aspas.
- Use EXATAMENTE este padrão para que o sistema reconheça os estilos visuais:
  ### [NOME DA SEÇÃO - TIMING]
  (Visual: Descrição detalhada do que acontece na imagem)
  🎙️ Fala: "Texto da fala aqui..."
- NÃO use JSON dentro do campo "script".
`;

    try {
        const text = await callOpenAI({
            model: "gpt-4o",
            messages: [{ role: "user", content: gptPrompt }],
            response_format: { type: "json_object" },
            temperature: 0.8,
        });
        return JSON.parse(text);
    } catch (gptError) {
        console.error('❌ Erro no GPT:', gptError);
        throw new Error('Falha ao gerar o roteiro com GPT. Verifique sua cota.');
    }
};
