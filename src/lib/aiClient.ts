/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export const analyzePoorPerformingAds = async (
    csvData: any[],
    goldReferences: any[]
): Promise<{ title: string; script: string }> => {
    if (!apiKey) {
        throw new Error("Chave VITE_GEMINI_API_KEY não encontrada no .env!");
    }

    // Initialize the Generative Model 
    // We'll use gemini-2.5-flash as it's the fastest and widely available text model.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Pega os piores criativos baseados em um critério simples (ex: menor CTR, ou menor ROAS)
    // Para fins do MVP, vamos mandar os dados assim, talvez limitando o tamanho para economizar tokens
    const sampleData = csvData.slice(0, 5);

    const prompt = `
Você é um Copywriter de Alta Performance obcecado por Escala e Performance de Anúncios.
Abaixo estão DADOS REAIS da conta de anúncios do cliente extraídos de um CSV (os piores e melhores desempenhos):
${JSON.stringify(sampleData, null, 2)}

E aqui estão as Referências da nossa 'Biblioteca de Ouro' (adicionadas pela agência como as melhores):
${JSON.stringify(goldReferences, null, 2)}

SUA TAREFA:
Baseado em dados que você viu do banco de dados ruim acima, e buscando inspiração na Biblioteca de Ouro:
Crie UM roteiro matador para gravar em Vídeo (Reels/TikTok) que reverta a situação, abordando uma quebra de objeção diferente ou gancho mais forte.

REGRAS:
1. Forneça o resultado estritamente no seguinte formato JSON (e mais nada de texto solto):
{
  "title": "NOME CURTO DO ROTEIRO PRA ESTEIRA",
  "script": "ROTEIRO COMPLETO AQUI"
}

Responda SOMENTE o bloco JSON.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Remove markdown parse tags like \`\`\`json se o modelo colocar
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Erro na geração do Gemini:", e);
        throw new Error("Falha ao analisar com IA. Verifique as chaves e cota da conta.");
    }
};

export const modelCreativeFromVideo = async (
    videoBase64: string,
    mimeType: string,
    productData: any
): Promise<{ title: string; script: string }> => {
    if (!apiKey) {
        throw new Error("Chave VITE_GEMINI_API_KEY não encontrada no .env!");
    }

    // gemini-2.5-flash suporta inputs multimodais (video/audio/image) nativamente com excelente velocidade
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Você é um Estrategista Criativo Sênior obcecado por Engenharia Reversa.
Eu estou te enviando um NATIVO (Vídeo) que é um anúncio de ALTA PERFORMANCE do nosso concorrente.

E aqui estão os dados do NOSSO PRODUTO (O produto que nós queremos vender usando a mesma 'Fórmula' deste vídeo):
NOME: ${productData?.name || 'Não informado'}
NICHO: ${productData?.niche || 'Geral'}
DOR RESOLVIDA: ${productData?.pain_solved || 'Melhorar cenário atual'}
ENTREGÁVEIS: ${productData?.deliverables || 'Sistema'}

SUA TAREFA:
1. "Assista" a este vídeo frame a frame e entenda os GANCHO (3 primeiros segundos), o MECANISMO e o CTA.
2. TRANSCREVA a mesma ESTRUTURA METODOLÓGICA (o mesmo feeling, ritmo de tela dividida, apelo de locução, etc).
3. TRADUZA E SUBSTITUA todo o conteúdo de texto e fala para VENDER O NOSSO PRODUTO, atacando a 'DOR RESOLVIDA' do nosso banco de dados.

🛑 AVISO CRÍTICO DE COPYWRITING:
Você NÃO deve copiar/plagiar as falas e os textos do vídeo concorrente exatamente da mesma maneira.
O objetivo é que você entenda o TIPO DE ESTRUTURA narrativa e USE ESSA ESTRUTURA como "Molde" para assentar o NOSSO produto, porém com PALAVRAS DIFERENTES, Ganchos NOVOS, Abordagem Diferenciada e Persuasão Avançada. Mude os jargões, mude os exemplos práticos na fala do ator, fuja de frases clichês. Diferencie e crie algo Vencedor e Único, preservando daquele vídeo clonado APENAS o "ritmo de corte/visual" que faz ele reter a atenção!

REGRAS:
Forneça o resultado FINAL estritamente no seguinte formato JSON (sem comentários no início ou no fim):
{
  "title": "NOVO ROTEIRO MODELADO",
  "script": "### [HOOK - 0-3s]\\n(Visual: Instrução visual idêntica à do concorrente mas com nosso item)\\n🎙️ Fala: A variação poderosa do texto...\\n\\n### [PRÓXIMA PARTE] ...etc"
}
`;

    const videoPart = {
        inlineData: {
            data: videoBase64,
            mimeType: mimeType
        }
    };

    try {
        const result = await model.generateContent([prompt, videoPart]);
        const response = result.response;
        const text = response.text();

        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedText);
    } catch (e) {
        console.error("Erro na modelagem de Vídeo Gemini:", e);
        throw new Error("Falha ao analisar o vídeo. O Gemini pode ter rejeitado o arquivo ou formato.");
    }
};
