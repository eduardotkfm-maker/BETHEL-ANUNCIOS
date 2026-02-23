import { useState, useEffect } from 'react';
import { Lightbulb, CheckCircle2, Scissors, PlayCircle, Clock, ArrowRight, TrendingUp, Activity, Sparkles, Zap, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Agora pouco';
    if (diffInHours < 24) return `Há ${diffInHours} horas`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Ontem';
    return `Há ${diffInDays} dias`;
};

export default function Dashboard() {
    const [taskCounts, setTaskCounts] = useState({
        idea: 0,
        approved: 0,
        editing: 0,
        ready: 0
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recentTasks, setRecentTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const { data: workflowData, error: workflowError } = await supabase
                .from('creative_production_tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (!workflowError && workflowData) {
                const counts = { idea: 0, approved: 0, editing: 0, ready: 0 };
                const recent = workflowData.slice(0, 6);

                workflowData.forEach(task => {
                    if (task.status === 'idea') counts.idea++;
                    else if (task.status === 'script_approved') counts.approved++;
                    else if (task.status === 'editing') counts.editing++;
                    else if (task.status === 'ready') counts.ready++;
                });

                setTaskCounts(counts);
                setRecentTasks(recent);
            } else {
                console.error("Erro ao carregar do dashboard", workflowError);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const metrics = [
        {
            title: 'Novas Ideias',
            value: isLoading ? '...' : taskCounts.idea.toString(),
            subtitle: 'Aguardando aprovação',
            icon: Lightbulb,
            gradient: 'from-amber-400 to-orange-500',
            bgGlow: 'bg-orange-500/10'
        },
        {
            title: 'Aprovados p/ Gravar',
            value: isLoading ? '...' : taskCounts.approved.toString(),
            subtitle: 'Prontos para produção',
            icon: CheckCircle2,
            gradient: 'from-blue-400 to-indigo-600',
            bgGlow: 'bg-blue-500/10'
        },
        {
            title: 'Na Ilha de Edição',
            value: isLoading ? '...' : taskCounts.editing.toString(),
            subtitle: 'Vídeos sendo editados',
            icon: Scissors,
            gradient: 'from-fuchsia-500 to-purple-600',
            bgGlow: 'bg-purple-500/10'
        },
        {
            title: 'Prontos p/ Meta Ads',
            value: isLoading ? '...' : taskCounts.ready.toString(),
            subtitle: 'Criativos finalizados',
            icon: PlayCircle,
            gradient: 'from-emerald-400 to-teal-600',
            bgGlow: 'bg-emerald-500/10'
        },
    ];

    const getStatusBadge = (status: string) => {
        const styles = {
            idea: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            script_approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            editing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            ready: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        };
        const labels = {
            idea: 'Ideia',
            script_approved: 'Aprovado',
            editing: 'Editando',
            ready: 'Pronto',
        };
        const type = status as keyof typeof styles;
        return (
            <span className={`px-3 py-1 text-xs font-bold rounded-full border border-current ${styles[type] || 'bg-gray-100 text-gray-700'}`}>
                {labels[type] || status}
            </span>
        );
    };

    return (
        <div className="space-y-4 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Hero */}
            <div className="relative overflow-hidden rounded-[1.5rem] bg-gray-950 text-white p-6 md:p-8 border border-gray-800 shadow-2xl">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl mix-blend-screen pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl mix-blend-screen pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-300 tracking-widest uppercase">Bethel Pro</span>
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">
                            Sua máquina de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">criativos</span>.
                        </h1>
                        <p className="text-gray-400 max-w-xl text-sm md:text-md font-medium">
                            Visão panorâmica da sua esteira de produção. Converta ideias brutas em anúncios com Inteligência Artificial.
                        </p>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <div key={index} className="relative group bg-white dark:bg-gray-900 p-4 rounded-[1.25rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150 ${metric.bgGlow}`}></div>

                            <div className="relative z-10 flex flex-col h-full bg-transparent">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${metric.gradient} text-white shadow-md`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-gray-300 dark:text-gray-700" />
                                </div>
                                <div className="mt-auto">
                                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{metric.value}</h3>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{metric.title}</p>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-500 font-medium mt-0.5">{metric.subtitle}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Split Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activities */}
                <div className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-900 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <Activity className="w-4 h-4" />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight">Atividade Recente</h2>
                        </div>
                        <Link to="/esteira" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                            Ver Esteira <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="p-3 flex-1">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center min-h-[200px]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : recentTasks.length > 0 ? (
                            <div className="space-y-1.5">
                                {recentTasks.slice(0, 4).map((task) => (
                                    <Link to="/esteira" key={task.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-500 dark:text-gray-400 group-hover:scale-105 group-hover:text-indigo-500 transition-all">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{task.title}</h4>
                                                <div className="flex items-center gap-1 mt-0.5 text-[10px] font-medium text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {formatRelativeTime(task.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center ml-2">
                                            {getStatusBadge(task.status)}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[200px]">
                                <Lightbulb className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-700" />
                                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">Nenhum criativo na esteira.</p>
                                <p className="text-xs mt-1">Gere seu primeiro roteiro.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Automation Status Panel */}
                <div className="col-span-1 bg-gradient-to-b from-gray-950 to-gray-900 rounded-[1.5rem] border border-gray-800 shadow-xl overflow-hidden relative flex flex-col">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="p-6 relative z-10 border-b border-gray-800/80">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-white flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-400" /> System Status
                            </h2>
                            <span className="flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                        </div>
                    </div>

                    <div className="p-6 relative z-10 flex-1 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl backdrop-blur-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-400">Google Gemini API</span>
                                    <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase bg-emerald-400/10 px-2 py-0.5 rounded">Online</span>
                                </div>
                                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full w-full"></div>
                                </div>
                            </div>

                            <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl backdrop-blur-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-400">Supabase DB</span>
                                    <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase bg-emerald-400/10 px-2 py-0.5 rounded">Online</span>
                                </div>
                                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full w-full"></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-5 border-t border-gray-800/50">
                            <Link to="/roteiros" className="flex items-center justify-between p-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black transition-all shadow-lg hover:shadow-indigo-500/25 group text-sm">
                                <span>Novo Roteiro Especialista</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
