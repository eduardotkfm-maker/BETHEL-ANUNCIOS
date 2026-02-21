import type { AdLibraryRequest, AdLibraryResponse } from './types';
import { AGENT_CONFIG } from './config';

/**
 * Serviço responsável por comunicar com a IA/Extrator de Biblioteca de Anúncios.
 */
export async function searchAds(request: AdLibraryRequest): Promise<AdLibraryResponse> {
    // ----------------------------------------------------------------------
    // TODO: Quando você for conectar de verdade à sua API, mude "isMock" para false.
    // ----------------------------------------------------------------------
    const isMock = true;

    if (!isMock) {
        try {
            const response = await fetch(AGENT_CONFIG.adLibraryUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${AGENT_CONFIG.apiKey}` // Se necessário
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error('Erro ao comunicar com o Agente da Biblioteca de Anúncios');
            }

            return await response.json() as AdLibraryResponse;
        } catch (error) {
            console.error('Falha no Ad Library Agent:', error);
            throw error;
        }
    }

    // --- LÓGICA MOCKADA TEMPORÁRIA ---
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                results: [
                    {
                        title: `Anúncio Competitivo ${request.searchTerm} #1 [${request.country}]`,
                        niche: request.searchTerm || 'Geral',
                        thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80',
                        ctr: '~2.5%',
                        roas: 'Est. 3x',
                        views: request.status === 'active' ? 'Ativo' : 'Pausado',
                    },
                    {
                        title: `Anúncio Viral ${request.searchTerm} #2 [${request.country}]`,
                        niche: request.searchTerm || 'Geral',
                        thumbnailUrl: 'https://images.unsplash.com/photo-1555421689-492a8048ae20?auto=format&fit=crop&q=80',
                        ctr: '~3.1%',
                        roas: 'Est. 4x',
                        views: request.status === 'active' ? 'Ativo' : 'Pausado',
                    },
                    {
                        title: `Oferta Black Friday ${request.searchTerm} [${request.country}]`,
                        niche: request.searchTerm || 'Geral',
                        thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80',
                        ctr: '~4.0%',
                        roas: 'Est. 5x',
                        views: 'Pausado',
                    },
                ]
            });
        }, 1500);
    });
}
