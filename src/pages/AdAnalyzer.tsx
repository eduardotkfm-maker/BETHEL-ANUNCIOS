import { useState } from 'react';
import { Upload, Link, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { analyzeAd } from '../lib/agents/adAnalyzerAgent';

export default function AdAnalyzer() {
    const [url, setUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const response = await analyzeAd({ url });
            setResult(response);
        } catch (error) {
            console.error('Falha ao analisar o anúncio:', error);
            // Idealmente você adicionaria um toast de erro aqui para o usuário
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analisador de Anúncios com IA</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Receba feedback instantâneo e sugestões para melhorar seus criativos.</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Cole o link do seu anúncio (YouTube, Instagram...)"
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={!url || isAnalyzing}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                    >
                        {isAnalyzing ? 'Analisando...' : 'Analisar'}
                    </button>
                </div>

                <div className="mt-6 flex items-center justify-center border-t border-gray-100 dark:border-gray-800 pt-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        ou faça upload do arquivo
                        <button className="text-blue-600 hover:underline font-medium flex items-center gap-1">
                            <Upload className="w-4 h-4" /> Clique aqui
                        </button>
                    </p>
                </div>
            </div>

            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-6">
                    <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-blue-100 dark:border-blue-900 mb-4 bg-white dark:bg-gray-800">
                                <span className="text-4xl font-bold text-blue-600">{result.score}</span>
                            </div>
                            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Nota do Anúncio</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border-l-4 border-green-500 shadow-sm">
                            <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-4">
                                <CheckCircle className="w-5 h-5" /> Pontos Fortes
                            </h3>
                            <ul className="space-y-2">
                                {result.strengths.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border-l-4 border-red-500 shadow-sm">
                            <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-4">
                                <XCircle className="w-5 h-5" /> Pontos Fracos
                            </h3>
                            <ul className="space-y-2">
                                {result.weaknesses.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
                        <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5" /> Sugestões de Melhoria
                        </h3>
                        <ul className="space-y-3">
                            {result.suggestions.map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-blue-900 dark:text-blue-200">
                                    <span className="font-bold bg-blue-200 dark:bg-blue-800 w-6 h-6 flex items-center justify-center rounded-full text-xs flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
