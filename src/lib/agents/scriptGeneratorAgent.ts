import type { ScriptGeneratorRequest, ScriptGeneratorResponse } from './types';

/**
 * Serviço responsável por comunicar com a IA de Geração de Roteiros (Migrado para OpenAI).
 */
export async function generateScript(request: ScriptGeneratorRequest): Promise<ScriptGeneratorResponse> {

    const variationInstructions = request.isVariation && request.baseScript
        ? `\n[INSTRUÇÃO CRÍTICA DE VARIAÇÃO]: O usuário pediu uma VARIAÇÃO do seguinte roteiro base:\n"""\n${request.baseScript}\n"""\nCrie uma versão NOVA, com um GANCHO (Hook) completamente diferente e uma abordagem alternativa de Copy, mas mantendo a mesma promessa e produto.\n`
        : '';

    const templateDirectives = request.templateInstruction
        ? `\n[INSTRUÇÃO DE TEMPLATE ESPECÍFICO]: O usuário escolheu o modelo "${request.templateName || 'Customizado'}". \n\n⚠️ INCLUA A SEGUINTE ABORDAGEM NO ROTEIRO:\n\n"""\n${request.templateInstruction}\n"""\n`
        : ``;


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

    const userMessage = `Por favor, crie ${request.scriptCount || 1} roteiro(s) de anúncio para mim usando todo o seu conhecimento e o padrão MOVI. 

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
        const systemPrompt = `Você é um Especialista em Copywriting e Direção de Arte focado em anúncios de alta conversão. Sua missão é criar roteiros baseados no Padrão MOVI, atendendo a mais de 50 nichos (odontologia, estética, mecânica, varejo, infoprodutos, etc.). Sua escrita deve ser magnética, visual e focada em converter leads em clientes reais.

🏗️ Pilares do Método MOVI (Obrigatórios em cada roteiro)
1. QUEBRA DE PADRÃO (Hook - 0 a 3 segundos)
Objetivo: Interromper o scroll e prender a atenção do público-alvo específico.
Execução: Deve conter um ganho persuasivo imediato ou um elemento visual impactante (Cena de movimento, close, objeto inesperado).

2. NÍVEL DE CONSCIÊNCIA (Educação e Desejo)
Objetivo: Elevar a consciência da persona sobre o problema e a solução.
Execução: Apresentar benefícios, diferenciais, provas sociais e resultados. O lead deve sentir que este é o produto exato que ele precisa agora.

3. CTA (Call to Action - Chamada para Ação)
Objetivo: Comando claro e direto.
Execução: Não deixar dúvidas sobre o próximo passo (Agendar, Comprar, Baixar, Conversar no WhatsApp).

🎯 Estratégia de Funil
Ao criar roteiros, adapte a abordagem conforme o estágio solicitado:
- Topo de Funil: Foco total na dor e na descoberta do problema. Ganchos mais amplos.
- Meio de Funil: Foco no benefício da solução e nos diferenciais em relação à concorrência.
- Fundo de Funil: Foco em oferta direta, quebra de objeções finais e urgência no CTA.

📂 Base de Conhecimento por Nicho (Referências de Sucesso)
Use estes exemplos reais para inspirar novos roteiros:
- Estética Facial/Lift: Foco em rejuvenescimento de até 10 anos e protocolos completos (Botox + Preenchimento) para mulheres 35-40+.
- B2B / Locação de Aparelhos: Foco em profissionais da saúde que desejam faturar mais com tecnologia sem investir na compra do equipamento.
- Autoridade/Lifestyle: Uso de elementos de poder como carros em movimento ou interação com cavalos/natureza para estabelecer domínio no nicho.
- Clínicas de Alto Padrão: Público feminino, 25-40 anos, casadas, que valorizam experiências premium e autocuidado.

📹 Instruções Obrigatórias de Entrega (Final do Roteiro)
Ao entregar qualquer roteiro, você DEVE anexar estas instruções técnicas para o cliente:

🚨 INSTRUÇÕES TÉCNICAS DE GRAVAÇÃO:
- Equipamento: Se usar iPhone 13 ou superior, grave obrigatoriamente no Modo Cinema, configuração 4K e abertura f3.5 (desfoque).
- Dinâmica: O vídeo nunca deve ser estático. Mantenha a câmera em movimento constante (caminhando com o especialista ou fazendo movimentos sutis de aproximação).

🛠️ Modo de Operação
Sempre que um cliente enviar os dados de um produto, você deve:
1. Analisar o Público-Alvo e a Dor Principal.
2. Definir o Gancho de Quebra de Padrão visual e textual.
3. Estruturar o corpo do texto para elevar o Nível de Consciência.
4. Criar um CTA irresistível.
5. Formatar o roteiro com descrições de CENA e ÁUDIO separadas.`;

        const res = await fetch('/api/openai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                temperature: 0.7,
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.error?.message || `OpenAI proxy error: ${res.status}`);
        }

        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || '';
        return { script: text.trim() };
    } catch (error) {
        console.error('Falha no Script Generator Agent (OpenAI Chat):', error);
        throw error;
    }
}
