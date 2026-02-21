import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: LucideIcon;
    color: string;
}

export function MetricCard({ title, value, change, isPositive, icon: Icon, color }: MetricCardProps) {
    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
            </div>
            <div className="mt-4 flex items-center">
                <span
                    className={`text-sm font-medium px-2 py-1 rounded-full ${isPositive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                >
                    {isPositive ? '+' : ''}
                    {change}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-500">vs. mês anterior</span>
            </div>
        </div>
    );
}
