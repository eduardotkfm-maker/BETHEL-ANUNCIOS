import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Library, BarChart2, Star, Kanban, Box, ChevronLeft, ChevronRight, X, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

    return (
        <aside className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col fixed left-0 top-0 z-40 transition-all duration-300
            ${isCollapsed ? 'w-20' : 'w-64'} 
            ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}>
            <div className={`p-8 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3 relative`}>
                <div className={`w-full flex items-center justify-center overflow-hidden transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'} min-h-16`}>
                    <img
                        src={isCollapsed ? "/logo_symbol.png" : "/logo_full.png"}
                        className={`transition-all duration-300 object-contain drop-shadow-xl dark:brightness-110 
                            ${isCollapsed ? 'w-10 h-10' : 'w-full h-12 md:h-14'}
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
                <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 absolute right-4">
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
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-indigo-500/20">
                                {profile?.first_name ? profile.first_name.charAt(0).toUpperCase() : 'B'}
                            </div>
                        )}
                        {!isCollapsed && (
                            <div className="flex flex-col overflow-hidden w-full">
                                <div className="flex justify-between items-center w-full">
                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Usuário'}
                                    </span>
                                    <Settings className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-xs text-indigo-600 dark:text-cyan-500 truncate font-medium">Premium Plan</span>
                            </div>
                        )}
                    </div>
                </Link>
            </div>
        </aside>
    );
}
