import { Play, Eye, MousePointerClick, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdCardProps {
    title: string;
    niche: string;
    icon: React.ElementType;
    bgGradient?: string;
    ctr: string;
    roas: string;
    views: string;
    promptInstruction?: string;
}

export function AdCard({ title, niche, icon: Icon, bgGradient = 'from-indigo-600 to-purple-600', ctr, roas, views, promptInstruction }: AdCardProps) {
    const navigate = useNavigate();

    const handleUseTemplate = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (promptInstruction) {
            navigate('/roteiros', {
                state: {
                    templateInstruction: promptInstruction,
                    templateName: title
                }
            });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer flex flex-col h-full">
            <div className={`relative aspect-video flex items-center justify-center bg-gradient-to-br ${bgGradient}`}>
                <Icon className="w-16 h-16 text-white/50 group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full mt-2">
                        <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                </div>
                <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg border border-white/10">
                    {niche}
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-4 line-clamp-1">{title}</h3>

                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1 flex justify-center"><MousePointerClick className="w-3 h-3" /></p>
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{ctr}</p>
                        <p className="text-[10px] text-gray-400">CTR</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1 flex justify-center"><TrendingUp className="w-3 h-3" /></p>
                        <p className="font-bold text-green-600 text-sm">{roas}</p>
                        <p className="text-[10px] text-gray-400">ROAS</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1 flex justify-center"><Eye className="w-3 h-3" /></p>
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{views}</p>
                        <p className="text-[10px] text-gray-400">Views</p>
                    </div>
                </div>

                {promptInstruction && (
                    <div className="mt-auto pt-2">
                        <button
                            onClick={handleUseTemplate}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-semibold rounded-xl transition-colors"
                        >
                            <Sparkles className="w-4 h-4" /> Usar Formula c/ IA
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
