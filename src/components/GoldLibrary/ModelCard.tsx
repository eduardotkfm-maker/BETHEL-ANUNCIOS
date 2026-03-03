import { Play, Wand2, UploadCloud } from 'lucide-react';
import { AdCard } from '../AdCard';

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
    const handleCopyPrompt = () => {
        const promptText = `Atue como um Copywriter. Objetivo: Gerar roteiro para ${model.title}.\n\nESTRUTURA:\n${model.prompt_instruction}`;
        navigator.clipboard.writeText(promptText);
        alert('Prompt da Fórmula copiado para o ClipBoard! Use no seu ChatGPT ou Claude.');
    };

    return (
        <AdCard
            title={model.title}
            niche={model.niche}
            icon={model.icon_name}
            bgGradient={model.bg_gradient}
            ctr={model.ctr}
            roas={model.roas}
            views={model.views}
            promptInstruction={model.prompt_instruction}
            videoUrl={model.example_video_url}
            thumbnailUrl={model.example_thumbnail_url}
        >
            <div className="p-6 pt-0 mt-auto flex flex-col gap-3">
                <div className="flex gap-2">
                    {model.example_video_url ? (
                        <button
                            onClick={() => onPlayExample(model.title, model.example_video_url!)}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            <Play className="w-3.5 h-3.5" /> Ver Exemplo
                        </button>
                    ) : isAdmin && (
                        <label className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-400 font-bold text-xs rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer">
                            {isUploading ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                            ) : (
                                <>
                                    <UploadCloud className="w-3.5 h-3.5" /> Subir Exemplo
                                </>
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
                    <button
                        onClick={handleCopyPrompt}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all border border-indigo-100 dark:border-indigo-800"
                    >
                        <Wand2 className="w-3.5 h-3.5" /> Copiar Prompt
                    </button>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center italic">
                    * Esta fórmula gera automaticamente ganchos de alta retenção.
                </p>
            </div>
        </AdCard>
    );
}
