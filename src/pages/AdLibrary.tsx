import { useState } from 'react';
import { Search, Globe, Instagram, Facebook, MapPin, Activity, ExternalLink, Sparkles } from 'lucide-react';

export default function AdLibrary() {
    const [searchTerm, setSearchTerm] = useState('');
    const [country, setCountry] = useState('BR');
    const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [isSearching, setIsSearching] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm) return;

        setIsSearching(true);

        const baseUrl = 'https://www.facebook.com/ads/library/';
        const params = new URLSearchParams({
            active_status: status,
            ad_type: 'all',
            country: country,
            is_targeted_country: 'false',
            media_type: 'all',
            q: searchTerm
        });

        const finalUrl = `${baseUrl}?${params.toString()}&sort_data[mode]=relevancy_monthly_grouped&sort_data[direction]=desc`;

        setTimeout(() => {
            setGeneratedUrl(finalUrl);
            setIsSearching(false);
            // Auto open the tab for best UX
            window.open(finalUrl, '_blank', 'noopener,noreferrer');
        }, 500);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] relative justify-center items-center py-12">

            {/* Background Decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/5 blur-[100px] rounded-full" />
            </div>

            <div className="w-full max-w-3xl relative z-10">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">

                    <div className="flex gap-3 mb-6">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                            <Facebook className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                        </div>
                        <div className="p-3 bg-pink-50 dark:bg-pink-900/30 rounded-2xl">
                            <Instagram className="w-8 h-8 text-pink-600 dark:text-pink-500" />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                        Busca Oficial da Meta Ads
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg max-w-xl">
                        Acesse a biblioteca global do Facebook e Instagram para encontrar anúncios validados dos seus concorrentes em poucos segundos.
                    </p>

                    <form onSubmit={handleSearch} className="w-full space-y-5">
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full p-5 pl-14 pr-36 rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-medium text-gray-900 dark:text-white placeholder-gray-400"
                                    placeholder="Nome da empresa ou palavra-chave..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                                <button
                                    type="submit"
                                    disabled={!searchTerm || isSearching}
                                    className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center gap-2"
                                >
                                    {isSearching ? (
                                        <>Preparando...</>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Buscar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                            <div className="relative w-full sm:w-48">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="pl-11 pr-8 py-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-colors text-gray-700 dark:text-gray-300"
                                >
                                    <option value="BR">🇧🇷 Brasil</option>
                                    <option value="US">🇺🇸 Estados Unidos</option>
                                    <option value="PT">🇵🇹 Portugal</option>
                                    <option value="ALL">🌎 Todos os países</option>
                                </select>
                            </div>
                            <div className="relative w-full sm:w-56">
                                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as 'all' | 'active' | 'inactive')}
                                    className="pl-11 pr-8 py-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-colors text-gray-700 dark:text-gray-300"
                                >
                                    <option value="all">⚪ Todos os Status</option>
                                    <option value="active">🟢 Apenas Ativos</option>
                                    <option value="inactive">🔴 Apenas Inativos</option>
                                </select>
                            </div>
                        </div>
                    </form>

                    {generatedUrl && (
                        <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 w-full">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3 w-full overflow-hidden text-left">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex-shrink-0">
                                        <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-0.5">Link Gerado com Sucesso</p>
                                        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 truncate w-full">{generatedUrl}</p>
                                    </div>
                                </div>
                                <a
                                    href={generatedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex-shrink-0"
                                >
                                    <ExternalLink className="w-4 h-4" /> Abrir Meta Ads
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center mt-8 space-y-2 text-sm text-gray-500 dark:text-gray-500">
                    <p>Por políticas de segurança globais da Meta (X-Frame-Options),</p>
                    <p>sua pesquisa será aberta nativamente numa nova quia criptografada.</p>
                </div>
            </div>
        </div>
    );
}
