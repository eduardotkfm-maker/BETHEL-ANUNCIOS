import { useState, useEffect } from 'react';
import { Wand2, Video, Check, Sparkles, Link as LinkIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { modelCreativeFromVideo } from '../lib/aiClient';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

export default function AdAnalyzer() {
    const location = useLocation();

    // states para Módulo de Modelagem (Vídeo)
    const [products, setProducts] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [selectedProductId, setSelectedProductId] = useState('');
    const [isModeling, setIsModeling] = useState(false);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [modeledScript, setModeledScript] = useState<{ title: string, script: string } | null>(null);

    useEffect(() => {
        if (location.state?.sourceVideoUrl) {
            setVideoUrl(location.state.sourceVideoUrl);
        }

        const fetchProducts = async () => {
            const { data } = await supabase.from('products').select('*');
            if (data) setProducts(data);
        };
        fetchProducts();
    }, []);

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoUrl(''); // Limpa o link se usuário escolheu arquivo
        }
    };

    const handleModelVideo = async () => {
        if ((!videoFile && !videoUrl) || !selectedProductId) return;

        if (videoUrl && !videoFile) {
            alert("A extração direta por Link Social ainda requer um ambiente backend scraper para pular bloqueios CORS/DRM. Para rodar a Modelação, baixe o vídeo e use a opção de 'Upload .MP4' enquanto conectamos essa API de extração.");
            return;
        }

        setIsModeling(true);
        try {
            const product = products.find(p => p.id === selectedProductId);

            // Lê o arquivo como base64 (se for um arquivo carregado)
            if (videoFile) {
                const reader = new FileReader();
                reader.readAsDataURL(videoFile);
                reader.onload = async () => {
                    const base64Data = (reader.result as string).split(',')[1];
                    const mimeType = videoFile.type;

                    const response = await modelCreativeFromVideo(base64Data, mimeType, product);
                    setModeledScript(response);

                    // Auto-salvar no Kanban
                    await supabase.from('creative_production_tasks').insert([{
                        title: response.title || 'Criativo Modelado da Concorrência',
                        script: response.script,
                        status: 'idea'
                    }]);
                    setIsModeling(false);
                };
                reader.onerror = error => {
                    console.error("Erro na leitura do arquivo", error);
                    setIsModeling(false);
                    alert("Erro interno ao ler o arquivo MP4.");
                };
            }
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Erro na modelagem:', err);
            alert("Ocorreu um erro chamando a IA. " + err.message);
            setIsModeling(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Inteligência de Criativos</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Clone os melhores anúncios da concorrência e modele-os para o seu produto em segundos.</p>
            </div>

            <div className="w-full">
                {/* Clonagem de Concorrente Card */}
                <div className="bg-white dark:bg-gray-900 p-8 sm:p-12 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center h-full">
                    <div className="text-center mb-8">
                        <div className="inline-flex p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-4">
                            <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Clonar Anúncio Vencedor</h3>
                        <p className="text-gray-500 max-w-xl mx-auto">Suba o vídeo (MP4) de um anúncio de alta performance ou cole o link dele. A IA irá decifrar a estrutura narrativa e reescrever o roteiro perfeitamente adaptado para as dores do seu produto.</p>
                    </div>

                    <div className="space-y-6 max-w-2xl mx-auto w-full">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">1. Produto Destino</label>
                            <select
                                className="w-full pl-4 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all font-medium text-gray-700 dark:text-gray-300"
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                            >
                                <option value="">Selecione o produto que será vendido...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.niche})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">2. Fonte Original do Anúncio</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <label className={`cursor-pointer border-2 transition-all flex flex-col items-center justify-center gap-3 p-4 rounded-2xl ${videoFile ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 bg-gray-50 dark:bg-gray-800'}`}>
                                    <Video className={`w-6 h-6 ${videoFile ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                                    <span className={`text-sm font-bold text-center ${videoFile ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {videoFile ? videoFile.name.substring(0, 20) + '...' : 'Upload de Vídeo (.MP4)'}
                                    </span>
                                    <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleVideoUpload} disabled={isModeling} />
                                </label>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <LinkIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="url"
                                        placeholder="Colar link (Reels, TikTok...)"
                                        className="w-full h-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all text-sm font-medium"
                                        value={videoUrl}
                                        onChange={(e) => {
                                            setVideoUrl(e.target.value);
                                            if (e.target.value) setVideoFile(null);
                                        }}
                                        disabled={isModeling}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleModelVideo}
                            disabled={(!videoFile && !videoUrl) || !selectedProductId || isModeling}
                            className="w-full mt-4 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-lg rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            <Wand2 className="w-5 h-5" />
                            {isModeling ? 'Decifrando Roteiro Original...' : 'Iniciar Clonagem Estrutural'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modeled Script Results */}
            {modeledScript && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-6">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-500" /> Roteiro Modelado da Concorrência
                            </h3>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400 px-3 py-1.5 rounded-md">
                                <Check className="w-4 h-4" /> Enviado para a Esteira (Ideias)
                            </span>
                        </div>
                        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                            <ReactMarkdown
                                components={{
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                                    h3: ({ node, ...props }: any) => {
                                        const isHook = String(props.children).toUpperCase().includes('HOOK');
                                        return (
                                            <h3
                                                {...props}
                                                className={`mt-6 mb-3 px-3 py-1.5 rounded-lg inline-block ${isHook
                                                    ? 'bg-amber-100/80 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-black border border-amber-200 dark:border-amber-800/50'
                                                    : 'bg-indigo-50/80 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-800/50'
                                                    }`}
                                            />
                                        );
                                    },
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                                    p: ({ node, ...props }: any) => {
                                        const content = String(props.children);
                                        if (content.includes('🎙️ Fala') || content.includes('🎙️ Fone')) {
                                            return <p {...props} className="text-gray-800 dark:text-gray-200 leading-relaxed bg-white border border-gray-100 dark:border-gray-800 dark:bg-gray-900 p-4 rounded-xl shadow-sm my-3 border-l-4 border-l-blue-500" />
                                        }
                                        if (content.startsWith('(Visual:')) {
                                            return <p {...props} className="text-sm font-medium text-gray-500 dark:text-gray-400 italic mb-2 ml-1" />
                                        }
                                        return <p {...props} className="mb-4 leading-relaxed tracking-wide text-gray-600 dark:text-gray-300" />;
                                    },
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
                                    strong: ({ node, ...props }: any) => <strong {...props} className="font-extrabold text-gray-900 dark:text-white" />
                                }}
                            >
                                {modeledScript.script}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
