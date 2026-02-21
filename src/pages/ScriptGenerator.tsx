import { useState } from 'react';
import { Send, Copy, FileText, Check } from 'lucide-react';
import { generateScript } from '../lib/agents/scriptGeneratorAgent';

export default function ScriptGenerator() {
    const [formData, setFormData] = useState({
        productName: '',
        niche: '',
        pain: '',
        desire: '',
    });

    const [generatedScript, setGeneratedScript] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await generateScript({
                productName: formData.productName,
                niche: formData.niche,
                pain: formData.pain,
                desire: formData.desire,
            });
            setGeneratedScript(response.script);
        } catch (error) {
            console.error('Falha ao gerar o roteiro:', error);
            // Idealmente adicionar notificação de erro aqui
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedScript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col xl:flex-row gap-8">
            {/* Input Section */}
            <div className="flex-1 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 h-fit">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Detalhes do Produto
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Produto</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-200"
                            placeholder="Ex: Bethel Pro"
                            value={formData.productName}
                            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nicho</label>
                        <input
                            type="text"
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-200"
                            placeholder="Ex: Marketing Digital"
                            value={formData.niche}
                            onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Principal Dor (Pain Point)</label>
                        <textarea
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-200 resize-none h-24"
                            placeholder="Ex: Não conseguir vender online..."
                            value={formData.pain}
                            onChange={(e) => setFormData({ ...formData, pain: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desejo (Resultado Esperado)</label>
                        <textarea
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-200 resize-none h-24"
                            placeholder="Ex: Escalar vendas e ter liberdade..."
                            value={formData.desire}
                            onChange={(e) => setFormData({ ...formData, desire: e.target.value })}
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !formData.productName}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isGenerating || !formData.productName
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02]'
                            }`}
                    >
                        {isGenerating ? (
                            'Gerando...'
                        ) : (
                            <>
                                <Send className="w-4 h-4" /> Gerar Roteiro
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Output Section */}
            <div className="flex-1 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 min-h-[500px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Roteiro Gerado</h2>
                    {generatedScript && (
                        <button
                            onClick={copyToClipboard}
                            className="text-sm font-medium text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                    )}
                </div>

                <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-6 rounded-xl border border-gray-100 dark:border-gray-800 overflow-auto">
                    {generatedScript ? (
                        <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed">
                            {generatedScript}
                        </pre>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 opacity-50">
                            <FileText className="w-16 h-16 mb-4" />
                            <p>Preencha os detalhes e gere seu roteiro.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
