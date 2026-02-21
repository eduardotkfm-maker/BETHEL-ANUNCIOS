import type { AdAnalyzerRequest, AdAnalyzerResponse } from './types';
import { AGENT_CONFIG } from './config';

/**
 * Serviço responsável por comunicar com a IA de Análise de Anúncios.
 */
export async function analyzeAd(request: AdAnalyzerRequest): Promise<AdAnalyzerResponse> {
    // ----------------------------------------------------------------------
    // TODO: Quando você for conectar de verdade à sua API, mude "isMock" para false 
    // e ajuste o fetch() se necessário para o formato esperado pelo seu backend.
    // ----------------------------------------------------------------------
    const isMock = true;

    if (!isMock) {
        try {
            const response = await fetch(AGENT_CONFIG.adAnalyzerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${AGENT_CONFIG.apiKey}` // Se necessário
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error('Erro ao comunicar com o Agente de Análise');
            }

            return await response.json() as AdAnalyzerResponse;
        } catch (error) {
            console.error('Falha no Ad Analyzer Agent:', error);
            throw error;
        }
    }

    // --- LÓGICA MOCKADA TEMPORÁRIA (Para não quebrar a UI enquanto você constrói a API) ---
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                score: 7.5,
                strengths: ['Bom uso de cores contrastantes', 'Call to Action claro e visível', 'Hook nos primeiros 3 segundos'],
                weaknesses: ['Legenda muito pequena em mobile', 'Falta de prova social visível'],
                suggestions: [
                    'Aumentar o tamanho da fonte das legendas para melhorar a leitura em smartphones.',
                    'Adicionar um depoimento ou avaliação de cliente no final do vídeo para aumentar a credibilidade.',
                    'Testar uma variação com um hook mais agressivo focado na dor do cliente.'
                ]
            });
        }, 2000);
    });
}
