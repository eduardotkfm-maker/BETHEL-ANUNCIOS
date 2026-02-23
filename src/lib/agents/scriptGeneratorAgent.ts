import type { ScriptGeneratorRequest, ScriptGeneratorResponse } from './types';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Serviço responsável por comunicar com a IA de Geração de Roteiros.
 */
export async function generateScript(request: ScriptGeneratorRequest): Promise<ScriptGeneratorResponse> {
    if (!apiKey) {
        throw new Error("Chave VITE_GEMINI_API_KEY não encontrada no .env!");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const variationInstructions = request.isVariation && request.baseScript
        ? `\n[INSTRUÇÃO CRÍTICA DE VARIAÇÃO]: O usuário pediu uma VARIAÇÃO do seguinte roteiro base:\n"""\n${request.baseScript}\n"""\nCrie uma versão NOVA, com um GANCHO (Hook) completamente diferente e uma abordagem alternativa de Copy, mas mantendo a mesma promessa e produto.\n`
        : '';

    const templateDirectives = request.templateInstruction
        ? `\n[INSTRUÇÃO DE TEMPLATE VENCEDOR]: O usuário escolheu ser guiado pelo modelo "${request.templateName || 'Customizado'}". \n\n⚠️ VOCÊ DEVE IGNORAR SUA ESTRUTURA NORMAL DE 4 PASSOS E SEGUIR OBRIGATORIAMENTE ESTE FORMATO ABAIXO:\n\n"""\nESTRUTURA OBRIGATÓRIA A SEGUIR:\n${request.templateInstruction}\n"""\n`
        : `\nESTRUTURA OBRIGATÓRIA (Forneça o roteiro exatamente nestas seções):

### [HOOK - 0-3s]
(Instrução Visual: Como deve ser a cena/câmera para chamar atenção imediata)
🎙️ Fala (Ator): ...

### [CONEXÃO E PROBLEMA - 3-15s]
(Instrução Visual: B-Roll ou Movimentação)
🎙️ Fala (Ator): ...

### [A SOLUÇÃO E PRODUTO - 15-30s]
(Instrução Visual: Mostrar o produto ou Dashboard)
🎙️ Fala (Ator): ...

### [CALL TO ACTION - 30s+]
(Instrução Visual: Apontando para o botão)
🎙️ Fala (Ator): ...`;

    const prompt = `
Você é um Copywriter de Alta Performance focado em Vídeos Curtos (Reels/TikTok/Shorts).
Sua missão é criar um Roteiro de Anúncio Vendedor, que converta e chame atenção logo de cara.${variationInstructions}

INFORMAÇÕES DO PRODUTO/OFERTA (CONTEXTO DE TREINAMENTO):
- Nome do Produto: ${request.productName}
- Tipo de Produto: ${request.productType || 'Não Especificado'}
- Nicho de Mercado: ${request.niche}
- Preço/Valor Padrão: ${request.price || 'Não Especificado'}
- O que Entrega (Deliverables): ${request.deliverables || 'Não Especificado'}
- Principal Dor do Cliente (Pain): ${request.pain}
- Desejo/Transformação Ofertada: ${request.desire || 'Resolver a dor acima e escalar com facilidade'}
${templateDirectives}

IMPORTANTE: Forneça Apenas o script, nada de cumprimentar ou falar "Ok, aqui está". Quero apenas a copy pronta.
`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        return { script: text.trim() };
    } catch (error) {
        console.error('Falha no Script Generator Agent:', error);
        throw error;
    }
}
