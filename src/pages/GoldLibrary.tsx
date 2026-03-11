import { useState, useEffect, useRef } from 'react';
import { Star, Plus, Search, Filter, Video, Trash2, X, Download, Wand2, UploadCloud, FolderOpen, ChevronLeft, ChevronRight, Folder, Settings, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { traduzirErro } from '../lib/translateError';

import { ModelCard } from '../components/GoldLibrary/ModelCard';
import { VideoCard } from '../components/GoldLibrary/VideoCard';

interface Creative {
    id: string;
    title: string;
    niche: string;
    format: string;
    style: string;
    url: string;
    thumbnail_url?: string;
}

interface Category {
    id: string;
    name: string;
}

interface Model {
    id: string;
    title: string;
    niche: string;
    icon_name: string;
    bg_gradient: string;
    ctr: string;
    roas: string;
    views: string;
    prompt_instruction: string;
    example_video_url?: string;
    example_thumbnail_url?: string;
}



export default function GoldLibrary() {
    const navigate = useNavigate();
    const { isAdmin, user } = useAuth();
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
        style: '',
    });
    const [videoFile, setVideoFile] = useState<File | null>(null);

    // Dynamic Categories state
    const [niches, setNiches] = useState<Category[]>([]);
    const [styles, setStyles] = useState<Category[]>([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryModalTab, setCategoryModalTab] = useState<'niches' | 'styles'>('niches');

    // Form fields for Categories
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isSavingCategory, setIsSavingCategory] = useState(false);

    // Video Player state
    const [playingVideo, setPlayingVideo] = useState<Creative | null>(null);
    const touchStartY = useRef<number | null>(null);
    const isDragging = useRef<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoProgress, setVideoProgress] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const progressBarRef = useRef<HTMLDivElement>(null);

    // DB state
    const [creatives, setCreatives] = useState<Creative[]>([]);
    const [models, setModels] = useState<Model[]>([]);

    // Model Example state
    const [playingModelVideo, setPlayingModelVideo] = useState<{ title: string; url: string } | null>(null);
    const [isUploadingModelVideo, setIsUploadingModelVideo] = useState<string | null>(null);

    useEffect(() => {
        fetchCreatives();
        fetchNiches();
        fetchStyles();
        fetchModels();
    }, []);

    // Auto-play: abre o primeiro vídeo automaticamente para usuários não-admin
    const hasAutoPlayed = useRef(false);
    useEffect(() => {
        if (!isAdmin && !isLoading && creatives.length > 0 && !hasAutoPlayed.current) {
            hasAutoPlayed.current = true;
            const first = creatives[0];
            // Entra na pasta do primeiro vídeo para permitir swipe
            if (first.style && viewMode === 'style') setSelectedStyle(first.style);
            else if (first.niche) setSelectedNiche(first.niche);
            setPlayingVideo(first);
        }
    }, [isLoading, creatives, isAdmin]);

    const fetchCreatives = async () => {
        if (!user) return;
        setIsLoading(true);

        // RLS já garante acesso: todos podem ver gold_library (migration 000004)
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

    const fetchStyles = async () => {
        if (!user) return;
        // Todos os estilos visíveis: globais (user_id IS NULL) + do próprio usuário
        const { data, error } = await supabase
            .from('styles')
            .select('*')
            .or(`user_id.is.null,user_id.eq.${user.id}`)
            .order('name', { ascending: true });

        if (!error && data) {
            setStyles(data);
        } else {
            setStyles([]);
        }
    };

    const fetchNiches = async () => {
        if (!user) return;
        // Todos os nichos visíveis: globais (user_id IS NULL) + do próprio usuário
        const { data, error } = await supabase
            .from('niches')
            .select('*')
            .or(`user_id.is.null,user_id.eq.${user.id}`)
            .order('name', { ascending: true });

        if (!error && data) {
            setNiches(data);
        } else {
            console.error('Erro ao buscar nichos:', error);
        }
    };

    const fetchModels = async () => {
        const { data, error } = await supabase
            .from('gold_models')
            .select('*')
            .order('created_at', { ascending: true });

        if (!error && data) {
            setModels(data);
        } else {
            console.error('Erro ao buscar modelos:', error);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        setIsSavingCategory(true);

        const table = categoryModalTab === 'niches' ? 'niches' : 'styles';

        try {
            if (editingCategory) {
                // Edit
                const { error } = await supabase
                    .from(table)
                    .update({ name: newCategoryName.trim() })
                    .eq('id', editingCategory.id);

                if (error) throw error;

                if (categoryModalTab === 'niches') {
                    setNiches(niches.map(n => n.id === editingCategory.id ? { ...n, name: newCategoryName.trim() } : n).sort((a, b) => a.name.localeCompare(b.name)));
                    if (filterNiche === editingCategory.name) setFilterNiche(newCategoryName.trim());
                } else {
                    setStyles(styles.map(s => s.id === editingCategory.id ? { ...s, name: newCategoryName.trim() } : s).sort((a, b) => a.name.localeCompare(b.name)));
                }
                setEditingCategory(null);
            } else {
                // Add
                const { data, error } = await supabase
                    .from(table)
                    .insert([{ name: newCategoryName.trim(), user_id: isAdmin ? null : user?.id }])
                    .select()
                    .single();

                if (error) throw error;
                if (data) {
                    if (categoryModalTab === 'niches') setNiches([...niches, data].sort((a, b) => a.name.localeCompare(b.name)));
                    else setStyles([...styles, data].sort((a, b) => a.name.localeCompare(b.name)));
                }
            }
            setNewCategoryName('');
        } catch (error: any) {
            alert(`Erro ao salvar ${categoryModalTab === 'niches' ? 'Nicho' : 'Estilo'}. Pode já existir.`);
            console.error(error);
        } finally {
            setIsSavingCategory(false);
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        const typeName = categoryModalTab === 'niches' ? 'Nicho' : 'Estilo';
        if (!window.confirm(`Certeza que deseja deletar esse ${typeName}?'`)) return;

        const table = categoryModalTab === 'niches' ? 'niches' : 'styles';
        const { error } = await supabase.from(table).delete().eq('id', id);

        if (!error) {
            if (categoryModalTab === 'niches') {
                setNiches(niches.filter(n => n.id !== id));
                if (filterNiche === name) setFilterNiche('Todos');
            } else {
                setStyles(styles.filter(s => s.id !== id));
            }
        } else {
            alert(`Erro ao apagar ${typeName}.`);
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
                    style: newCreative.style || (styles[0]?.name || ''),
                    url: finalVideoUrl,
                    thumbnail_url: finalThumbnailUrl,
                    user_id: null // Global: visível para todos os usuários
                }])
                .select()
                .single();

            if (!error && data) {
                setCreatives([data, ...creatives]);
                setIsAddModalOpen(false);
                setNewCreative({ niche: niches[0]?.name || 'Emagrecimento', format: 'Reels', style: (styles[0]?.name || '') });
                setVideoFile(null);
                // Navigate into the folder of the newly added video
                if (data.style && viewMode === 'style') setSelectedStyle(data.style);
                if (data.niche && viewMode === 'niche') setSelectedNiche(data.niche);
            } else {
                throw error;
            }
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            alert('Falha ao gravar a Referência. ' + traduzirErro(error));
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

    const handleUploadModelExample = async (modelTitle: string, file: File) => {
        if (!isAdmin) return;
        setIsUploadingModelVideo(modelTitle);

        try {
            const timestamp = Date.now();
            const ext = file.name.split('.').pop() || 'mp4';
            const videoPath = `model_examples/${modelTitle.replace(/\s+/g, '_').toLowerCase()}_${timestamp}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from('gold_library_videos')
                .upload(videoPath, file);

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('gold_library_videos')
                .getPublicUrl(videoPath);

            // Agora persistimos no banco
            const { error: updateError } = await supabase
                .from('gold_models')
                .update({ example_video_url: publicUrlData.publicUrl })
                .eq('title', modelTitle);

            if (updateError) throw updateError;

            fetchModels();
            alert('Exemplo de modelo atualizado com sucesso!');

        } catch (error: any) {
            alert('Erro no upload do exemplo: ' + traduzirErro(error));
        } finally {
            setIsUploadingModelVideo(null);
        }
    };

    const handleSendToClone = (creative: Creative) => {
        setPlayingVideo(null);
        navigate('/analisador', { state: { sourceVideoUrl: creative.url } });
    };

    const getEmbedUrl = (url: string) => {
        if (!url) return url;
        if (url.includes('drive.google.com/file/d/')) {
            const driveIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
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

    // ─── Swipe Cross-Folder Logic ────────────────────────────────────────────────
    const handleSwipe = (direction: 1 | -1) => {
        if (!playingVideo) return;

        const currentIndex = filteredCreatives.findIndex(c => c.id === playingVideo.id);

        if (direction === 1) {
            if (currentIndex >= 0 && currentIndex < filteredCreatives.length - 1) {
                setPlayingVideo(filteredCreatives[currentIndex + 1]);
                return;
            }
        } else if (direction === -1) {
            if (currentIndex > 0) {
                setPlayingVideo(filteredCreatives[currentIndex - 1]);
                return;
            }
        }

        // Transition to next folder if at boundary
        if (viewMode === 'style' && selectedStyle) {
            const currentFolderIndex = styles.findIndex(s => s.name === selectedStyle);
            if (currentFolderIndex === -1) return;

            let nextFolderIndex = currentFolderIndex + direction;

            while (nextFolderIndex >= 0 && nextFolderIndex < styles.length) {
                const nextStyleName = styles[nextFolderIndex].name;

                const nextFolderCreatives = creatives.filter((c) => {
                    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesNiche = filterNiche === 'Todos' || c.niche === filterNiche;
                    const matchesStyle = c.style === nextStyleName;
                    return matchesSearch && matchesNiche && matchesStyle;
                });

                if (nextFolderCreatives.length > 0) {
                    setSelectedStyle(nextStyleName);
                    if (direction === 1) {
                        setPlayingVideo(nextFolderCreatives[0]);
                    } else {
                        setPlayingVideo(nextFolderCreatives[nextFolderCreatives.length - 1]);
                    }
                    return;
                }
                nextFolderIndex += direction;
            }
        } else if (viewMode === 'niche' && selectedNiche) {
            const currentFolderIndex = niches.findIndex(n => n.name === selectedNiche);
            if (currentFolderIndex === -1) return;

            let nextFolderIndex = currentFolderIndex + direction;

            while (nextFolderIndex >= 0 && nextFolderIndex < niches.length) {
                const nextNicheName = niches[nextFolderIndex].name;
                if (nextNicheName === 'Estilos de Gravação') {
                    nextFolderIndex += direction;
                    continue;
                }

                const nextFolderCreatives = creatives.filter((c) => {
                    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesNiche = c.niche === nextNicheName;
                    return matchesSearch && matchesNiche;
                });

                if (nextFolderCreatives.length > 0) {
                    setSelectedNiche(nextNicheName);
                    if (direction === 1) {
                        setPlayingVideo(nextFolderCreatives[0]);
                    } else {
                        setPlayingVideo(nextFolderCreatives[nextFolderCreatives.length - 1]);
                    }
                    return;
                }
                nextFolderIndex += direction;
            }
        }
    };

    // ─── Folder view helpers ─────────────────────────────────────────────────────
    const openAddModal = (style?: string, niche?: string) => {
        setNewCreative({
            niche: niche || (filterNiche !== 'Todos' ? filterNiche : niches[0]?.name || 'Emagrecimento'),
            format: 'Reels',
            style: style ? style : (styles[0]?.name || ''),
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
                                        onClick={() => { setCategoryModalTab('niches'); setIsCategoryModalOpen(true); }}
                                        className="ml-2 p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Gerenciar Categorias"
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
                                styles.map((styleObj) => {
                                    const style = styleObj.name;
                                    const styleVideos = creatives.filter((c) => c.style === style);
                                    const previewThumb = styleVideos.find((c) => c.thumbnail_url)?.thumbnail_url;
                                    return (
                                        <button
                                            key={styleObj.id}
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
                                    if (niche.name === 'Estilos de Gravação') return null; // Prevent showing styles folder in niche view
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
                                    <VideoCard
                                        key={creative.id}
                                        creative={creative}
                                        isAdmin={isAdmin}
                                        onDelete={handleDelete}
                                        onPlay={setPlayingVideo}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </>
            ) : (
                /* ── MODELS VIEW (Ferramentas e Fórmulas) ─────────────────────────────────────────────── */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
                    {models.map((model) => (
                        <ModelCard
                            key={model.id}
                            model={model}
                            isAdmin={isAdmin}
                            isUploading={isUploadingModelVideo === model.title}
                            onPlayExample={(title, url) => setPlayingModelVideo({ title, url })}
                            onUploadExample={handleUploadModelExample}
                        />
                    ))}
                    {models.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-gray-500">Nenhuma fórmula carregada do banco de dados ainda.</p>
                        </div>
                    )}
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

                            {/* Estilo (Pasta) — sempre visível para evitar fallback errado */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">📁 Pasta / Estilos de Gravação</label>
                                <select
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-yellow-500 outline-none font-medium"
                                    value={newCreative.style}
                                    onChange={(e) => setNewCreative({ ...newCreative, style: e.target.value })}
                                >
                                    {styles.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
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
                    className="fixed inset-0 bg-black align-middle flex flex-col items-center justify-center overflow-hidden z-60 animate-in fade-in zoom-in-95 duration-200 touch-none"
                    onClick={() => {
                        if (isDragging.current) return;
                        setPlayingVideo(null);
                    }}
                    onPointerDown={(e) => {
                        touchStartY.current = e.clientY;
                        isDragging.current = false;
                    }}
                    onPointerUp={(e) => {
                        if (touchStartY.current === null) return;
                        const touchEndY = e.clientY;
                        const distance = touchStartY.current - touchEndY;

                        if (Math.abs(distance) > 5) {
                            isDragging.current = true;
                        }

                        if (distance > 50) {
                            handleSwipe(1);
                        } else if (distance < -50) {
                            handleSwipe(-1);
                        }
                        touchStartY.current = null;

                        setTimeout(() => {
                            isDragging.current = false;
                        }, 50);
                    }}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setPlayingVideo(null); }}
                        className="absolute top-6 right-4 md:right-8 p-3 bg-black/40 text-white rounded-full transition-all z-20 backdrop-blur-md"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div
                        className="w-full h-full md:w-auto md:h-auto flex items-center justify-center gap-4 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Previous Button — desktop only */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleSwipe(-1); }}
                            className="hidden md:flex items-center justify-center w-14 h-14 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all shrink-0"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>

                        <div className="flex flex-col items-center text-center relative">
                            {/* Title pill floating Top for mobile, or static for desktop */}
                            <div className="absolute top-8 left-0 right-0 z-10 flex justify-center pointer-events-none px-4">
                                <span className="px-3 py-1 bg-yellow-500 text-white text-[10px] font-bold uppercase rounded-md tracking-widest shadow-lg">
                                    {playingVideo.style} • {playingVideo.niche}
                                </span>
                            </div>

                            {/* Video Container */}
                            <div className="w-full h-dvh md:w-[420px] md:h-[75vh] xl:w-[480px] xl:h-[82vh] md:rounded-3xl bg-black overflow-hidden shadow-2xl md:border border-white/10 md:ring-4 ring-white/5 relative flex items-center justify-center group flex-col">
                            {isDriveFolder(playingVideo.url) ? (
                                <div className="flex flex-col items-center gap-4 p-8 text-center text-white cursor-default">
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
                                    className="w-full h-dvh md:h-full border-none"
                                    allow="autoplay; fullscreen"
                                />
                            ) : (
                                <video
                                    ref={videoRef}
                                    src={`${playingVideo.url}${playingVideo.url.includes('?') ? '&' : '?'}ngsw-bypass=true`}
                                    crossOrigin="anonymous"
                                    autoPlay
                                    playsInline
                                    loop
                                    onLoadedMetadata={() => {
                                        if (videoRef.current) setVideoDuration(videoRef.current.duration);
                                    }}
                                    onTimeUpdate={() => {
                                        if (videoRef.current) setVideoProgress(videoRef.current.currentTime);
                                    }}
                                    onClick={(e) => {
                                        if (isDragging.current) {
                                            e.stopPropagation();
                                            return;
                                        }
                                        if (videoRef.current) {
                                            if (videoRef.current.paused) videoRef.current.play();
                                            else videoRef.current.pause();
                                        }
                                    }}
                                    className="w-full h-full object-contain md:object-contain bg-black cursor-pointer"
                                    controlsList="nodownload"
                                />
                            )}

                            {/* Video Progress Bar */}
                            {videoDuration > 0 && !isDriveFolder(playingVideo.url) && !(playingVideo.url.includes('vimeo') || playingVideo.url.includes('youtube') || playingVideo.url.includes('drive.google.com')) && (
                                <div
                                    ref={progressBarRef}
                                    className="absolute bottom-[140px] md:bottom-[150px] left-4 right-4 z-20 h-6 flex items-center cursor-pointer pointer-events-auto group"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!progressBarRef.current || !videoRef.current) return;
                                        const rect = progressBarRef.current.getBoundingClientRect();
                                        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                                        videoRef.current.currentTime = ratio * videoDuration;
                                    }}
                                >
                                    <div className="w-full h-1 group-hover:h-1.5 bg-white/20 rounded-full overflow-hidden transition-all">
                                        <div
                                            className="h-full bg-white rounded-full transition-[width] duration-100"
                                            style={{ width: `${(videoProgress / videoDuration) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Floating Action Buttons Area */}
                            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/50 to-transparent pt-20 pb-8 px-4 flex flex-col justify-end items-center pointer-events-none">
                                <h3 className="text-white font-bold text-base md:text-lg mb-4 text-center drop-shadow-md">
                                    {playingVideo.title}
                                </h3>

                                <div className="flex flex-row gap-3 w-full max-w-[340px] pointer-events-auto">
                                    <a
                                        href={playingVideo.url}
                                        download={!isDriveFolder(playingVideo.url)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 flex justify-center items-center gap-2 px-5 py-3.5 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-medium rounded-xl transition-all"
                                        onClick={(e) => { e.stopPropagation(); }}
                                    >
                                        <Download className="w-5 h-5" /> {isDriveFolder(playingVideo.url) ? 'Abrir Link' : 'Baixar MP4'}
                                    </a>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleSendToClone(playingVideo); }}
                                        className="flex-1 flex justify-center items-center gap-2 px-5 py-3.5 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg"
                                    >
                                        <Wand2 className="w-5 h-5" /> Clonar na IA
                                    </button>
                                </div>
                            </div>
                        </div>
                        </div>

                        {/* Next Button — desktop only */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleSwipe(1); }}
                            className="hidden md:flex items-center justify-center w-14 h-14 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all shrink-0"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            )}
            {/* ── Modal: Gerenciar Categorias ──────────────────────────────────────── */}
            {isCategoryModalOpen && isAdmin && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-70">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900">
                            <div className="flex justify-between items-center p-6 pb-2">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                    <Settings className="w-5 h-5 text-yellow-500" /> Gerenciar Categorias
                                </h2>
                                <button onClick={() => { setIsCategoryModalOpen(false); setEditingCategory(null); setNewCategoryName(''); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex gap-4 px-6 pt-2 border-b border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => { setCategoryModalTab('niches'); setEditingCategory(null); setNewCategoryName(''); }}
                                    className={`py-2 px-1 border-b-2 transition-colors ${categoryModalTab === 'niches' ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    Nichos
                                </button>
                                <button
                                    onClick={() => { setCategoryModalTab('styles'); setEditingCategory(null); setNewCategoryName(''); }}
                                    className={`py-2 px-1 border-b-2 transition-colors ${categoryModalTab === 'styles' ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400 font-bold' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    Estilos de Vídeo
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Inserir/Editar nova Categoria */}
                            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    placeholder={editingCategory ? `Renomear...` : `Novo ${categoryModalTab === 'niches' ? 'nicho' : 'estilo'}...`}
                                    className="flex-1 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-yellow-500 outline-none"
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    disabled={isSavingCategory}
                                />
                                {editingCategory && (
                                    <button
                                        type="button"
                                        onClick={() => { setEditingCategory(null); setNewCategoryName(''); }}
                                        className="px-3 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={!newCategoryName.trim() || isSavingCategory}
                                    className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> {editingCategory ? 'Salvar' : 'Adicionar'}
                                </button>
                            </form>

                            {/* Lista */}
                            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2">
                                {(categoryModalTab === 'niches' ? niches : styles).length === 0 && <p className="text-gray-500 text-center py-4">Nenhum salvo ainda.</p>}
                                {(categoryModalTab === 'niches' ? niches : styles).map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => { setEditingCategory(cat); setNewCategoryName(cat.name); }}
                                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Model Video Example Player Modal ────────────────────────────────── */}
            {playingModelVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
                        <div className="p-6 flex justify-between items-center border-b border-gray-800 bg-gray-900/50">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <Video className="w-5 h-5 text-yellow-500" />
                                Exemplo: {playingModelVideo.title}
                            </h3>
                            <button
                                onClick={() => setPlayingModelVideo(null)}
                                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="aspect-9/16 bg-black relative flex items-center justify-center">
                            <video
                                src={playingModelVideo.url}
                                className="h-full w-auto max-w-full"
                                controls
                                autoPlay
                                playsInline
                            />
                        </div>
                        <div className="p-6 bg-gray-900/80">
                            <button
                                onClick={() => setPlayingModelVideo(null)}
                                className="w-full py-4 bg-white text-black font-black text-lg rounded-2xl hover:bg-gray-100 transition-all"
                            >
                                Entendi a Estrutura
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}
