import { Sparkles, Play, UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

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

interface ModelCardProps {
    model: Model;
    isAdmin: boolean;
    isUploading: boolean;
    onPlayExample: (title: string, url: string) => void;
    onUploadExample: (title: string, file: File) => void;
}

export function ModelCard({ model, isAdmin, isUploading, onPlayExample, onUploadExample }: ModelCardProps) {
    const navigate = useNavigate();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (LucideIcons as any)[model.icon_name] || LucideIcons.Zap;

    const handleUseFormula = () => {
        navigate('/roteiros', {
            state: {
                templateInstruction: model.prompt_instruction,
                templateName: model.title,
            },
        });
    };

    return (
        <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300">
            {/* Header com ícone */}
            <div className="p-5 pb-3 flex items-start gap-4">
                <div className={`shrink-0 w-11 h-11 rounded-xl bg-linear-to-br ${model.bg_gradient || 'from-indigo-500 to-purple-500'} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2">{model.title}</h3>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">{model.niche}</span>
                </div>
            </div>

            {/* Descrição curta do prompt */}
            <div className="px-5 pb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {model.prompt_instruction.slice(0, 120)}{model.prompt_instruction.length > 120 ? '...' : ''}
                </p>
            </div>

            {/* Ações */}
            <div className="px-5 pb-5 flex gap-2">
                <button
                    onClick={handleUseFormula}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all border border-indigo-100 dark:border-indigo-800"
                >
                    <Sparkles className="w-3.5 h-3.5" /> Usar com IA
                </button>
                {model.example_video_url ? (
                    <button
                        onClick={() => onPlayExample(model.title, model.example_video_url!)}
                        className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                        title="Ver exemplo"
                    >
                        <Play className="w-3.5 h-3.5" />
                    </button>
                ) : isAdmin && (
                    <label className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer" title="Subir exemplo">
                        {isUploading ? (
                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-gray-400"></div>
                        ) : (
                            <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <input
                            type="file"
                            accept="video/mp4"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onUploadExample(model.title, file);
                            }}
                        />
                    </label>
                )}
            </div>
        </div>
    );
}
