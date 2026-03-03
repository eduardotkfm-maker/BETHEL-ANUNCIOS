import { useState, useRef, useEffect } from 'react';
import { Play, Video, Trash2 } from 'lucide-react';

interface Creative {
    id: string;
    title: string;
    niche: string;
    format: string;
    style: string;
    url: string;
    thumbnail_url?: string;
}

interface VideoCardProps {
    creative: Creative;
    isAdmin: boolean;
    onDelete: (id: string, url: string, thumbUrl?: string) => void;
    onPlay: (creative: Creative) => void;
}

export function VideoCard({ creative, isAdmin, onDelete, onPlay }: VideoCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            if (isHovered) {
                videoRef.current.play().catch(() => { });
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
    }, [isHovered]);

    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col h-full min-h-[300px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header Tags */}
            <div className="p-4 pb-2 z-10 flex justify-between bg-white dark:bg-gray-800">
                <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 text-[10px] font-bold uppercase rounded-md tracking-wider">
                    {creative.niche} • {creative.format}
                </span>
                {isAdmin && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(creative.id, creative.url, creative.thumbnail_url); }}
                        className="p-1.5 md:opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Thumbnail / Hover Video */}
            <div
                className="relative aspect-9/16 w-full cursor-pointer bg-gray-100 dark:bg-gray-900 group/thumb overflow-hidden"
                onClick={() => onPlay(creative)}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                </div>

                {/* Video Preview Layer */}
                {!creative.url.includes('drive.google.com') && !creative.url.includes('youtube') && !creative.url.includes('vimeo') && (
                    <video
                        ref={videoRef}
                        src={creative.url}
                        muted
                        loop
                        playsInline
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-15 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    />
                )}

                {creative.thumbnail_url && (
                    <img
                        src={creative.thumbnail_url}
                        alt="Thumbnail"
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-10 ${isHovered && !creative.url.includes('drive') ? 'opacity-0' : 'opacity-100'}`}
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
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 mt-auto">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-1 text-sm" title={creative.title}>
                    {creative.title}
                </h3>
            </div>
        </div>
    );
}
