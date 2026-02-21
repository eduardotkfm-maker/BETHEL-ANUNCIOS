import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
            <Sidebar />
            <main className="ml-64 p-8 min-h-screen transition-all">
                <Outlet />
            </main>
        </div>
    );
}
