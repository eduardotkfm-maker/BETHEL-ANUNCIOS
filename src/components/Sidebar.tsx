import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Zap, Library, BarChart2, Video } from 'lucide-react';

const navItems = [
    { name: 'Visão Geral', path: '/', icon: LayoutDashboard },
    { name: 'Gerador de Roteiros', path: '/roteiros', icon: FileText },
    { name: 'Modelos de Alta Conversão', path: '/modelos', icon: Zap },
    { name: 'Biblioteca de Anúncios', path: '/biblioteca', icon: Library },
    { name: 'Analisador de Anúncios', path: '/analisador', icon: BarChart2 },
];

export function Sidebar() {
    return (
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen flex flex-col fixed left-0 top-0 z-10 transition-colors">
            <div className="p-6 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                    <Video className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Bethel Anúncios
                </span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 transition-colors" />
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Usuário</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">Premium Plan</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
