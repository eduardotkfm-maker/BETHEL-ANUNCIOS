import type { ScriptGeneratorRequest, ScriptGeneratorResponse } from './types';
import { AGENT_CONFIG } from './config';

/**
 * Serviço responsável por comunicar com a IA de Geração de Roteiros.
 */
export async function generateScript(request: ScriptGeneratorRequest): Promise<ScriptGeneratorResponse> {
    // ----------------------------------------------------------------------
    // TODO: Quando você for conectar de verdade à sua API, mude "isMock" para false.
    // ----------------------------------------------------------------------
    const isMock = true;

    if (!isMock) {
        try {
            const response = await fetch(AGENT_CONFIG.scriptGeneratorUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${AGENT_CONFIG.apiKey}` // Se necessário
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error('Erro ao comunicar com o Agente Gerador de Roteiros');
            }

            return await response.json() as ScriptGeneratorResponse;
        } catch (error) {
            console.error('Falha no Script Generator Agent:', error);
            throw error;
        }
    }

    // --- LÓGICA MOCKADA TEMPORÁRIA ---
    return new Promise((resolve) => {
        setTimeout(() => {
            const script = `
# Roteiro para: ${request.productName}
## Nicho: ${request.niche}

### [HOOK - 0-3s]
(Visual impactante ou pergunta retórica)
"Você está cansado de ${request.pain}? Eu sei exatamente como você se sente."

### [CORPO - 3-15s]
"Muitas pessoas no nicho de ${request.niche} sofrem com isso todos os dias. Mas a verdade é que você não precisa continuar passando por isso.
Imagine poder finalmente ${request.desire} sem esforço desnecessário."

### [SOLUÇÃO/PRODUTO - 15-30s]
"É por isso que criamos o ${request.productName}. A solução definitiva que vai te ajudar a alcançar ${request.desire} em tempo recorde."

### [CTA - 30s+]
"Clique no botão abaixo e descubra como o ${request.productName} pode transformar sua realidade hoje mesmo!"
            `;
            resolve({ script: script.trim() });
        }, 1500);
    });
}
