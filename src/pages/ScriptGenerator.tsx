import { useState, useEffect } from 'react';
import { Send, Copy, FileText, Check, RefreshCw, Trash2, Sparkles, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ScriptMarkdown } from '../components/ScriptMarkdown';
import { generateScript } from '../lib/agents/scriptGeneratorAgent';
import { supabase } from '../lib/supabase';

export default function ScriptGenerator() {
    const location = useLocation();
    const navigate = useNavigate();

    // Recovery of Template Instruction passed by AdCard (ConversionModels)
    const [templateInstruction, setTemplateInstruction] = useState<string | undefined>(
        location.state ? location.state.templateInstruction : undefined
    );

    const [templateName, setTemplateName] = useState<string | undefined>(
        location.state ? location.state.templateName : undefined
    );

    const removeTemplate = () => {
        setTemplateInstruction(undefined);
        setTemplateName(undefined);
        // Clear router state to prevent it from reappearing on refresh accidentally (optional UX polish)
        navigate(location.pathname, { replace: true, state: {} });
    };

    const [formData, setFormData] = useState(() => {
        try {
            const saved = localStorage.getItem('scriptGenFormData');
            return saved ? JSON.parse(saved) : {
                productName: '',
                niche: '',
                pain: '',
                desire: '',
                funnelStage: 'topo',
                creativeModel: '',
                scriptCount: 1,
            };
        } catch (e) {
            console.error("Local Storage Error:", e);
            return { productName: '', niche: '', pain: '', desire: '', funnelStage: 'topo', creativeModel: '', scriptCount: 1 };
        }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string>(() => {
        try {
            return localStorage.getItem('scriptGenProductId') || '';
        } catch {
            return '';
        }
    });

    const [generatedScript, setGeneratedScript] = useState(() => {
        try {
            return localStorage.getItem('scriptGenScript') || '';
        } catch {
            return '';
        }
    });

    useEffect(() => {
        localStorage.setItem('scriptGenFormData', JSON.stringify(formData));
    }, [formData]);

    useEffect(() => {
        localStorage.setItem('scriptGenProductId', selectedProductId);
    }, [selectedProductId]);

    useEffect(() => {
        localStorage.setItem('scriptGenScript', generatedScript);
    }, [generatedScript]);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingVariation, setIsGeneratingVariation] = useState(false);
    const [copied, setCopied] = useState(false);
    const [savedToWorkflow, setSavedToWorkflow] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase.from('products').select('*');
            if (!error && data) {
                setProducts(data);
            }
        };
        fetchProducts();
    }, []);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setSavedToWorkflow(false);
        try {
            const productContext = products.find(p => p.id === selectedProductId);

            const requestPayload = productContext ? {
                productName: productContext.name,
                niche: productContext.niche,
                pain: productContext.pain_solved,
                desire: formData.desire, // Allow override
                price: productContext.price,
                deliverables: productContext.deliverables,
                productType: productContext.product_type,
                templateInstruction,
                templateName,
                funnelStage: formData.funnelStage,
                creativeModel: formData.creativeModel,
                scriptCount: formData.scriptCount
            } : {
                productName: formData.productName,
                niche: formData.niche,
                pain: formData.pain,
                desire: formData.desire,
                templateInstruction,
                templateName,
                funnelStage: formData.funnelStage,
                creativeModel: formData.creativeModel,
                scriptCount: formData.scriptCount
            };

            const response = await generateScript(requestPayload);
            setGeneratedScript(response.script);

            // Auto-salvar no Kanban (Esteira)
            const fallbackTitle = requestPayload.productName ? `Roteiro: ${requestPayload.productName}` : 'Nova Ideia Gerada (IA)';
            const { error: dbError } = await supabase
                .from('creative_production_tasks')
                .insert([{
                    title: fallbackTitle,
                    script: response.script,
                    status: 'idea'
                }]);

            if (!dbError) {
                setSavedToWorkflow(true);
                setTimeout(() => setSavedToWorkflow(false), 5000);
            } else {
                console.error("Erro ao salvar automaticamente na Esteira:", dbError);
            }

        } catch (error) {
            console.error('Falha ao gerar o roteiro:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert("Erro ao tentar gerar Roteiro com a IA.\nDetalhes: " + ((error as any)?.message || "Verifique o console do navegador."));
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateVariation = async () => {
        setIsGeneratingVariation(true);
        setSavedToWorkflow(false);
        try {
            const productContext = products.find(p => p.id === selectedProductId);

            const requestPayload = productContext ? {
                productName: productContext.name,
                niche: productContext.niche,
                pain: productContext.pain_solved,
                desire: formData.desire,
                price: productContext.price,
                deliverables: productContext.deliverables,
                productType: productContext.product_type,
                isVariation: true,
                baseScript: generatedScript,
                templateInstruction,
                templateName
            } : {
                productName: formData.productName,
                niche: formData.niche,
                pain: formData.pain,
                desire: formData.desire,
                isVariation: true,
                baseScript: generatedScript,
                templateInstruction,
                templateName,
                funnelStage: formData.funnelStage,
                creativeModel: formData.creativeModel,
                scriptCount: formData.scriptCount
            };

            const response = await generateScript(requestPayload);
            setGeneratedScript(response.script);

            // Auto-salvar no Kanban (Esteira)
            const fallbackTitle = requestPayload.productName ? `Variação: ${requestPayload.productName}` : 'Nova Variação (IA)';
            const { error: dbError } = await supabase
                .from('creative_production_tasks')
                .insert([{
                    title: fallbackTitle,
                    script: response.script,
                    status: 'idea'
                }]);

            if (!dbError) {
                setSavedToWorkflow(true);
                setTimeout(() => setSavedToWorkflow(false), 5000);
            } else {
                console.error("Erro ao salvar automaticamente na Esteira:", dbError);
            }

        } catch (error) {
            console.error('Falha ao gerar o roteiro:', error);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert("Erro ao tentar gerar Roteiro com a IA.\nDetalhes: " + ((error as any)?.message || "Verifique o console do navegador."));
        } finally {
            setIsGeneratingVariation(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedScript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClearForm = () => {
        if (window.confirm('Limpar as configurações atuais e começar do zero?')) {
            setFormData({
                productName: '',
                niche: '',
                pain: '',
                desire: '',
                funnelStage: 'topo',
                creativeModel: '',
                scriptCount: 1
            });
            setSelectedProductId('');
            setGeneratedScript('');
            removeTemplate();
        }
    };

    return (
        <div className="flex flex-col xl:flex-row gap-6">
            {/* Input Section */}
            <div className="xl:w-[380px] xl:shrink-0 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 h-fit">

                {templateName && (
                    <div className="mb-6 p-4 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 dark:border-indigo-500/30 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
                        <button
                            onClick={removeTemplate}
                            className="absolute top-3 right-3 p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                            title="Remover fórmula especial"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="flex items-start gap-3 relative z-10 shrink-0">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg shrink-0 mt-0.5">
                                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="pr-8">
                                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Fórmula Ativa: {templateName}</p>
                                <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mt-1 leading-relaxed">
                                    O gerador ignorará a escrita padrão e redigirá seu criativo <b>estruturado cirurgicamente</b> usando a framework deste modelo vencedor da agência.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Detalhes do Produto
                    </h2>
                    <button
                        onClick={handleClearForm}
                        className="text-xs font-medium text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Limpar Tudo
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Selecione a Base do Produto (Treinamento IA)
                        </label>
                        <select
                            className="w-full p-3 rounded-xl bg-indigo-50 dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium text-indigo-900 dark:text-indigo-200"
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                        >
                            <option value="">-- Preenchimento Manual (Sem Treinamento) --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.niche})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedProductId ? (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
                            A Inteligência Artificial vai ler toda a estrutura salva na Base de Conhecimento (Dores, Preços, Entregáveis) para gerar este roteiro altamente direcionado.
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Direcionamento Extra (Opcional)</label>
                                <textarea
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium text-gray-900 dark:text-gray-200 resize-none h-20"
                                    placeholder="Ex: Focar na escassez ou na dor XYZ..."
                                    value={formData.desire}
                                    onChange={(e) => setFormData({ ...formData, desire: e.target.value })}
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Produto</label>
                                <input
                                    type="text"
                                    className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-950 outline-none transition-all text-sm font-medium text-gray-900 dark:text-gray-200"
                                    placeholder="Ex: Novo Lançamento"
                                    value={formData.productName}
                                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nicho</label>
                                <input
                                    type="text"
                                    className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-950 outline-none transition-all text-sm font-medium text-gray-900 dark:text-gray-200"
                                    placeholder="Ex: Marketing Digital"
                                    value={formData.niche}
                                    onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Principal Dor (Pain Point)</label>
                                <textarea
                                    className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-950 outline-none transition-all text-sm font-medium text-gray-900 dark:text-gray-200 resize-none h-24"
                                    placeholder="Ex: Não conseguir vender online..."
                                    value={formData.pain}
                                    onChange={(e) => setFormData({ ...formData, pain: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desejo (Resultado Esperado)</label>
                                <textarea
                                    className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-950 outline-none transition-all text-sm font-medium text-gray-900 dark:text-gray-200 resize-none h-24"
                                    placeholder="Ex: Escalar vendas e ter liberdade..."
                                    value={formData.desire}
                                    onChange={(e) => setFormData({ ...formData, desire: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estágio do Funil</label>
                            <select
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-200"
                                value={formData.funnelStage}
                                onChange={(e) => setFormData({ ...formData, funnelStage: e.target.value })}
                            >
                                <option value="topo">Topo (Atração)</option>
                                <option value="meio">Meio (Consideração)</option>
                                <option value="fundo">Fundo (Conversão)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qtd. Roteiros</label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-200"
                                value={formData.scriptCount}
                                onChange={(e) => setFormData({ ...formData, scriptCount: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo de Criativo</label>
                        <input
                            type="text"
                            className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-950 outline-none transition-all text-sm font-medium text-gray-900 dark:text-gray-200"
                            placeholder="Ex: UGC, Review, Direto ao Ponto..."
                            value={formData.creativeModel}
                            onChange={(e) => setFormData({ ...formData, creativeModel: e.target.value })}
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || (!formData.productName && !selectedProductId)}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isGenerating || (!formData.productName && !selectedProductId)
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                            : 'bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02]'
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
            <div className="flex-1 min-w-0 bg-white dark:bg-gray-900 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold">Roteiro Gerado</h2>
                        {savedToWorkflow && (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full animate-in fade-in slide-in-from-bottom-2">
                                <Check className="w-3.5 h-3.5" />
                                Enviado p/ Esteira!
                            </span>
                        )}
                    </div>
                    {generatedScript && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleGenerateVariation}
                                disabled={isGeneratingVariation}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw className={`w-4 h-4 ${isGeneratingVariation ? 'animate-spin' : ''}`} />
                                {isGeneratingVariation ? 'Variando...' : 'Criar Variação'}
                            </button>
                            <button
                                onClick={copyToClipboard}
                                className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copiado!' : 'Copiar'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 p-3 md:p-5 rounded-xl border border-gray-100 dark:border-gray-800/60 overflow-y-auto overflow-x-hidden wrap-break-word" style={{ maxHeight: 'calc(100vh - 180px)' }}>
                    {generatedScript ? (
                        <ScriptMarkdown content={generatedScript} />
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
