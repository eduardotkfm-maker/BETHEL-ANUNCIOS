import { useState, useEffect } from 'react';
import { Lightbulb, CheckCircle2, Scissors, PlayCircle, Clock, ArrowRight, TrendingUp, Activity, FileText, Target, Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
    const { user } = useAuth();

    const [taskCounts, setTaskCounts] = useState({
        idea: 0,
        approved: 0,
        editing: 0,
        ready: 0
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recentTasks, setRecentTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Gamification state
    const [weeklyProgress, setWeeklyProgress] = useState({
        scriptsGenerated: 0,
        videosReady: 0,
        scriptGoal: 10,
        videoGoal: 5
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const { data: workflowData, error: workflowError } = await supabase
                .from('creative_production_tasks')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (!workflowError && workflowData) {
                const counts = { idea: 0, approved: 0, editing: 0, ready: 0 };
                const recent = workflowData.slice(0, 6);

                // Weekly gamification logic
                const now = new Date();
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay()); // Início no Domingo
                startOfWeek.setHours(0, 0, 0, 0);

                let scriptsThisWeek = 0;
                let videosReadyThisWeek = 0;

                workflowData.forEach(task => {
                    // Contadores Globais
                    if (task.status === 'idea') counts.idea++;
                    else if (task.status === 'script_approved') counts.approved++;
                    else if (task.status === 'editing') counts.editing++;
                    else if (task.status === 'ready') counts.ready++;

                    // Progresso da Semana
                    const taskDate = new Date(task.created_at);
                    if (taskDate >= startOfWeek) {
                        scriptsThisWeek++; // Todo item na esteira nasceu como roteiro/ideia (ou vídeo bruto)
                        if (task.status === 'ready') {
                            videosReadyThisWeek++;
                        }
                    }
                });

                setTaskCounts(counts);
                setRecentTasks(recent);
                setWeeklyProgress({
                    scriptsGenerated: scriptsThisWeek,
                    videosReady: videosReadyThisWeek,
                    scriptGoal: 10,
                    videoGoal: 5
                });
            } else {
                console.error("Erro ao carregar do dashboard", workflowError);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [user]);

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
            <div className="relative overflow-hidden rounded-3xl bg-gray-950 text-white p-6 md:p-8 border border-gray-800 shadow-2xl">
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl mix-blend-screen pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl mix-blend-screen pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">
                            Sua máquina de <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400">criativos</span>.
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
                                    <div className={`p-2.5 rounded-xl bg-linear-to-br ${metric.gradient} text-white shadow-md`}>
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
                <div className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
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
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-400 group-hover:scale-105 group-hover:text-indigo-500 transition-all">
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

                {/* Gamification Panel - Missão da Semana */}
                <div className="col-span-1 bg-linear-to-b from-gray-950 to-gray-900 rounded-3xl border border-gray-800 shadow-xl overflow-hidden relative flex flex-col">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="p-6 relative z-10 border-b border-gray-800/80">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-white flex items-center gap-2">
                                <Target className="w-5 h-5 text-orange-400" /> Meta da Semana
                            </h2>
                            <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-black bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded-full border border-orange-500/20 shadow-inner">
                                <Flame className="w-3.5 h-3.5" /> Foco Total
                            </span>
                        </div>
                    </div>

                    <div className="p-6 relative z-10 flex-1 flex flex-col justify-between space-y-6">
                        <div className="space-y-5">
                            {/* Roteiros Escritos */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-200">Roteiros Escritos</p>
                                        <p className="text-[10px] text-gray-500 font-medium">{weeklyProgress.scriptsGenerated} de {weeklyProgress.scriptGoal} roteiros</p>
                                    </div>
                                    <span className="text-sm font-black text-indigo-400">{Math.min(100, Math.round((weeklyProgress.scriptsGenerated / weeklyProgress.scriptGoal) * 100))}%</span>
                                </div>
                                <div className="w-full bg-gray-800/50 h-2.5 rounded-full overflow-hidden p-0.5 border border-gray-700/50">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 relative transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min(100, (weeklyProgress.scriptsGenerated / weeklyProgress.scriptGoal) * 100)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Vídeos Finalizados */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <p className="text-sm font-bold text-gray-200">Vídeos Finalizados</p>
                                        <p className="text-[10px] text-gray-500 font-medium">{weeklyProgress.videosReady} de {weeklyProgress.videoGoal} vídeos</p>
                                    </div>
                                    <span className="text-sm font-black text-emerald-400">{Math.min(100, Math.round((weeklyProgress.videosReady / weeklyProgress.videoGoal) * 100))}%</span>
                                </div>
                                <div className="w-full bg-gray-800/50 h-2.5 rounded-full overflow-hidden p-0.5 border border-gray-700/50">
                                    <div
                                        className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-500 relative transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.min(100, (weeklyProgress.videosReady / weeklyProgress.videoGoal) * 100)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-5 border-t border-gray-800/50">
                            <Link to="/roteiros" className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black transition-all shadow-lg hover:shadow-orange-500/25 group text-sm">
                                <span>Bater Meta: Novo Roteiro</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
