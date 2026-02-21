import { DollarSign, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';

export default function Dashboard() {
    const metrics = [
        {
            title: 'Vendas Totais',
            value: 'R$ 124.500',
            change: '12%',
            isPositive: true,
            icon: DollarSign,
            color: 'bg-green-500 text-green-600',
        },
        {
            title: 'Lucro Líquido',
            value: 'R$ 45.200',
            change: '8%',
            isPositive: true,
            icon: TrendingUp,
            color: 'bg-blue-500 text-blue-600',
        },
        {
            title: 'Novos Clientes',
            value: '1.240',
            change: '-2%',
            isPositive: false,
            icon: Users,
            color: 'bg-purple-500 text-purple-600',
        },
        {
            title: 'Taxa de Conversão',
            value: '3.2%',
            change: '5%',
            isPositive: true,
            icon: ShoppingCart,
            color: 'bg-orange-500 text-orange-600',
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Visão Geral</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Acompanhe o desempenho dos seus anúncios em tempo real.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => (
                    <MetricCard key={index} {...metric} />
                ))}
            </div>

            {/* Placeholder para gráfico ou lista recente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 h-64 flex items-center justify-center">
                    <p className="text-gray-400">Gráfico de desempenho (em breve)</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 h-64 flex items-center justify-center">
                    <p className="text-gray-400">Atividades recentes (em breve)</p>
                </div>
            </div>
        </div>
    );
}
