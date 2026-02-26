import { useState, useEffect } from 'react';
import { Star, Plus, Search, Filter, Video, Trash2, X, Play, Download, Wand2, UploadCloud, FolderOpen, ChevronLeft, Folder, Settings, UserCircle, Zap, Headphones, HeartPulse, SplitSquareHorizontal, MonitorPlay, AlertTriangle, Mic } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AdCard } from '../components/AdCard';

interface Creative {
    id: string;
    title: string;
    niche: string;
    format: string;
    style: string;
    url: string;
    thumbnail_url?: string;
}

interface Niche {
    id: string;
    name: string;
}

const STYLES = [
    'TELA DIVIDIDA',
    'SENTADO MOSTRANDO TELA',
    'SELFIE',
    'NOVELINHA',
    'NOTÍCIA',
    'NO CARRO SOZINHO',
    'NO CARRO EM DUAS PESSOAS',
    'MOSTRANDO O PRODUTO',
    'FALSO PODCAST',
    'CAMINHANDO',
    'CÂMERA TRASEIRA 0.5',
    'CAIXA DE PERGUNTAS',
    'ANTES x DEPOIS - iPad',
    '2 PESSOAS CONVERSANDO',
    'PROFISSÕES',
];

const MODELS_DATA = [
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

export default function GoldLibrary() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterNiche, setFilterNiche] = useState('Todos');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'library' | 'models'>('library');
    const [viewMode, setViewMode] = useState<'style' | 'niche'>('style');

    // Modal Add state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [newCreative, setNewCreative] = useState<Partial<Creative>>({
        niche: 'Emagrecimento',
        format: 'Reels',
        style: STYLES[0],
    });
    const [videoFile, setVideoFile] = useState<File | null>(null);

    // Dynamic Niches state
    const [niches, setNiches] = useState<Niche[]>([]);
    const [isNicheModalOpen, setIsNicheModalOpen] = useState(false);
    const [newNicheName, setNewNicheName] = useState('');
    const [isSavingNiche, setIsSavingNiche] = useState(false);

    // Video Player state
    const [playingVideo, setPlayingVideo] = useState<Creative | null>(null);

    // DB state
    const [creatives, setCreatives] = useState<Creative[]>([]);

    useEffect(() => {
        fetchCreatives();
        fetchNiches();
    }, []);

    const fetchCreatives = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('gold_library')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setCreatives(data);
        } else {
            console.error('Erro ao carregar do Supabase:', error);
        }
        setIsLoading(false);
    };

    const fetchNiches = async () => {
        const { data, error } = await supabase
            .from('niches')
            .select('*')
            .order('name', { ascending: true });

        if (!error && data) {
            setNiches(data);
        } else {
            console.error('Erro ao buscar nichos:', error);
        }
    };

    const handleAddNiche = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNicheName.trim()) return;
        setIsSavingNiche(true);

        try {
            const { data, error } = await supabase
                .from('niches')
                .insert([{ name: newNicheName.trim() }])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setNiches([...niches, data].sort((a, b) => a.name.localeCompare(b.name)));
                setNewNicheName('');
            }
        } catch (error: any) {
            alert('Erro ao salvar Nicho. Ele já pode existir.');
            console.error(error);
        } finally {
            setIsSavingNiche(false);
        }
    };

    const handleDeleteNiche = async (id: string) => {
        if (!window.confirm('Certeza que deseja deletar esse Nicho? Ele vai sumir dos filtros.')) return;

        const { error } = await supabase.from('niches').delete().eq('id', id);
        if (!error) {
            setNiches(niches.filter(n => n.id !== id));
            // Opcional: Se o filter estava nesse nicho, limpar.
            const deletedNiche = niches.find(n => n.id === id);
            if (deletedNiche && filterNiche === deletedNiche.name) {
                setFilterNiche('Todos');
            }
        } else {
            alert('Erro ao apagar Nicho.');
        }
    };

    const formats = ['Reels', 'Stories', 'Feed'];

    const getDriveThumbnailUrl = (url: string): string => {
        if (!url) return '';
        // Suporta /d/[ID] ou ?id=[ID] ou links de thumbnail já existentes
        if (url.includes('drive.google.com/thumbnail?id=')) return url;
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w720`;
        }
        return '';
    };

    const getThumbnailFromUrl = (url: string): string => {
        if (!url) return '';
        if (url.includes('drive.google.com')) return getDriveThumbnailUrl(url);

        if (url.includes('youtube.com/watch?v=')) {
            const ytId = url.split('v=')[1]?.split('&')[0];
            if (ytId) return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
        }
        if (url.includes('vimeo.com')) {
            const vimeoId = url.split('/').pop();
            if (vimeoId) return `https://vumbnail.com/${vimeoId}.jpg`;
        }
        return '';
    };

    const generateThumbnail = (file: File): Promise<Blob | null> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = URL.createObjectURL(file);
            video.onloadedmetadata = () => {
                video.currentTime = Math.min(1, video.duration / 2);
            };
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
            };
            video.onerror = () => resolve(null);
        });
    };

    const handleAddCreative = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCreative.title) return;

        setIsUploading(true);
        let finalVideoUrl = newCreative.url || '';
        let finalThumbnailUrl = newCreative.thumbnail_url || '';

        try {
            if (videoFile) {
                const timestamp = Date.now();
                const videoExt = videoFile.name.split('.').pop() || 'mp4';
                const videoPath = `videos/${timestamp}.${videoExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('gold_library_videos')
                    .upload(videoPath, videoFile);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('gold_library_videos')
                    .getPublicUrl(videoPath);

                finalVideoUrl = publicUrlData.publicUrl;

                const thumbBlob = await generateThumbnail(videoFile);
                if (thumbBlob) {
                    const thumbPath = `thumbnails/${timestamp}.jpg`;
                    await supabase.storage.from('gold_library_videos').upload(thumbPath, thumbBlob);
                    const { data: thumbPublicUrl } = supabase.storage
                        .from('gold_library_videos')
                        .getPublicUrl(thumbPath);
                    finalThumbnailUrl = thumbPublicUrl.publicUrl;
                }
            }

            if (!finalVideoUrl) {
                alert('Você precisa colar um Link Externo ou Anexar um Vídeo.');
                setIsUploading(false);
                return;
            }

            if (!finalThumbnailUrl) {
                finalThumbnailUrl = getThumbnailFromUrl(finalVideoUrl);
            }

            const { data, error } = await supabase
                .from('gold_library')
                .insert([{
                    title: newCreative.title,
                    niche: newCreative.niche || 'Emagrecimento',
                    format: newCreative.format || 'Reels',
                    style: newCreative.style || STYLES[0],
                    url: finalVideoUrl,
                    thumbnail_url: finalThumbnailUrl,
                }])
                .select()
                .single();

            if (!error && data) {
                setCreatives([data, ...creatives]);
                setIsAddModalOpen(false);
                setNewCreative({ niche: niches[0]?.name || 'Emagrecimento', format: 'Reels', style: STYLES[0] });
                setVideoFile(null);
                // Navigate into the folder of the newly added video
                if (data.style && viewMode === 'style') setSelectedStyle(data.style);
                if (data.niche && viewMode === 'niche') setSelectedNiche(data.niche);
            } else {
                throw error;
            }
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            alert('Falha crítica ao gravar a Referência. Cheque console. ' + (error?.message || ''));
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string, url: string, thumbUrl?: string) => {
        if (window.confirm('Tem certeza que deseja apagar esta referência Vencedora?')) {
            const { error } = await supabase.from('gold_library').delete().eq('id', id);
            if (!error) {
                setCreatives(creatives.filter((c) => c.id !== id));
                if (url.includes('gold_library_videos')) {
                    const fileName = url.split('/').pop();
                    if (fileName) supabase.storage.from('gold_library_videos').remove([`videos/${fileName}`]);
                }
                if (thumbUrl && thumbUrl.includes('gold_library_videos')) {
                    const fileName = thumbUrl.split('/').pop();
                    if (fileName) supabase.storage.from('gold_library_videos').remove([`thumbnails/${fileName}`]);
                }
            } else {
                alert('Erro ao deletar Banco.');
            }
        }
    };

    const handleSendToClone = (creative: Creative) => {
        setPlayingVideo(null);
        navigate('/analisador', { state: { sourceVideoUrl: creative.url } });
    };

    const getEmbedUrl = (url: string) => {
        if (!url) return url;
        if (url.includes('drive.google.com/file/d/')) {
            const driveIdMatch = url.match(/\/d\/(.+?)\//);
            if (driveIdMatch && driveIdMatch[1]) {
                return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
            }
        }
        if (url.includes('drive.google.com/drive/folders/')) {
            // Folders cannot be embedded easily as preview, return as is but UI will handle it
            return url;
        }
        if (url.includes('vimeo.com') && !url.includes('player.vimeo.com')) {
            const vimeoId = url.split('/').pop();
            if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
        }
        if (url.includes('youtube.com/watch?v=')) {
            const ytId = url.split('v=')[1]?.split('&')[0];
            if (ytId) return `https://www.youtube.com/embed/${ytId}`;
        }
        return url;
    };

    const isDriveFolder = (url: string) => {
        return url.includes('drive.google.com/drive/folders/');
    };

    const filteredCreatives = creatives.filter((c) => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesNiche = filterNiche === 'Todos' || c.niche === filterNiche;
        const matchesStyle = selectedStyle ? c.style === selectedStyle : true;
        const matchesSelectedNiche = selectedNiche ? c.niche === selectedNiche : true;
        return matchesSearch && matchesNiche && matchesStyle && matchesSelectedNiche;
    });

    // ─── Folder view helpers ─────────────────────────────────────────────────────
    const openAddModal = (style?: string, niche?: string) => {
        setNewCreative({
            niche: niche || (filterNiche !== 'Todos' ? filterNiche : niches[0]?.name || 'Emagrecimento'),
            format: 'Reels',
            style: style ? style : (niche ? 'PROFISSÕES' : STYLES[0]),
        });
        setVideoFile(null);
        setIsAddModalOpen(true);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* ── Header ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        {(selectedStyle || selectedNiche) && activeTab === 'library' && (
                            <button
                                onClick={() => { setSelectedStyle(null); setSelectedNiche(null); setSearchTerm(''); }}
                                className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" /> Biblioteca
                            </button>
                        )}
                        {(selectedStyle || selectedNiche) && activeTab === 'library' && <span className="text-gray-400 dark:text-gray-600">/</span>}
                        <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-gray-100">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-500">
                                <Star className="w-6 h-6 fill-current" />
                            </div>
                            {activeTab === 'library' ? (selectedStyle || selectedNiche || 'Biblioteca de Ouro') : 'Biblioteca de Ouro'}
                        </h1>
                    </div>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        {selectedStyle && activeTab === 'library'
                            ? `${filteredCreatives.length} vídeo(s) nesta pasta`
                            : 'Sua coleção e banco de dados avançado de anúncios que mais batem ROI.'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl shrink-0">
                        <button
                            onClick={() => { setActiveTab('library'); setSelectedStyle(null); }}
                            className={`px-4 py-2 font-bold text-sm rounded-lg transition-all ${activeTab === 'library' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            Criativos Salvos
                        </button>
                        <button
                            onClick={() => { setActiveTab('models'); setSelectedStyle(null); }}
                            className={`px-4 py-2 font-bold text-sm rounded-lg transition-all flex items-center gap-2 ${activeTab === 'models' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <Zap className="w-4 h-4" />
                            Ferramentas e Fórmulas
                        </button>
                    </div>

                    {isAdmin && activeTab === 'library' && (
                        <button
                            onClick={() => openAddModal(selectedStyle || undefined, selectedNiche || undefined)}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-xl transition-all shadow-sm shrink-0 w-full sm:w-auto"
                        >
                            <Plus className="w-5 h-5" />
                            {selectedStyle || selectedNiche ? `Subir em "${selectedStyle || selectedNiche}"` : 'Subir Referência'}
                        </button>
                    )}
                </div>
            </div>

            {/* View Mode Toggle (only if in library tab and no folder is selected) */}
            {activeTab === 'library' && !selectedStyle && !selectedNiche && (
                <div className="flex justify-center sm:justify-start">
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('style')}
                            className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'style' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            Ver por Estilo
                        </button>
                        <button
                            onClick={() => setViewMode('niche')}
                            className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'niche' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            Ver por Nicho
                        </button>
                    </div>
                </div>
            )}

            {/* ── Active Tab Content ──────────────────────────────────────────────── */}
            {activeTab === 'library' ? (
                <>
                    {/* ── Search / Filter (only inside a folder) ──────────────────────── */}
                    {selectedStyle && (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar por Título..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-yellow-500 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <select
                                    className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 dark:text-gray-300"
                                    value={filterNiche}
                                    onChange={(e) => setFilterNiche(e.target.value)}
                                >
                                    <option value="Todos">Todos</option>
                                    {niches.map((niche) => (
                                        <option key={niche.id} value={niche.name}>{niche.name}</option>
                                    ))}
                                </select>
                                {isAdmin && (
                                    <button
                                        onClick={() => setIsNicheModalOpen(true)}
                                        className="ml-2 p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Gerenciar Nichos"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Main content ─────────────────────────────────────────────────── */}
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                        </div>
                    ) : (selectedStyle === null && selectedNiche === null) ? (
                        /* ── FOLDER VIEW ─────────────────────────────────────────────── */
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {viewMode === 'style' ? (
                                STYLES.map((style) => {
                                    const styleVideos = creatives.filter((c) => c.style === style);
                                    const previewThumb = styleVideos.find((c) => c.thumbnail_url)?.thumbnail_url;
                                    return (
                                        <button
                                            key={style}
                                            onClick={() => setSelectedStyle(style)}
                                            className="group relative flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden text-left hover:shadow-lg hover:border-yellow-300 dark:hover:border-yellow-600 transition-all"
                                        >
                                            {/* Thumbnail strip or placeholder */}
                                            <div className="aspect-video w-full bg-gray-100 dark:bg-gray-900/50 relative overflow-hidden group/folderthumb">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <FolderOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 group-hover:text-yellow-400 transition-colors" />
                                                </div>
                                                {previewThumb && (
                                                    <img
                                                        src={previewThumb}
                                                        alt={style}
                                                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 z-10"
                                                        referrerPolicy="no-referrer"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent z-20" />
                                                {/* Count badge */}
                                                <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-bold bg-black/60 text-white rounded-md">
                                                    {styleVideos.length} vídeo{styleVideos.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>

                                            {/* Label */}
                                            <div className="flex items-center gap-3 p-4">
                                                <Folder className="w-5 h-5 text-yellow-500 dark:text-yellow-400 shrink-0" />
                                                <span className="font-bold text-sm text-gray-800 dark:text-gray-100 leading-tight group-hover:text-yellow-700 dark:group-hover:text-yellow-400 transition-colors">
                                                    {style}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                niches.map((niche) => {
                                    const nicheVideos = creatives.filter((c) => c.niche === niche.name);
                                    const previewThumb = nicheVideos.find((c) => c.thumbnail_url)?.thumbnail_url;
                                    return (
                                        <button
                                            key={niche.id}
                                            onClick={() => setSelectedNiche(niche.name)}
                                            className="group relative flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden text-left hover:shadow-lg hover:border-yellow-300 dark:hover:border-yellow-600 transition-all"
                                        >
                                            <div className="aspect-video w-full bg-gray-100 dark:bg-gray-900/50 relative overflow-hidden group/folderthumb">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <FolderOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 group-hover:text-yellow-400 transition-colors" />
                                                </div>
                                                {previewThumb && (
                                                    <img
                                                        src={previewThumb}
                                                        alt={niche.name}
                                                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 z-10"
                                                        referrerPolicy="no-referrer"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent z-20" />
                                                <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-bold bg-black/60 text-white rounded-md z-30">
                                                    {nicheVideos.length} vídeo{nicheVideos.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 p-4">
                                                <Folder className="w-5 h-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                                                <span className="font-bold text-sm text-gray-800 dark:text-gray-100 leading-tight group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                                                    {niche.name}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    ) : (
                        /* ── VIDEOS INSIDE FOLDER ────────────────────────────────────── */
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {isAdmin && (
                                <button
                                    onClick={() => openAddModal(selectedStyle || undefined, selectedNiche || undefined)}
                                    className="flex flex-col justify-center items-center gap-3 bg-gray-50/50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-yellow-400 dark:hover:border-yellow-600 transition-all text-gray-500 hover:text-yellow-600 dark:text-gray-400 min-h-[300px]"
                                >
                                    <Plus className="w-10 h-10" />
                                    <span className="font-bold">Subir Nesta Pasta</span>
                                </button>
                            )}

                            {filteredCreatives.length === 0 && !isAdmin ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600">
                                    <FolderOpen className="w-16 h-16 mb-3" />
                                    <p className="font-medium">Nenhum vídeo nesta pasta ainda.</p>
                                </div>
                            ) : (
                                filteredCreatives.map((creative) => (
                                    <div key={creative.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col h-full min-h-[300px]">
                                        {/* Header Tags */}
                                        <div className="p-4 pb-2 z-10 flex justify-between">
                                            <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 text-[10px] font-bold uppercase rounded-md tracking-wider">
                                                {creative.niche} • {creative.format}
                                            </span>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDelete(creative.id, creative.url, creative.thumbnail_url)}
                                                    className="p-1.5 md:opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Thumbnail */}
                                        <div
                                            className="relative aspect-9/16 w-full cursor-pointer bg-gray-100 dark:bg-gray-900 group/thumb overflow-hidden"
                                            onClick={() => setPlayingVideo(creative)}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Video className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                            </div>
                                            {creative.thumbnail_url && (
                                                <img
                                                    src={creative.thumbnail_url}
                                                    alt="Thumbnail"
                                                    className="absolute inset-0 w-full h-full object-cover z-10"
                                                    referrerPolicy="no-referrer"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-black/40 md:opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center z-20">
                                                <div className="p-4 rounded-full bg-white/20 backdrop-blur-md">
                                                    <Play className="w-8 h-8 text-white fill-current translate-x-0.5" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1 text-sm" title={creative.title}>
                                                {creative.title}
                                            </h3>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </>
            ) : (
                /* ── MODELS VIEW (Ferramentas e Fórmulas) ─────────────────────────────────────────────── */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
                    {MODELS_DATA.map((model, index) => (
                        <AdCard key={index} {...model} />
                    ))}
                </div>
            )}

            {/* ── Modal: Adicionar Referência ──────────────────────────────────── */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                <UploadCloud className="w-6 h-6 text-yellow-500" /> Enviar Nova Referência
                            </h2>
                            <button onClick={() => !isUploading && setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddCreative} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Título / Hook do Anúncio</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-yellow-500 outline-none transition-all placeholder-gray-400"
                                    placeholder="Ex: Emagrecimento Fast 23..."
                                    value={newCreative.title || ''}
                                    onChange={(e) => setNewCreative({ ...newCreative, title: e.target.value })}
                                />
                            </div>

                            {/* Estilo (Pasta) */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">📁 Pasta / Estilos de Gravação / Profissões</label>
                                <select
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-yellow-500 outline-none font-medium"
                                    value={newCreative.style}
                                    onChange={(e) => setNewCreative({ ...newCreative, style: e.target.value })}
                                >
                                    {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nicho</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-yellow-500 outline-none"
                                        value={newCreative.niche}
                                        onChange={(e) => setNewCreative({ ...newCreative, niche: e.target.value })}
                                    >
                                        {niches.map((n) => <option key={n.id} value={n.name}>{n.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Formato</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-yellow-500 outline-none"
                                        value={newCreative.format}
                                        onChange={(e) => setNewCreative({ ...newCreative, format: e.target.value })}
                                    >
                                        {formats.map((f) => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Arquivo MP4 (Recomendado)</label>
                                <label className={`cursor-pointer border-2 transition-all flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-dashed ${videoFile ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-yellow-400 bg-gray-50 dark:bg-gray-800'}`}>
                                    <Video className={`w-8 h-8 ${videoFile ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}`} />
                                    <div className="text-center">
                                        <span className={`block text-sm font-bold ${videoFile ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {videoFile ? videoFile.name : 'Selecionar Vídeo do Computador'}
                                        </span>
                                        {!videoFile && <span className="text-xs text-gray-500 mt-1">Gera thumbnail automaticamente</span>}
                                    </div>
                                    <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} disabled={isUploading} />
                                </label>
                            </div>

                            <div className="flex items-center gap-4 py-2 opacity-50">
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">OU</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">URL Externa (Google Drive, Vimeo...)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-yellow-500 outline-none text-sm placeholder-gray-400"
                                    placeholder="Ex: https://drive.google.com/file/d/..."
                                    value={newCreative.url || ''}
                                    onChange={(e) => setNewCreative({ ...newCreative, url: e.target.value.trim() })}
                                    disabled={!!videoFile}
                                />
                            </div>

                            <div className="pt-6 flex gap-3 justify-end">
                                <button type="button" disabled={isUploading} onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isUploading || (!videoFile && !newCreative.url)} className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2">
                                    {isUploading ? 'Enviando...' : 'Gravar no Feed'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Modal: Player de Vídeo ───────────────────────────────────────── */}
            {playingVideo && (
                <div
                    className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto p-4 pt-8 md:pt-16 pb-8 z-60 animate-in fade-in zoom-in-95 duration-200"
                    onClick={() => setPlayingVideo(null)}
                >
                    <button
                        onClick={() => setPlayingVideo(null)}
                        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 md:p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-10"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div
                        className="w-full max-w-lg flex flex-col items-center text-center mt-4 md:mt-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="px-3 py-1 bg-yellow-500 text-white text-[10px] font-bold uppercase rounded-md mb-3 md:mb-4 tracking-widest shadow-lg">
                            {playingVideo.style} • {playingVideo.niche}
                        </span>

                        <div className="w-full max-w-[280px] sm:max-w-[340px] aspect-9/16 max-h-[65vh] xl:max-h-[75vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 ring-4 ring-white/5 relative flex items-center justify-center">
                            {isDriveFolder(playingVideo.url) ? (
                                <div className="flex flex-col items-center gap-4 p-8 text-center text-white">
                                    <div className="p-6 bg-yellow-500/20 rounded-full">
                                        <FolderOpen className="w-16 h-16 text-yellow-500" />
                                    </div>
                                    <h4 className="text-xl font-bold">Pasta do Google Drive</h4>
                                    <p className="text-sm text-gray-400">Esta referência é uma pasta contendo múltiplos arquivos. Clique no botão abaixo para abrir e visualizar.</p>
                                    <a
                                        href={playingVideo.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
                                    >
                                        Acessar Pasta <UploadCloud className="w-4 h-4" />
                                    </a>
                                </div>
                            ) : playingVideo.url.includes('vimeo') || playingVideo.url.includes('youtube') || playingVideo.url.includes('drive.google.com') ? (
                                <iframe
                                    src={playingVideo.url.includes('drive.google.com') ? getEmbedUrl(playingVideo.url) : `${getEmbedUrl(playingVideo.url)}${playingVideo.url.includes('?') ? '&' : '?'}autoplay=1`}
                                    className="w-full h-full border-none"
                                    allow="autoplay; fullscreen"
                                />
                            ) : (
                                <video
                                    src={playingVideo.url}
                                    controls
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-contain bg-black"
                                    controlsList="nodownload"
                                />
                            )}
                        </div>

                        <h3 className="mt-4 text-white font-bold text-base px-4">{playingVideo.title}</h3>

                        <div className="flex flex-row gap-3 mt-6 w-full max-w-[340px]">
                            <a
                                href={playingVideo.url}
                                download={!isDriveFolder(playingVideo.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 flex justify-center items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
                            >
                                <Download className="w-5 h-5" /> {isDriveFolder(playingVideo.url) ? 'Abrir Link' : 'Baixar MP4'}
                            </a>
                            <button
                                onClick={() => handleSendToClone(playingVideo)}
                                className="flex-1 flex justify-center items-center gap-2 px-5 py-3.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg"
                            >
                                <Wand2 className="w-5 h-5" /> Clonar na IA
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ── Modal: Gerenciar Nichos ──────────────────────────────────────── */}
            {isNicheModalOpen && isAdmin && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-70">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                <Settings className="w-5 h-5 text-yellow-500" /> Gerenciar Nichos
                            </h2>
                            <button onClick={() => setIsNicheModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Inserir novo Nicho */}
                            <form onSubmit={handleAddNiche} className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    placeholder="Novo nicho..."
                                    className="flex-1 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-yellow-500 outline-none"
                                    value={newNicheName}
                                    onChange={e => setNewNicheName(e.target.value)}
                                    disabled={isSavingNiche}
                                />
                                <button
                                    type="submit"
                                    disabled={!newNicheName.trim() || isSavingNiche}
                                    className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Adicionar
                                </button>
                            </form>

                            {/* Lista de Nichos */}
                            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2">
                                {niches.length === 0 && <p className="text-gray-500 text-center py-4">Nenhum nicho salvo ainda.</p>}
                                {niches.map(niche => (
                                    <div key={niche.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{niche.name}</span>
                                        <button
                                            onClick={() => handleDeleteNiche(niche.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Excluir nicho"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
