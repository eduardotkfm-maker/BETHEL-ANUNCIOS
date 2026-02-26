import { useState, useEffect } from 'react';
import { Kanban, Clock, Trash2, Plus, X, Eye, Copy, Check } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ScriptMarkdown } from '../components/ScriptMarkdown';
import { useAuth } from '../contexts/AuthContext';

interface Task {
    id: string; // uuid from DB
    title: string;
    script?: string;
    status: string;
    client_id: string; // we'll use this column or another to map "client/niche" for the MVP since the table created in init_bethel limits us
}

export default function ProductionWorkflow() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();


    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load & Realtime Sync
    useEffect(() => {
        if (!user) return;

        const fetchTasks = async () => {
            const { data, error } = await supabase
                .from('creative_production_tasks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setTasks(data);
            } else {
                console.error("Erro ao carregar do Supabase:", error);
            }
            setIsLoading(false);
        };
        fetchTasks();

        // Subscription to Realtime Updates (Filtrado por user_id no client-side for safety or postgres filter if possible)
        const subscription = supabase
            .channel(`tasks_${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'creative_production_tasks',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setTasks((prev) => {
                            if (prev.some(t => t.id === payload.new.id)) return prev;
                            return [payload.new as Task, ...prev];
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        setTasks((prev) => prev.map(t => t.id === payload.new.id ? payload.new as Task : t));
                    } else if (payload.eventType === 'DELETE') {
                        setTasks((prev) => prev.filter(t => t.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]);

    // Handle incoming scripts from AdAnalyzer
    useEffect(() => {
        const handleIncomingScript = async () => {
            if (user && location.state && location.state.newTaskTitle) {
                const { newTaskTitle } = location.state;

                // Clear the state so it doesn't re-add on refresh
                navigate('.', { replace: true, state: {} });

                // check if title is in tasks, simple validation to prevent double run on StrictMode
                if (tasks.some(t => t.title === newTaskTitle)) return;

                const { data, error } = await supabase
                    .from('creative_production_tasks')
                    .insert([{
                        title: newTaskTitle,
                        status: 'idea',
                        user_id: user.id
                    }])
                    .select()
                    .single();

                if (!error && data) {
                    setTasks(prev => [data, ...prev]);
                }
            }
        };

        handleIncomingScript();
    }, [location.state, navigate, tasks, user]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTask, setNewTask] = useState<Partial<Task>>({ status: 'idea' });
    const [viewScriptTask, setViewScriptTask] = useState<Task | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const columns = [
        { id: 'idea', title: '💡 Ideia / Roteiro', color: 'bg-gray-100 dark:bg-gray-800' },
        { id: 'script_approved', title: '✍️ Roteiro Aprovado', color: 'bg-blue-50 dark:bg-blue-900/20' },
        { id: 'recording', title: '🎥 Em Gravação', color: 'bg-purple-50 dark:bg-purple-900/20' },
        { id: 'editing', title: '✂️ Na Edição', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
        { id: 'ready', title: '✅ Pronto p/ Campanha', color: 'bg-green-50 dark:bg-green-900/20' }
    ];

    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.setData('taskId', taskId);
        e.currentTarget.classList.add('opacity-50');
    };

    const handleDragEnd = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('opacity-50');
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessário para permitir o drop
    };

    const handleDrop = async (e: React.DragEvent, statusId: string) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        if (!taskId) return;

        // Optimistic UI update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: statusId } : t));

        // Wait, saving into DB
        const { error } = await supabase
            .from('creative_production_tasks')
            .update({ status: statusId })
            .eq('id', taskId);

        if (error) {
            console.error("Erro ao mover a task", error);
            // On error we should ideally rollback, but ignoring for MVP simplicity
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja remover esta tarefa da esteira?')) {
            const { error } = await supabase
                .from('creative_production_tasks')
                .delete()
                .eq('id', id);

            if (!error) {
                setTasks(tasks.filter(t => t.id !== id));
            } else {
                alert("Erro ao remover tarefa.");
            }
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.title) return;

        const { data, error } = await supabase
            .from('creative_production_tasks')
            .insert([{
                title: newTask.title,
                status: 'idea',
                user_id: user?.id
            }])
            .select()
            .single();

        if (!error && data) {
            // No need to setTasks here if realtime is active, but we can do it optimistically. (Handled by subscription anyway, but let's keep it safe)
            // Or better, just let the realtime event add it!
            setIsAddModalOpen(false);
            setNewTask({ status: 'idea' });
        } else {
            console.error("Erro ao inserir", error);
            alert("Erro ao adicionar: " + (error?.message || "Erro desconhecido"));
        }
    };

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-6rem)] relative">
            <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-gray-100">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                            <Kanban className="w-6 h-6" />
                        </div>
                        Esteira de Produção
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Acompanhe ou mova livremente os cards de anúncios arrastando-os pelo Kanban.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm text-sm"
                >
                    <Plus className="w-5 h-5" /> Adicionar Roteiro
                </button>
            </div>

            {isLoading ? (
                <div className="flex-1 flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto pb-4 -mx-1 px-1">
                    <div className="flex gap-3 h-full min-w-max snap-x snap-mandatory scroll-smooth">
                        {columns.map(col => (
                            <div
                                key={col.id}
                                className={`w-72 sm:w-80 rounded-2xl flex flex-col ${col.color} border border-gray-100 dark:border-gray-800 transition-colors snap-start`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, col.id)}
                            >
                                <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center bg-white/50 dark:bg-black/10 rounded-t-2xl">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{col.title}</h3>
                                    <span className="bg-white dark:bg-gray-700 text-xs font-bold px-2 py-1 rounded-full text-gray-500 shadow-sm">
                                        {tasks.filter(t => t.status === col.id).length}
                                    </span>
                                </div>
                                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                                    {tasks.filter(t => t.status === col.id).map(task => (
                                        <div
                                            key={task.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task.id)}
                                            onDragEnd={handleDragEnd}
                                            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group relative"
                                        >
                                            <button
                                                onClick={() => handleDelete(task.id)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded">
                                                    ID: {task.id.substring(0, 8)}
                                                </span>
                                            </div>
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-3 pr-6">
                                                {task.title}
                                            </h4>

                                            {task.script && (
                                                <button
                                                    onClick={() => setViewScriptTask(task)}
                                                    className="w-full mb-3 py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> Ver Roteiro da IA
                                                </button>
                                            )}

                                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <Clock className="w-3.5 h-3.5" /> Arrraste-me
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal de Adição */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                <Plus className="w-5 h-5 text-indigo-600" /> Nova Demanda
                            </h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddTask} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título do Roteiro / Ideia</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-3.5 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-950 outline-none transition-all text-sm font-medium text-gray-900 dark:text-gray-200"
                                    placeholder="Ex: Novo Anúncio de Retargeting"
                                    value={newTask.title || ''}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>
                            <div className="pt-4 flex gap-3 justify-end">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-colors">
                                    Adicionar à Ideias
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Leitura de Roteiro */}
            {viewScriptTask && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                <Eye className="w-5 h-5 text-indigo-600" /> Roteiro / Detalhes
                            </h2>
                            <button onClick={() => setViewScriptTask(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-950">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{viewScriptTask.title}</span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(viewScriptTask.script || '');
                                        setIsCopied(true);
                                        setTimeout(() => setIsCopied(false), 2000);
                                    }}
                                    className="text-xs flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    {isCopied ? 'Copiado' : 'Copiar'}
                                </button>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                <ScriptMarkdown content={viewScriptTask.script || ''} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
