import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface Toast {
    id: string;
    type: 'achievement' | 'levelup' | 'streak' | 'info';
    title: string;
    message: string;
    icon?: string;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (toast: Omit<Toast, 'id'>) => void;
    dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = crypto.randomUUID();
        setToasts(prev => {
            const next = [...prev, { ...toast, id }];
            return next.slice(-3); // max 3 visible
        });
        setTimeout(() => dismissToast(id), 4000);
    }, [dismissToast]);

    return (
        <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
            {children}
        </ToastContext.Provider>
    );
}
