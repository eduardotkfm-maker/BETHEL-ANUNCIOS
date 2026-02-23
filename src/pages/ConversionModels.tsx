import { Filter, Search, UserCircle, Zap, Headphones, HeartPulse, SplitSquareHorizontal, MonitorPlay, AlertTriangle, Mic } from 'lucide-react';
import { AdCard } from '../components/AdCard';

export default function ConversionModels() {
    const models = [
        {
            title: 'UGC Autêntico (Selfie)',
            niche: 'Geral / Produto Físico',
            icon: UserCircle,
            bgGradient: 'from-blue-500 to-cyan-500',
            ctr: '4.8%',
            roas: '6.2x',
            views: '2.1M',
            promptInstruction: `Você é um Copywriter especialista em UGC (User Generated Content) no TikTok/Reels.
Crie um roteiro realista entre 30 a 60 segundos focado na DOR do usuário, focando numa comunicação nativa como se fosse 'um amigo recomendando algo'.

### [HOOK RÁPIDO - 0-3s]
(Visual: Câmera na mão estilo selfie, iluminação natural, segurando o produto em movimento curto)
🎙️ Fala: Uma frase de impacto agressivo abordando uma [DOR COMUM] ou uma Quebra de Expectativa. Sem 'Oi gente'.

### [CONEXÃO UGC - 3-15s]
(Visual: B-roll alternado com rosto da pessoa sofrendo ou explicando como resolveu o problema)
🎙️ Fala: O 'Eu te entendo'. A narrativa de que tentou várias coisas ruins, até encontrar isso. Apresente o Mecanismo Único de forma orgânica.

### [PROVA RÁPIDA E OFERTA - 15-30s]
(Visual: Texto nativo do Instagram na tela mostrando depoimento rápido ou resultado real)
🎙️ Fala: "E não acreditei quando vi [RESULTADO ESPERADO]. Eles tão com promoção na loja".

### [CALL TO ACTION - 30s+]
(Visual: Dedo apontando rápido pro link e tela tremendo de aprovação)
🎙️ Fala: "Clica e pede antes que esgote e tenham que repor".`
        },
        {
            title: 'Mini VSL Disruptivo',
            niche: 'Infoprodutos / Serviços',
            icon: Zap,
            bgGradient: 'from-purple-500 to-indigo-500',
            ctr: '3.9%',
            roas: '8.5x',
            views: '950K',
            promptInstruction: `Você é o mestre da conversão em VSLs Cinematográficas. O objetivo é vender Lógica com Emoção subliminar em até 60s.

### [HOOK CIENTÍFICO/CHOCANTE - 0-5s]
(Visual: Gráfico branco explodindo num fundo preto ou matéria sensacionalista recortada de jornal. Ação rápida, sem locutor aparecendo no primeiro milissegundo)
🎙️ Fala (Voz Forte): Uma constatação que fere o ego do prospecto, desmistificando o principal mito sobre a [DOR]. 

### [CRIANDO O INIMIGO COMUM - 5-20s]
(Visual: Animação simples de lousa/quadro demonstrando a complexidade vs simplicidade)
🎙️ Fala: Jogue a culpa do fracasso do cliente no 'sistema tradicional' ou no 'consenso antigo' e mostre que [NOME DO PRODUTO] não é convencional.

### [PITCH DO MECANISMO ÚNICO - 20-45s]
(Visual: Flash criativo do Produto / Plataforma em alta resolução)
🎙️ Fala: Um soco de lógica mostrando que o sistema entrega [RESULTADOS] rápido por causa do [MECANISMO SECRETO].

### [ESCASSEZ LÓGICA E CTA - 45s+]
(Visual: Barra de progresso de vagas se esgotando ou contagem regressiva tensa)
🎙️ Fala: "Liberei 30 vagas com desconto de early access. Clique no Saiba Mais. Seja rápido."`
        },
        {
            title: 'ASMR Storytelling',
            niche: 'Estética / Tech / Unboxing',
            icon: Headphones,
            bgGradient: 'from-emerald-500 to-teal-400',
            ctr: '5.5%',
            roas: '4.1x',
            views: '3.4M',
            promptInstruction: `Ignore todas as músicas. Aqui o formato é focado nos ruídos satisfatórios, silêncio estratégico e uma voz calma enquanto revela resultados visuais potentes.

### [GANCHO ASMR PURO - 0-4s]
(Visual: MACRO (super perto). Som ALTO de estilete rasgando fita, unhas batendo no plástico ou creme sendo retirado. ZERO LOCUÇÃO NOS PRIMEIROS SEGUNDOS.)
🎙️ Fone: Somente a textura audível da imagem.

### [REVELAÇÃO SATISFATÓRIA - 4-15s]
(Visual: Textura do produto sendo aplicada ou led do Tech Gadget acendendo de forma fluida e suave)
🎙️ Fala (Voz calma próxima do microfone): "Me disseram que o [NOME DO PRODUTO] resolvia [DOR], mas eu não esperava por isso..."

### [USO RELAXANTE - 15-25s]
(Visual: Time-lapse sedoso do produto funcionando na tela ou pele clareando com o creme)
🎙️ Fala (Suave): "É bizarro como ele me entrega [RESULTADO ESPERADO] com esse mecanismo premium..."

### [CTA SUTIL - 25s+]
(Visual: O produto é finalizado ou pousado de volta harmoniosamente. O texto do link aparece.)
🎙️ Fala (Suave): "O link tá fixado embaixo. Vale o hype."`
        },
        {
            title: 'O Conflito Narrativo (Storytelling)',
            niche: 'Saúde / Bem Estar / Coach',
            icon: HeartPulse,
            bgGradient: 'from-orange-500 to-rose-500',
            ctr: '2.8%',
            roas: '3.9x',
            views: '800K',
            promptInstruction: `O usuário quer comprar esperança. Seja vulnerável, doloroso e heroico em até 90 segundos. Sem tom 'empresarial', crie algo visceral.

### [O FUNDO DO POÇO - 0-10s]
(Visual: Ator ou Founder em um cômodo com pouca luz, sentando devagar, encarando a lente)
🎙️ Fala (Tom de confissão exausta): O gatilho emocional exato da vergonha ou estresse que o público alvo sofre ao não ter [RESULTADO ESPERADO].

### [A DESCOBERTA ACIDENTAL - 10-30s]
(Visual: Corte para o rosto um pouco mais tenso. Pega algum objeto que simbolize o Método Antigo na mão)
🎙️ Fala: "Gastei os últimos anos pulando de galho em galho, mas o segredo de verdade cruzou meu caminho de forma silenciosa." 

### [A TRANSIÇÃO HERÓICA - 30-45s]
(Visual: Câmera levanta, luz do sol invade, entra música inspiracional)
🎙️ Fala: "No dia que apliquei [NOME DO PRODUTO], e ativei o [MECANISMO DA FERRAMENTA], tudo virou. Eu estava curado."

### [A MÃO ESTENDIDA - 45s+]
(Visual: Mão esticada ou olhar fraterno direto)
🎙️ Fala: "Se você dói do mesmo lugar que eu doía... Clique agora. Não sofra mais um dia."`
        },
        {
            title: 'Split-Screen: Antes VS Depois',
            niche: 'Fitness / Transformação',
            icon: SplitSquareHorizontal,
            bgGradient: 'from-pink-500 to-fuchsia-600',
            ctr: '5.1%',
            roas: '7.2x',
            views: '4.8M',
            promptInstruction: `Você é focado em Choque Visual Rápido para TikTokers com Déficit de Atenção. Tudo tem que ser dividido no meio. Formato 30s.

### [HOOK HIPNÓTICO SPLIT-SCREEN - 0-5s]
(Visual: Tela rachada no meio. Esquerda: Erro/Dor (Tristeza vermelha / Barriga / Pele ruim). Direita: Acerto/Prazer (Herói / Sucesso / Verde brillante).)
🎙️ Fala (Dinâmico): "Porque todo mundo tá sofrendo de [DOR] enquanto essa galera de cá tá chegando longe?"

### [CARIMBANDO O ERRO - 5-15s]
(Visual: A Esquerda domina a tela, ganha um grande 'X' com som de campainha de erro)
🎙️ Fala: "A culpa não é sua, fazer 'X' e 'Y' tá te matando de frustração, porque te tira energia e não gera [RESULTADO]."

### [A PREMIAÇÃO - 15-25s]
(Visual: A Direita rompe pra tela toda esfregando o Antes e Depois mágico em apenas um flash lindo, junto com a logomarca de [PRODUTO])
🎙️ Fala: "Os prós descobriram o [NOME DO PRODUTO], que com esse mecanismo acelera todos os resultados pro topo."

### [CTA FLASH - 25s+]
(Visual: Seta vermelha apontando freneticamente pra Action Area)
🎙️ Fala: "Pare de atrasar seu progresso. Clica aqui!"`
        },
        {
            title: 'Screencast / Tool Highlight',
            niche: 'SaaS / B2B / Ferramentas',
            icon: MonitorPlay,
            bgGradient: 'from-slate-600 to-gray-800',
            ctr: '2.5%',
            roas: '5.5x',
            views: '1.1M',
            promptInstruction: `Foco total em B2B e produtividade. Apresente o problema complexo e como o seu App resolve com um 'Clique'. Formato Rápido e Limpo de 45s.

### [O CAOS CORPORATIVO (HOOK) - 0-5s]
(Visual: Post It na cara, dezenas de abas do Chrome abertas piscando, cara de burnout no computador)
🎙️ Fala (Rápido): "Se seu time ainda faz [MÉTODO ANTIGO] na mão pra conseguir [RESULTADOS], sua empresa parou no tempo."

### [A PÍLULA MÁGICA - 5-20s]
(Visual: Mostra a UI limpa e o Dark Mode poderoso do [NOME DO PRODUTO])
🎙️ Fala: "Demita a burocracia. Acabei de jogar todo esse problema na conta do [NOME DO PRODUTO]."

### [TUTORIAL EM 3 PONTOS MÁGICOS - 20-35s]
(Visual: Mouse clicando rapidamente em Step 1, Step 2, acompanhado por SFX sonoros potentes e satisfatórios e gráficos subindo na tela)
🎙️ Fala: "Importa os dados. Clica na IA do Painel. E pumba: Automação completa sem usar um desenvolvedor."

### [CTA DIRETÃO - 35s+]
(Visual: Fundo Limpo e o botão amarelo de CTA piscando no centro da tela)
🎙️ Fala: "Aumente as margens hoje com nosso trial grátis. Saiba Mais."`
        },
        {
            title: 'A Lista Negativa',
            niche: 'Consultoria / Cursos',
            icon: AlertTriangle,
            bgGradient: 'from-red-500 to-pink-600',
            ctr: '4.5%',
            roas: '3.8x',
            views: '2.2M',
            promptInstruction: `Essa técnica é controversa mas retém a geração Z. Fale sobre '3 Coisas que estão acabando com a Vida/Resultados do Cliente' listando os erros, e revele o Produto como salvação.

### [O GANCHO DA NEGAÇÃO - 0-5s]
(Visual: Alguém segurando um celular na frente de um espelho ou fazendo texto nativo do Reels pontuando um número com a mão: 3 dedos)
🎙️ Fala: "3 coisas que você tá fazendo de idiota e por isso continua [DOR DO CLIENTE]."

### [OS 2 PRIMEIROS ERROS ÓBVIOS - 5-20s]
(Visual: Edição Fast-Paced com textos fortes saltando no centro do vídeo para cada erro. Efeito sonoro nas transições.)
🎙️ Fala: "O primeiro é o que te dizem desde criancinha pra fazer e só enriquece seu chefe. O segundo é achar que tem que passar fome pra emagrecer."

### [O ERRO FATAL + O SVO DO PRODUTO - 20-40s]
(Visual: Foco dramático na cara. Corta o som da música de fundo para algo mais seco.)
🎙️ Fala: "Mas o erro número 3 é fatal. Você tentar fazer isso enquanto não usa a barreira de proteção de um [MECANISMO NOVO]." Puxe o [NOME DO PRODUTO] como antídoto do Erro 3, mostrando seus diferenciais.

### [A CHAMADA AGRESSIVA - 40s+]
(Visual: Transição pesada para uma arte final com Logo, Oferta e a Seta)
🎙️ Fala: "Se quer consertar a burrada que você aprendeu ano passado. Eu tenho uma oferta. Clica embaixo e muda a chavinha agora."`
        },
        {
            title: 'Entrevista de Rua',
            niche: 'Viral / Apps / E-Commerce',
            icon: Mic,
            bgGradient: 'from-yellow-400 to-orange-500',
            ctr: '6.2%',
            roas: '5.1x',
            views: '5.4M',
            promptInstruction: `O estilo Pop Vox. Entreviste alguém com um microfone vagabundo no meio de um lugar movimentado, faça um Quiz sobre o produto, faça os clientes descobrirem sozinhos a magia da Solução na rua. Formato Curto!

### [O ATAQUE NA RUA (O HOOK) - 0-4s]
(Visual: Entrevistador correndo atrás de um transeunte com um microfone de lapela na mão. Câmera tremida, dinâmica crua e autêntica)
🎙️ Fala (Entrevistador): "Amigo! Quantas horas da sua vida você já perdeu tentando [DOR DO CLIENTE]? Dou cem reais se acertar!"

### [A CONFISSÃO E A CAIXINHA - 4-15s]
(Visual: A pessoa entrevistada dá uma resposta absurdamente alta e sofre, enquanto o apresentador saca o produto do bolso.)
🎙️ Fala (Entrevistada): "Putz, acho que já perdi metade da minha paciência só essa semana com isso!" 
🎙️ Fala (Entrevistador): "E se eu disser que o [NOME DO PRODUTO] limpa essa sua bagunça em dois minutos cravados com tecnologia de ponta?"

### [O TESTE AO VIVO - 15-30s]
(Visual: Entrega o produto ou mostre a tela do app pra pessoa na rua e grave o choque autêntico no rosto dela ao ver a solução [RESULTADOS])
🎙️ Fala (Entrevistada berrando e sorrindo): "Mentira que isso fez tudo automático?! Mano do céu!"

### [O CTA FINAL NO MEIO DA RUA - 30s+]
(Visual: Apresentador encara câmera super perto de forma debochada olhando os papéis ou a mercadoria caírem)
🎙️ Fala: "Você viu. Agora é sua vez de [RESULTADO MÁGICO]. O cupom secreto tá aí embaixo. Corre."`
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Modelos Vencedores</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Base de dados da Bethel Anúncios com os criativos que mais convertem.</p>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar modelos..."
                            className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Filter className="w-4 h-4" /> Filtros
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {models.map((model, index) => (
                    <AdCard key={index} {...model} />
                ))}
            </div>
        </div>
    );
}
