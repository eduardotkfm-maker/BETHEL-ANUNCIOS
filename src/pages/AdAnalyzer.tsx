import { useState, useEffect, useRef } from 'react';
import { Wand2, Video, Check, Sparkles, Link as LinkIcon, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { ScriptMarkdown } from '../components/ScriptMarkdown';
import { modelCreativeFromVideo } from '../lib/aiClient';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { traduzirErro } from '../lib/translateError';

export default function AdAnalyzer() {
    const location = useLocation();
    const { user } = useAuth();


    // states para Módulo de Modelagem (Vídeo)
    const [products, setProducts] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [selectedProductId, setSelectedProductId] = useState('');
    const [isModeling, setIsModeling] = useState(false);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [modeledScript, setModeledScript] = useState<{ title: string, script: string | any[] } | null>(null);
    const [driveFallback, setDriveFallback] = useState(false); // mostra painel de fallback guiado
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isModeling) {
            setElapsedSeconds(0);
            timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isModeling]);

    useEffect(() => {
        if (location.state?.sourceVideoUrl) {
            setVideoUrl(location.state.sourceVideoUrl);
        }

        const fetchProducts = async () => {
            if (!user) return;
            const { data } = await supabase.from('products').select('*').eq('user_id', user.id);
            if (data) setProducts(data);
        };
        fetchProducts();
    }, [user, location.state]);

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoUrl('');
            setDriveFallback(false);
        }
    };

    // Helper: Extrai o ID de um link do Google Drive
    const getDriveFileId = (url: string): string | null => {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        return match?.[1] || null;
    };

    const processVideoFile = async (file: File) => {
        setIsModeling(true);
        const product = products.find(p => p.id === selectedProductId);

        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1]);
                };
                reader.onerror = () => reject('Erro ao ler o arquivo de vídeo.');
            });

            const mimeType = file.type || 'video/mp4';
            const response = await modelCreativeFromVideo(base64, mimeType, product);

            setModeledScript(response);

            await supabase.from('creative_production_tasks').insert([{
                title: response.title || 'Criativo Modelado da Concorrência',
                script: response.script,
                status: 'idea',
                user_id: user?.id
            }]);
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error("Erro no processamento de vídeo:", error);
            alert(traduzirErro(error, "Erro ao analisar o vídeo. Tente um arquivo menor ou verifique sua conexão."));
        } finally {
            setIsModeling(false);
        }
    };

    const handleModelVideo = async () => {
        if ((!videoFile && !videoUrl) || !selectedProductId) return;

        setIsModeling(true);
        setDriveFallback(false);

        try {
            // Caminho 1: Arquivo local (upload direto)
            if (videoFile) {
                await processVideoFile(videoFile);
                return;
            }

            // Caminho 2: Link do Google Drive (tentativa automática)
            const driveId = getDriveFileId(videoUrl);
            if (driveId) {
                try {
                    const directUrl = `https://drive.google.com/uc?export=download&id=${driveId}`;
                    const res = await fetch(directUrl);

                    if (!res.ok) throw new Error(`HTTP ${res.status}`);

                    const blob = await res.blob();

                    if (blob.size < 1000) {
                        // Google retornou uma página HTML de confirmação, não o vídeo real
                        throw new Error('Arquivo muito grande ou acesso restrito');
                    }

                    const file = new File([blob], 'drive_video.mp4', { type: 'video/mp4' });
                    await processVideoFile(file);
                    return;
                } catch (driveErr) {
                    console.warn('Download automático do Drive falhou, mostrando fallback:', driveErr);
                    setIsModeling(false);
                    setDriveFallback(true);
                    return;
                }
            }

            // Caminho 3: URLs Diretas (Supabase, S3, etc)
            if (videoUrl.includes('.mp4') || videoUrl.includes('.webm') || videoUrl.includes('supabase.co/storage')) {
                try {
                    const res = await fetch(videoUrl);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const blob = await res.blob();
                    const file = new File([blob], 'video_ref.mp4', { type: blob.type || 'video/mp4' });
                    await processVideoFile(file);
                    return;
                } catch (directErr) {
                    console.error('Falha ao baixar vídeo direto:', directErr);
                }
            }

            // Caminho 4: Outros links (YouTube, TikTok, etc.) — ainda sem suporte
            alert("A extração direta de Links Sociais (YT/TikTok) ainda requer um backend profissional. Baixe o vídeo manualmente ou use uma referência da Biblioteca de Ouro.");
            setIsModeling(false);

        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Erro na modelagem:', err);
            alert("Ocorreu um erro chamando a IA. " + traduzirErro(err));
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
                                className="w-full pl-4 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-950 outline-none transition-all font-medium text-gray-700 dark:text-gray-300"
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
                                        className="w-full h-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-950 outline-none transition-all text-sm font-medium text-gray-900 dark:text-gray-100"
                                        value={videoUrl}
                                        onChange={(e) => {
                                            setVideoUrl(e.target.value);
                                            if (e.target.value) setVideoFile(null);
                                            setDriveFallback(false);
                                        }}
                                        disabled={isModeling}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleModelVideo}
                            disabled={(!videoFile && !videoUrl) || !selectedProductId || isModeling}
                            className="w-full mt-4 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-black text-lg rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            {isModeling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                            {isModeling ? 'Decifrando Roteiro Original...' : 'Iniciar Clonagem Estrutural'}
                        </button>

                        {/* Barra de progresso durante clonagem */}
                        {isModeling && (
                            <div className="mt-4 p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                                            {elapsedSeconds < 10 ? 'Enviando vídeo para a IA...' :
                                             elapsedSeconds < 25 ? 'Analisando estrutura narrativa...' :
                                             elapsedSeconds < 45 ? 'Reescrevendo roteiro para seu produto...' :
                                             'Finalizando clonagem estrutural...'}
                                        </span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-indigo-500 dark:text-indigo-400">
                                        {Math.floor(elapsedSeconds / 60).toString().padStart(2, '0')}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full overflow-hidden">
                                    <div className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" style={{
                                        width: `${Math.min(95, elapsedSeconds < 10 ? elapsedSeconds * 3 : elapsedSeconds < 30 ? 30 + (elapsedSeconds - 10) * 2 : elapsedSeconds < 60 ? 70 + (elapsedSeconds - 30) * 0.5 : 85 + Math.min(10, (elapsedSeconds - 60) * 0.2))}%`,
                                        transition: 'width 1s ease-out'
                                    }} />
                                </div>
                                <p className="mt-2 text-xs text-indigo-500 dark:text-indigo-400">
                                    Este processo pode levar até 1 minuto dependendo do tamanho do vídeo.
                                </p>
                            </div>
                        )}

                        {/* ── Fallback Guiado para Google Drive ────────── */}
                        {driveFallback && videoUrl && (
                            <div className="mt-4 p-5 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="flex items-start gap-3 mb-4">
                                    <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm">O Google Drive bloqueou o acesso direto</h4>
                                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">O arquivo pode ser grande ou tem restrição de compartilhamento. Siga estes 2 passos rápidos:</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-gray-700">
                                        <span className="shrink-0 w-7 h-7 bg-amber-500 text-white rounded-full flex items-center justify-center font-black text-xs">1</span>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">Clique abaixo para baixar o vídeo do Drive</span>
                                        <a
                                            href={videoUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition-colors"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Abrir no Drive
                                        </a>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-gray-700">
                                        <span className="shrink-0 w-7 h-7 bg-indigo-500 text-white rounded-full flex items-center justify-center font-black text-xs">2</span>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">Depois que baixar, suba o arquivo aqui:</span>
                                        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer">
                                            <Video className="w-3.5 h-3.5" /> Upload MP4
                                            <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleVideoUpload} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
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
                        <div className="mt-4">
                            <ScriptMarkdown
                                content={typeof modeledScript.script === 'string'
                                    ? modeledScript.script
                                    : Array.isArray(modeledScript.script)
                                        ? modeledScript.script.map((s: any) => `### ${s.title || s.hook || s.section || ''}\n\n(Visual: ${s.visual || ''})\n\n🎙️ Fala: "${s.audio || s.fala || s.text || s.script || ''}"`).join('\n\n')
                                        : JSON.stringify(modeledScript.script, null, 2)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
