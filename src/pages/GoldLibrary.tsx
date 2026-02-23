import { useState, useEffect } from 'react';
import { Star, Plus, Search, Filter, Video, Trash2, X, Play, Download, Wand2, UploadCloud } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Creative {
    id: string; // uuid from DB
    title: string;
    niche: string;
    format: string;
    url: string;
    thumbnail_url?: string;
}

export default function GoldLibrary() {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterNiche, setFilterNiche] = useState('Todos');
    const [isLoading, setIsLoading] = useState(true);

    // Modal Add state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [newCreative, setNewCreative] = useState<Partial<Creative>>({ niche: 'Emagrecimento', format: 'Reels' });
    const [videoFile, setVideoFile] = useState<File | null>(null);

    // Video Player state
    const [playingVideo, setPlayingVideo] = useState<Creative | null>(null);

    // DB state
    const [creatives, setCreatives] = useState<Creative[]>([]);

    useEffect(() => {
        fetchCreatives();
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
            console.error("Erro ao carregar do Supabase:", error);
        }
        setIsLoading(false);
    };

    const niches = ['Todos', 'Emagrecimento', 'Finanças', 'E-commerce', 'Infoprodutos'];
    const formats = ['Reels', 'Stories', 'Feed'];

    // Gerador Client-Side de Thumbnail (Captura 1 frame do vídeo)
    const generateThumbnail = (file: File): Promise<Blob | null> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.src = URL.createObjectURL(file);
            video.onloadedmetadata = () => {
                video.currentTime = Math.min(1, video.duration / 2); // Vai pro meio do vídeo ou no 1° segundo
            };
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.8);
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

                // Faz upload do .MP4 pro Storage
                const { error: uploadError } = await supabase.storage
                    .from('gold_library_videos')
                    .upload(videoPath, videoFile);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('gold_library_videos')
                    .getPublicUrl(videoPath);

                finalVideoUrl = publicUrlData.publicUrl;

                // Tenta gerar imagem Thumbnail e subir em paralelo
                const thumbBlob = await generateThumbnail(videoFile);
                if (thumbBlob) {
                    const thumbPath = `thumbnails/${timestamp}.jpg`;
                    await supabase.storage.from('gold_library_videos').upload(thumbPath, thumbBlob);
                    const { data: thumbPublicUrl } = supabase.storage.from('gold_library_videos').getPublicUrl(thumbPath);
                    finalThumbnailUrl = thumbPublicUrl.publicUrl;
                }
            }

            if (!finalVideoUrl) {
                alert("Você precisa colar um Link Externo ou Anexar um Vídeo.");
                setIsUploading(false);
                return;
            }

            const { data, error } = await supabase
                .from('gold_library')
                .insert([{
                    title: newCreative.title,
                    niche: newCreative.niche || 'Emagrecimento',
                    format: newCreative.format || 'Reels',
                    url: finalVideoUrl,
                    thumbnail_url: finalThumbnailUrl
                }])
                .select()
                .single();

            if (!error && data) {
                setCreatives([data, ...creatives]);
                setIsAddModalOpen(false);
                setNewCreative({ niche: 'Emagrecimento', format: 'Reels' });
                setVideoFile(null);
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
                setCreatives(creatives.filter(c => c.id !== id));

                // Cleanup Storage para economizar espaço
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
        setPlayingVideo(null); // Fecha o modal atual se estiver assistindo
        navigate('/analisador', { state: { sourceVideoUrl: creative.url } });
    };

    const filteredCreatives = creatives.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesNiche = filterNiche === 'Todos' || c.niche === filterNiche;
        return matchesSearch && matchesNiche;
    });

    // Função utilitária para converter link publico do drive para Iframe de embed
    const getEmbedUrl = (url: string) => {
        if (!url) return url;
        // Tratar Google Drive (view => preview)
        if (url.includes('drive.google.com/file/d/')) {
            const driveIdMatch = url.match(/\/d\/(.+?)\//);
            if (driveIdMatch && driveIdMatch[1]) {
                return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
            }
        }
        // Tratar Vimeo ou Youtube
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

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-gray-100">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-500">
                            <Star className="w-6 h-6 fill-current" />
                        </div>
                        Biblioteca de Ouro
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Seu Feed de Referências de Elite para Assistir, Analisar na IA ou Clonar O Roteiro.
                    </p>
                </div>

                {/* Botão de Upload - APENAS ADMIN */}
                {isAdmin && (
                    <button
                        onClick={() => {
                            setNewCreative({ niche: 'Emagrecimento', format: 'Reels' });
                            setVideoFile(null);
                            setIsAddModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-xl transition-all shadow-sm whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" /> Subir Referência MP4
                    </button>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Pesquisar por Título da Referência..."
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
                        {niches.map(niche => (
                            <option key={niche} value={niche}>{niche}</option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Add New Placeholder Tile - APENAS ADMIN */}
                    {isAdmin && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex flex-col justify-center items-center gap-3 bg-gray-50/50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-yellow-400 dark:hover:border-yellow-600 transition-all text-gray-500 hover:text-yellow-600 dark:text-gray-400 min-h-[300px]"
                        >
                            <Plus className="w-10 h-10" />
                            <span className="font-bold">Anexar Novo</span>
                        </button>
                    )}

                    {filteredCreatives.map((creative) => (
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

                            {/* Thumbnail Area - Click to Play */}
                            <div
                                className="relative flex-1 cursor-pointer bg-gray-100 dark:bg-gray-900 group/thumb min-h-[160px]"
                                onClick={() => setPlayingVideo(creative)}
                            >
                                {creative.thumbnail_url ? (
                                    <img src={creative.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Video className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 md:opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="p-4 rounded-full bg-white/20 backdrop-blur-md">
                                        <Play className="w-8 h-8 text-white fill-current translate-x-0.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Content */}
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1 flex-1 text-sm mr-2" title={creative.title}>
                                    {creative.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODALS */}
            {/* Modal de Adição (Subir Arquivo MP4) */}
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
                                    onChange={e => setNewCreative({ ...newCreative, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nicho</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-yellow-500 outline-none"
                                        value={newCreative.niche}
                                        onChange={e => setNewCreative({ ...newCreative, niche: e.target.value })}
                                    >
                                        {niches.filter(n => n !== 'Todos').map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Formato</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-yellow-500 outline-none"
                                        value={newCreative.format}
                                        onChange={e => setNewCreative({ ...newCreative, format: e.target.value })}
                                    >
                                        {formats.map(f => <option key={f} value={f}>{f}</option>)}
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
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">URL Externa (Alternativa)</label>
                                <input
                                    type="url"
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-yellow-500 outline-none text-sm placeholder-gray-400"
                                    placeholder="Ex: https://vimeo.com/..."
                                    value={newCreative.url || ''}
                                    onChange={e => setNewCreative({ ...newCreative, url: e.target.value })}
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

            {/* Native Video Player Modal (Reprodução in-app) */}
            {playingVideo && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 z-[60] animate-in fade-in zoom-in-95 duration-200">
                    <button
                        onClick={() => setPlayingVideo(null)}
                        className="absolute top-6 right-6 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div className="w-full max-w-lg flex flex-col items-center text-center">
                        <span className="px-3 py-1 bg-yellow-500 text-white text-[10px] font-bold uppercase rounded-md mb-4 tracking-widest">
                            Vídeo Original • {playingVideo.niche}
                        </span>

                        <div className="w-full max-w-[340px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 ring-4 ring-white/5 relative flex items-center justify-center">
                            {/* Custom HTML5 Video Player */}
                            {playingVideo.url.includes('vimeo') || playingVideo.url.includes('youtube') || playingVideo.url.includes('drive.google.com') ? (
                                <iframe
                                    src={getEmbedUrl(playingVideo.url)}
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

                        {/* Ações Avançadas do Vídeo Atual */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-[340px]">
                            <a
                                href={playingVideo.url}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 flex justify-center items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
                            >
                                <Download className="w-5 h-5" /> Baixar MP4
                            </a>
                            <button
                                onClick={() => handleSendToClone(playingVideo)}
                                className="flex-1 flex justify-center items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg"
                            >
                                <Wand2 className="w-5 h-5" /> Clonar na IA
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
