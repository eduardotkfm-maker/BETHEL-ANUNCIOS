import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Menu } from 'lucide-react';
import { useAchievementWatcher } from '../hooks/useAchievementWatcher';

export default function AppLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const location = useLocation();
    useAchievementWatcher();

    // Fechar menu mobile ao trocar de rota
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans flex flex-col lg:flex-row">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-20 flex items-center px-4 justify-between">
                <div className="flex items-center gap-2">
                    <img src="/logo_full.png" className="h-8 w-auto dark:brightness-110 object-contain" alt="Bethel Logo" />
                </div>
                <button onClick={() => setIsMobileOpen(true)} className="p-2 -mr-2 text-gray-600 dark:text-gray-300">
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            <Sidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            <main className={`flex-1 transition-all duration-300 mt-16 lg:mt-0 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'} p-4 md:p-6 lg:p-6 min-h-[calc(100vh-4rem)] lg:min-h-screen relative overflow-x-hidden`}>
                <Outlet />
            </main>

            {/* Overlay mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </div>
    );
}
