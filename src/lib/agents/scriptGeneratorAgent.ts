import type { ScriptGeneratorRequest, ScriptGeneratorResponse } from './types';
import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

// Inicializando o client do OpenAI permitindo o uso no browser (necessário em Vite client-side sem proxy)
const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
});

/**
 * Serviço responsável por comunicar com a IA de Geração de Roteiros (Migrado para OpenAI).
 */
export async function generateScript(request: ScriptGeneratorRequest): Promise<ScriptGeneratorResponse> {
    if (!apiKey) {
        throw new Error("Chave VITE_OPENAI_API_KEY não encontrada no .env!");
    }

    const variationInstructions = request.isVariation && request.baseScript
        ? `\n[INSTRUÇÃO CRÍTICA DE VARIAÇÃO]: O usuário pediu uma VARIAÇÃO do seguinte roteiro base:\n"""\n${request.baseScript}\n"""\nCrie uma versão NOVA, com um GANCHO (Hook) completamente diferente e uma abordagem alternativa de Copy, mas mantendo a mesma promessa e produto.\n`
        : '';

    const templateDirectives = request.templateInstruction
        ? `\n[INSTRUÇÃO DE TEMPLATE ESPECÍFICO]: O usuário escolheu o modelo "${request.templateName || 'Customizado'}". \n\n⚠️ INCLUA A SEGUINTE ABORDAGEM NO ROTEIRO:\n\n"""\n${request.templateInstruction}\n"""\n`
        : ``;

    const assistantId = "asst_SM223DZ06vlDXyQ87nKQvyJs";

    const funnelDirective = request.funnelStage
        ? `\n[ESTÁGIO DO FUNIL]: Este roteiro deve ser focado para ${request.funnelStage.toUpperCase()} de Funil.\n`
        : '';

    const modelDirective = request.creativeModel
        ? `\n[MODELO DE CRIATIVO]: Grave o roteiro pensando no formato: ${request.creativeModel}.\n`
        : '';

    const scriptCountDirective = request.scriptCount && request.scriptCount > 1
        ? `\n[QUANTIDADE]: Gere exatamente ${request.scriptCount} opções de roteiros diferentes e criativos.\n`
        : 'Gere 1 opção de roteiro criativo.';

    const formattingRules = `
[ESTRUTURA INTEGRADA MOVI - OBRIGATÓRIO]:
1. QUEBRA DE PADRÃO (Hook): Foque em impacto emocional ou quebra de expectativa lógica (Ex: "O problema não é X, é Y").
2. NÍVEL DE CONSCIÊNCIA: Use cenas numeradas (Cena 1, Cena 2) para descrever a evolução da dor até a solução.
3. CONTRASTE: Sempre que possível, mostre o erro comum vs. a forma correta proposta pelo produto.
4. OBSERVAÇÕES DE GRAVAÇÃO/EDIÇÃO: Ao final de cada roteiro, inclua uma seção de dicas rápidas sobre tom de voz, energia, tipos de legenda e sugestões de B-roll (imagens de apoio).

[REGRAS DE FORMATAÇÃO DE TEXTO]:
1. QUEBRA DE LINHA: Use parágrafos curtos e frases diretas.
2. markdown: Use markdown padrão (h1 para títulos de roteiro, negrito para ênfase).
3. LINGUAGEM: Português do Brasil, tom conversacional e persuasivo.
4. MULTIPLICIDADE: Caso tenha sido pedido mais de um roteiro, separe-os claramente com títulos (Ex: # Roteiro 1, # Roteiro 2).
`;

    const userMessage = `Por favor, crie ${request.scriptCount || 1} roteiro(s) de anúncio para mim usando todo o seu conhecimento da base (PDFs) e o padrão MOVI. 

${formattingRules}

INFORMAÇÕES FORNECIDAS PELO USUÁRIO (Formulário):
- Nicho de Mercado: ${request.niche}
- Nome do Produto/Serviço: ${request.productName}
- Tipo de Produto: ${request.productType || 'Não Especificado'}
- Preço/Valor Padrão: ${request.price || 'Não Especificado'}
- O que Entrega (Deliverables): ${request.deliverables || 'Não Especificado'}
- Principal Dor do Cliente (Pain) / Ponto de Dor: ${request.pain}
- Desejo/Transformação Ofertada: ${request.desire || 'Resolver a dor e escalar'}

${funnelDirective}
${modelDirective}
${templateDirectives}
${variationInstructions}
${scriptCountDirective}

Forneça APENAS o roteiro estruturado em Markdown, sem cumprimentos ou introduções de "Aqui está".`;

    try {
        // Criando a Thread (Conversa)
        const thread = await openai.beta.threads.create();

        // Adicionando nossa mensagem com o contexto da requisição
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: userMessage
        });

        // Rodando o Assistant e aguardando a finalização (polling)
        const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
            assistant_id: assistantId
        });

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(run.thread_id);
            // Pegamos a última resposta do assistente
            const lastMessage = messages.data.find(m => m.role === 'assistant');

            if (lastMessage && lastMessage.content[0].type === 'text') {
                const text = lastMessage.content[0].text.value;
                return { script: text.trim() };
            }
        } else {
            console.error('Run status:', run.status);
            throw new Error(`Falha no Assistant. Status: ${run.status}`);
        }

        return { script: '' };
    } catch (error) {
        console.error('Falha no Script Generator Agent (OpenAI Assistants):', error);
        throw error;
    }
}
