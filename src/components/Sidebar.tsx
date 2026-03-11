import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Library, BarChart2, Star, Kanban, Box, ChevronLeft, ChevronRight, X, Settings, Flame } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';

const navItems = [
    { name: 'Visão Geral', path: '/', icon: LayoutDashboard },
    { name: 'Meus Produtos', path: '/produtos', icon: Box },
    { name: 'Gerador de Roteiros', path: '/roteiros', icon: FileText },
    { name: 'Biblioteca de Anúncios', path: '/biblioteca', icon: Library },
    { name: 'Analisador de Anúncios', path: '/analisador', icon: BarChart2 },
    { name: 'Biblioteca de Ouro', path: '/biblioteca-ouro', icon: Star },
    { name: 'Esteira de Produção', path: '/esteira', icon: Kanban },
];

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (v: boolean) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (v: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
    const { profile } = useAuth();
    const { levelInfo, streak, xp } = useGamification();

    return (
        <aside className={`bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 h-screen flex flex-col fixed top-0 z-40 transition-all duration-300
            ${isCollapsed ? 'w-20' : 'w-64'}
            left-0 border-r lg:translate-x-0
            ${isMobileOpen ? 'max-lg:left-auto max-lg:right-0 max-lg:border-r-0 max-lg:border-l max-lg:translate-x-0 max-lg:shadow-2xl' : 'max-lg:left-auto max-lg:right-0 max-lg:translate-x-full'}
        `}>
            <div className={`p-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3 relative`}>
                <div className={`w-full flex items-center justify-center overflow-hidden transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'} min-h-16`}>
                    <img
                        src={isCollapsed ? "/logo_icon.png" : "/logo_full.png"}
                        className={`transition-all duration-300 object-contain drop-shadow-xl dark:brightness-110
                            ${isCollapsed ? 'w-12 h-12 rounded-xl' : 'w-full h-12 md:h-14'}
                        `}
                        alt="Bethel Logo"
                    />
                </div>

                {/* Desktop Collapse Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex absolute -right-3 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 z-50 shadow-sm transition-transform hover:scale-110"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Mobile Close Button */}
                <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 absolute left-4">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto min-h-0 custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 ${isCollapsed ? 'px-0 justify-center' : 'px-4'} py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                            }`
                        }
                        title={isCollapsed ? item.name : undefined}
                        onClick={() => setIsMobileOpen(false)} // mobile fecha em clique
                    >
                        <item.icon className={`w-5 h-5 transition-colors shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 pb-safe">
                <Link to="/config" className="block" onClick={() => setIsMobileOpen(false)}>
                    <div className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group`}>
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="User Avatar" className="w-8 h-8 rounded-full shadow-sm shrink-0 border border-gray-200 dark:border-gray-700 object-cover" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-cyan-500 shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-indigo-500/20">
                                {profile?.first_name ? profile.first_name.charAt(0).toUpperCase() : 'B'}
                            </div>
                        )}
                        {!isCollapsed && (
                            <div className="flex flex-col overflow-hidden w-full gap-1">
                                <div className="flex justify-between items-center w-full">
                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Usuário'}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        {streak.currentStreak > 0 && (
                                            <span className="flex items-center gap-0.5 text-orange-500 text-xs font-bold">
                                                <Flame className="w-3.5 h-3.5" />
                                                {streak.currentStreak}
                                            </span>
                                        )}
                                        <Settings className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <span className="text-[11px] text-purple-600 dark:text-purple-400 truncate font-semibold">
                                    Nv.{levelInfo.level} · {levelInfo.title}
                                </span>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className="h-1.5 rounded-full bg-linear-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                                        style={{ width: `${levelInfo.progressPercent}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">{xp} / {levelInfo.xpForNext} XP</span>
                            </div>
                        )}
                    </div>
                </Link>
            </div>
        </aside>
    );
}
