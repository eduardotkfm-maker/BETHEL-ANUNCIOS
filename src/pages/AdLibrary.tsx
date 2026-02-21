import { useState } from 'react';
import { Search, Globe, Instagram, Facebook, MapPin, Activity, ExternalLink, AlertTriangle } from 'lucide-react';

export default function AdLibrary() {
    const [searchTerm, setSearchTerm] = useState('');
    const [country, setCountry] = useState('BR');
    const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [isSearching, setIsSearching] = useState(false);
    const [iframeUrl, setIframeUrl] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm) return;

        setIsSearching(true);

        // Build the official Facebook Ads Library URL
        // https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=PT&is_targeted_country=false&media_type=all&q=test

        const baseUrl = 'https://www.facebook.com/ads/library/';
        const params = new URLSearchParams({
            active_status: status,
            ad_type: 'all',
            country: country,
            is_targeted_country: 'false',
            media_type: 'all',
            q: searchTerm
        });

        // Facebook specific sorting that breaks URLSearchParams natively if not passed as an array syntax manually:
        const finalUrl = `${baseUrl}?${params.toString()}&sort_data[mode]=relevancy_monthly_grouped&sort_data[direction]=desc`;

        // Simulating search feedback delay
        setTimeout(() => {
            setIframeUrl(finalUrl);
            setIsSearching(false);
        }, 500);
    };

    return (
        <div className="space-y-8 flex flex-col h-[calc(100vh-6rem)]">
            <div className="text-center max-w-2xl mx-auto pt-6 flex-shrink-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Busca Oficial da Meta</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                    Pesquise diretamente no banco de dados do Facebook Ads.
                </p>

                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full p-3 pl-10 pr-28 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Nome do anunciante ou palavra-chave..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <button
                            type="submit"
                            disabled={!searchTerm || isSearching}
                            className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSearching ? 'Buscando' : 'Procurar'}
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="pl-9 pr-8 py-2 w-full sm:w-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            >
                                <option value="BR">🇧🇷 Brasil</option>
                                <option value="US">🇺🇸 Estados Unidos</option>
                                <option value="PT">🇵🇹 Portugal</option>
                                <option value="ALL">🌎 Todos os países</option>
                            </select>
                        </div>
                        <div className="relative">
                            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as 'all' | 'active' | 'inactive')}
                                className="pl-9 pr-8 py-2 w-full sm:w-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            >
                                <option value="all">⚪ Todos Status</option>
                                <option value="active">🟢 Apenas Ativos</option>
                                <option value="inactive">🔴 Apenas Inativos</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>

            {iframeUrl ? (
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                    <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-1 truncate mr-4">
                            <Globe className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{iframeUrl}</span>
                        </div>
                        <a
                            href={iframeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                        >
                            <ExternalLink className="w-3.5 h-3.5" /> Abrir no Navegador
                        </a>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border-b border-yellow-100 dark:border-yellow-900/30 p-3 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-800 dark:text-yellow-400">
                            <strong>Aviso importante:</strong> O Facebook bloqueia a visualização de seu site dentro de outros sistemas (erro de iframe).
                            Se a tela abaixo ficar branca ou mostrar "Recusou a conexão", use o botão "Abrir no Navegador" logo acima!
                        </p>
                    </div>

                    <iframe
                        src={iframeUrl}
                        className="w-full h-full border-none flex-1 bg-gray-50 dark:bg-gray-950"
                        title="Facebook Ads Library Integration"
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-900/20">
                    <div className="flex gap-2 mb-4 text-gray-300 dark:text-gray-700">
                        <Facebook className="w-12 h-12" />
                        <Instagram className="w-12 h-12" />
                    </div>
                    <p className="text-gray-500 font-medium">Faça sua pesquisa acima para visualizar os anúncios</p>
                </div>
            )}
        </div>
    );
}
