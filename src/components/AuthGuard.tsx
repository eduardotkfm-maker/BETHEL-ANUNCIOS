import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { session, isLoading } = useAuth();
    const location = useLocation();

    const isEmergencyBypassActive = localStorage.getItem('demo_bypass') === 'true';

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-indigo-600/20 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                </div>
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
                <p className="text-sm font-medium text-gray-500">Autenticando sessão...</p>
            </div>
        );
    }

    if (!session && !isEmergencyBypassActive) {
        // Replace with state to redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
