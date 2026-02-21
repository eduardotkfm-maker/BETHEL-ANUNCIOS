import { Filter, Search } from 'lucide-react';
import { AdCard } from '../components/AdCard';

export default function ConversionModels() {
    const models = [
        {
            title: 'UGC Nativo Skincare',
            niche: 'Beleza',
            thumbnailUrl: 'https://images.unsplash.com/photo-1556228720-19173870868f?auto=format&fit=crop&q=80',
            ctr: '4.2%',
            roas: '5.8x',
            views: '1.2M',
        },
        {
            title: 'VSL Financeiro Curto',
            niche: 'Finanças',
            thumbnailUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80',
            ctr: '3.1%',
            roas: '4.2x',
            views: '850K',
        },
        {
            title: 'Unboxing Tech Gadget',
            niche: 'Eletrônicos',
            thumbnailUrl: 'https://images.unsplash.com/photo-1593344484962-7960fa285c08?auto=format&fit=crop&q=80',
            ctr: '5.5%',
            roas: '7.1x',
            views: '2.4M',
        },
        {
            title: 'Depoimento Emocional',
            niche: 'Saúde',
            thumbnailUrl: 'https://images.unsplash.com/photo-1576091160550-217358c7db81?auto=format&fit=crop&q=80',
            ctr: '2.8%',
            roas: '3.5x',
            views: '500K',
        },
        {
            title: 'Comparativo Antes/Depois',
            niche: 'Fitness',
            thumbnailUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80',
            ctr: '4.8%',
            roas: '6.2x',
            views: '1.8M',
        },
        {
            title: 'Tutorial Rápido App',
            niche: 'SaaS',
            thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80',
            ctr: '3.5%',
            roas: '4.5x',
            views: '920K',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Modelos Vencedores</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Base de dados da Bethel Anúncios com os criativos que mais convertem.</p>
                </div>

                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar modelos..."
                            className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Filter className="w-4 h-4" /> Filtros
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {models.map((model, index) => (
                    <AdCard key={index} {...model} />
                ))}
            </div>
        </div>
    );
}
