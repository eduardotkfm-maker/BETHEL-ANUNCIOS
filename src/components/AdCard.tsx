import { Play, Eye, MousePointerClick, TrendingUp } from 'lucide-react';

interface AdCardProps {
    title: string;
    niche: string;
    thumbnailUrl: string; // Placeholder for now
    ctr: string;
    roas: string;
    views: string;
}

export function AdCard({ title, niche, thumbnailUrl, ctr, roas, views }: AdCardProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer">
            <div className="relative aspect-video bg-gray-200 dark:bg-gray-800">
                <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                        <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                </div>
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md">
                    {niche}
                </div>
            </div>

            <div className="p-5">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-4 line-clamp-1">{title}</h3>

                <div className="grid grid-cols-3 gap-2">
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
            </div>
        </div>
    );
}
