import { useToast } from '../contexts/ToastContext';
import { X } from 'lucide-react';

const typeStyles = {
    achievement: { label: 'Conquista Desbloqueada!', color: 'text-amber-400' },
    levelup: { label: 'Level Up!', color: 'text-purple-400' },
    streak: { label: 'Streak!', color: 'text-orange-400' },
    info: { label: 'Info', color: 'text-blue-400' },
};

export function ToastContainer() {
    const { toasts, dismissToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => {
                const style = typeStyles[toast.type];
                return (
                    <div
                        key={toast.id}
                        className="pointer-events-auto flex items-start gap-3 p-4 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl shadow-black/50 min-w-[320px] max-w-[380px] animate-in slide-in-from-right-4 fade-in duration-300"
                    >
                        {toast.icon && <span className="text-2xl shrink-0">{toast.icon}</span>}
                        <div className="flex-1 min-w-0">
                            <p className={`text-[10px] font-black uppercase tracking-wider ${style.color} mb-0.5`}>
                                {style.label}
                            </p>
                            <p className="text-sm font-bold text-white truncate">{toast.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => dismissToast(toast.id)}
                            className="shrink-0 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
