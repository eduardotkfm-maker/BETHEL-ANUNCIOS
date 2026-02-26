import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Box, X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Product {
    id: string;
    name: string;
    description: string;
    price: string;
    deliverables: string;
    pain_solved: string;
    niche: string;
    product_type: string;
}

export default function Products() {
    const { user } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);

    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        description: '',
        price: '',
        deliverables: '',
        pain_solved: '',
        niche: '',
        product_type: 'Infoproduto'
    });

    const fetchProducts = async () => {
        if (!user) return;
        setIsLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setProducts(data);
        } else {
            console.error("Erro ao carregar os produtos:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (user) fetchProducts();
    }, [user]);

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                deliverables: '',
                pain_solved: '',
                niche: '',
                product_type: 'Infoproduto'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (editingProduct) {
            const { error } = await supabase
                .from('products')
                .update(formData)
                .eq('id', editingProduct.id);

            if (!error) {
                fetchProducts();
                setIsModalOpen(false);
            } else {
                alert("Erro ao editar o Produto.");
            }
        } else {
            const { error } = await supabase
                .from('products')
                .insert([{ ...formData, user_id: user.id }]);

            if (!error) {
                fetchProducts();
                setIsModalOpen(false);
            } else {
                console.error("Insert error:", error);
                alert("Erro ao criar o Produto Novo: " + error.message);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esse produto da base de conhecimento da IA?')) {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (!error) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert("Erro ao excluir o Produto.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-gray-100">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Box className="w-6 h-6" />
                        </div>
                        Meus Produtos
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        A base de conhecimento da sua Agência. A Inteligência Artificial virá aqui "estudar" seu produto antes de criar qualquer roteiro.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm"
                >
                    <Plus className="w-5 h-5" /> Novo Produto
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product: any) => (
                        <div key={product.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg mb-2 inline-block">
                                        {product.product_type}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{product.name}</h3>
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{product.niche}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleOpenModal(product)} className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-500 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3 mb-4 text-sm text-gray-600 dark:text-gray-400">
                                <div><strong className="text-gray-900 dark:text-gray-300">Preço:</strong> {product.price || 'Não informado'}</div>
                                <div><strong className="text-gray-900 dark:text-gray-300">Dor:</strong> <span className="line-clamp-2">{product.pain_solved}</span></div>
                                <div><strong className="text-gray-900 dark:text-gray-300">Entrega:</strong> <span className="line-clamp-2">{product.deliverables}</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    Nenhum produto de treinamento encontrado. Crie o seu primeiro para calibrar a Inteligência Artificial!
                </div>
            )}

            {/* Modal CRUD */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                {editingProduct ? <Edit2 className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5 text-indigo-600" />}
                                {editingProduct ? 'Editar Produto' : 'Novo Produto de Base'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Produto</label>
                                    <input required type="text" className="w-full p-3.5 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-950 outline-none transition-all text-sm font-medium text-gray-900 dark:text-gray-200"
                                        value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                                    <select required className="w-full p-3.5 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-950 outline-none transition-all text-sm font-medium text-gray-900 dark:text-gray-200"
                                        value={formData.product_type} onChange={e => setFormData({ ...formData, product_type: e.target.value })}>
                                        <option value="Infoproduto">Infoproduto</option>
                                        <option value="Serviço Físico">Serviço Físico</option>
                                        <option value="Mentoria">Mentoria</option>
                                        <option value="E-Commerce / Produto Físico">E-Commerce / Produto Físico</option>
                                        <option value="SaaS / App">SaaS / App</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nicho</label>
                                    <input required type="text" placeholder="Ex: Marketing Digital, Nutrição" className="w-full p-3.5 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-950 outline-none transition-all text-sm font-medium text-gray-900 dark:text-gray-200"
                                        value={formData.niche || ''} onChange={e => setFormData({ ...formData, niche: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço ou Valor</label>
                                    <input type="text" placeholder="Ex: R$ 497,00" className="w-full p-3.5 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-950 outline-none transition-all text-sm font-medium text-gray-900 dark:text-gray-200"
                                        value={formData.price || ''} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resumo Curto do Produto</label>
                                <textarea className="w-full p-3.5 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-950 outline-none transition-all text-sm font-medium text-gray-900 dark:text-gray-200 resize-none h-20"
                                    placeholder="O que é o produto de forma rápida?"
                                    value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">O Que Entrega? (Deliverables)</label>
                                    <textarea required className="w-full p-3.5 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-950 outline-none transition-all text-sm font-medium text-gray-900 dark:text-gray-200 resize-none h-24"
                                        placeholder="Ex: 5 módulos, acesso vip de 1 ano, acompanhamento tático..."
                                        value={formData.deliverables || ''} onChange={e => setFormData({ ...formData, deliverables: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dor que Resolve (Pain)</label>
                                    <textarea required className="w-full p-3.5 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-950 outline-none transition-all text-sm font-medium text-gray-900 dark:text-gray-200 resize-none h-24"
                                        placeholder="Ex: Pessoas que não sabem fazer escala nos anúncios de face..."
                                        value={formData.pain_solved || ''} onChange={e => setFormData({ ...formData, pain_solved: e.target.value })} />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-800">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center gap-2">
                                    <Save className="w-4 h-4" /> {editingProduct ? 'Salvar Edição' : 'Treinar Produto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
