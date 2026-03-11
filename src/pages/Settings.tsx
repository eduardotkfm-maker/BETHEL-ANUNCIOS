import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { traduzirErro } from '../lib/translateError';
import { Camera, Save, LogOut, Loader2, Key, User, ShieldCheck, Mail, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UsageLog {
    id: string;
    created_at: string;
    provider: string;
    model: string;
    feature: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    estimated_cost_usd: number;
}

export default function Settings() {
    const { user, profile, updateProfile, signOut, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'costs'>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Security State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Costs State (admin only)
    const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
    const [costsLoading, setCostsLoading] = useState(false);
    const [costsPeriod, setCostsPeriod] = useState<'today' | '7d' | '30d'>('30d');

    useEffect(() => {
        if (isAdmin && activeTab === 'costs') {
            const fetchCosts = async () => {
                setCostsLoading(true);
                const now = new Date();
                let since: Date;
                if (costsPeriod === 'today') {
                    since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                } else if (costsPeriod === '7d') {
                    since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                } else {
                    since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                }
                const { data } = await supabase
                    .from('ai_usage_logs')
                    .select('*')
                    .gte('created_at', since.toISOString())
                    .order('created_at', { ascending: false });
                setUsageLogs(data || []);
                setCostsLoading(false);
            };
            fetchCosts();
        }
    }, [isAdmin, activeTab, costsPeriod]);

    useEffect(() => {
        if (profile) {
            setFirstName(profile.first_name || '');
            setLastName(profile.last_name || '');
            setAvatarUrl(profile.avatar_url);
        }
    }, [profile]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setIsLoading(true);
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            const file = event.target.files[0];

            // --- LÓGICA MODO DEMO ---
            if (user?.id === '00000000-0000-0000-0000-000000000000') {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64String = reader.result as string;
                    setAvatarUrl(base64String);
                    await updateProfile({ avatar_url: base64String });
                    showMessage('success', 'Foto de perfil atualizada (Modo Demo)!');
                };
                reader.readAsDataURL(file);
                return;
            }
            // ------------------------

            const fileExt = file.name.split('.').pop();
            const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload directly to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);

            // Auto Update Profile via centralized function
            await updateProfile({ avatar_url: publicUrl });

            showMessage('success', 'Foto de perfil atualizada com sucesso!');
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Error uploading avatar:', error);
            showMessage('error', traduzirErro(error, 'Erro ao fazer upload da imagem.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            await updateProfile({
                first_name: firstName,
                last_name: lastName
            });
            showMessage('success', 'Perfil salvo com sucesso!');
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Update profile error:', error);
            showMessage('error', traduzirErro(error, 'Erro ao salvar perfil.'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showMessage('error', 'As novas senhas não coincidem.');
            return;
        }

        if (newPassword.length < 6) {
            showMessage('error', 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        try {
            setIsSaving(true);

            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setNewPassword('');
            setConfirmPassword('');
            showMessage('success', 'Senha atualizada com segurança!');

        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Update password error:', error);
            showMessage('error', traduzirErro(error, 'Erro ao atualizar a senha.'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Configurações</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gerencie sua conta e preferências do sistema.</p>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                >
                    <LogOut className="w-4 h-4" /> Sair da Conta
                </button>
            </div>

            {/* Nav Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'profile' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <User className="w-4 h-4" /> Informações do Perfil
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'security' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                >
                    <Key className="w-4 h-4" /> Segurança (Senha)
                </button>
                {isAdmin && (
                    <button
                        onClick={() => setActiveTab('costs')}
                        className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'costs' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        <DollarSign className="w-4 h-4" /> Custos IA
                    </button>
                )}
                <div
                    className={`items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 border-transparent text-gray-500 cursor-not-allowed hidden md:flex`}
                >
                    <ShieldCheck className="w-4 h-4" /> Plano Premium (Ativo)
                </div>
            </div>

            {/* Alert Message */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 font-medium text-sm animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <p>{message.text}</p>
                </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                {activeTab === 'profile' && (
                    <div className="p-6 md:p-8 animate-in fade-in">
                        <div className="flex flex-col md:flex-row gap-8 items-start">

                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-4 shrink-0">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-xl relative">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-linear-to-tr from-indigo-500 to-cyan-500 text-white text-4xl font-black">
                                                {firstName ? firstName.charAt(0).toUpperCase() : 'B'}
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer font-bold text-xs"
                                        >
                                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Camera className="w-6 h-6 mb-1" /> Mudar Foto</>}
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleAvatarUpload}
                                        disabled={isLoading}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 font-medium text-center w-32">JPG, GIF ou PNG. Max 2MB.</p>
                            </div>

                            {/* Form Section */}
                            <form onSubmit={handleUpdateProfile} className="flex-1 space-y-6 w-full">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Seu E-mail (Somente Leitura)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            disabled
                                            value={user?.email || ''}
                                            className="block w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-500 shadow-sm sm:text-sm py-3 pl-11 pr-4 cursor-not-allowed font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">Primeiro Nome</label>
                                        <input
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 font-medium transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">Sobrenome</label>
                                        <input
                                            type="text"
                                            required
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 font-medium transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="inline-flex items-center gap-2 justify-center py-2.5 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Salvar Perfil
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="p-6 md:p-8 animate-in fade-in">
                        <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-xl">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">Nova Senha</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 font-medium transition-colors"
                                    placeholder="Min. 6 caracteres"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest mb-2">Confirme a Nova Senha</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="block w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 font-medium transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-start">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 justify-center py-2.5 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-gray-900 hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                                    Atualizar Senha
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {activeTab === 'costs' && isAdmin && (
                    <div className="p-6 md:p-8 animate-in fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-emerald-500" /> Custos dos Agentes IA
                            </h3>
                            <div className="flex gap-2">
                                {(['today', '7d', '30d'] as const).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setCostsPeriod(p)}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${costsPeriod === p ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                    >
                                        {p === 'today' ? 'Hoje' : p === '7d' ? '7 dias' : '30 dias'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {costsLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                            </div>
                        ) : (
                            <>
                                {/* Summary Cards */}
                                {(() => {
                                    const totalCost = usageLogs.reduce((sum, l) => sum + (l.estimated_cost_usd || 0), 0);
                                    const totalTokens = usageLogs.reduce((sum, l) => sum + (l.total_tokens || 0), 0);
                                    const openaiLogs = usageLogs.filter(l => l.provider === 'openai');
                                    const geminiLogs = usageLogs.filter(l => l.provider === 'gemini');
                                    const openaiCost = openaiLogs.reduce((sum, l) => sum + (l.estimated_cost_usd || 0), 0);
                                    const geminiCost = geminiLogs.reduce((sum, l) => sum + (l.estimated_cost_usd || 0), 0);

                                    const featureMap: Record<string, { label: string; count: number; cost: number }> = {};
                                    usageLogs.forEach(l => {
                                        const key = l.feature || 'unknown';
                                        if (!featureMap[key]) featureMap[key] = { label: key, count: 0, cost: 0 };
                                        featureMap[key].count++;
                                        featureMap[key].cost += l.estimated_cost_usd || 0;
                                    });

                                    const featureLabels: Record<string, string> = {
                                        script_generator: 'Gerador de Roteiros',
                                        ad_analyzer: 'Analisador de Anúncios',
                                        video_clone: 'Clonagem de Vídeo',
                                        unknown: 'Outros',
                                    };

                                    return (
                                        <>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-center">
                                                    <div className="text-2xl font-black text-gray-900 dark:text-white">${totalCost.toFixed(4)}</div>
                                                    <div className="text-xs font-bold text-gray-500 uppercase mt-1">Custo Total</div>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-center">
                                                    <div className="text-2xl font-black text-gray-900 dark:text-white">{usageLogs.length}</div>
                                                    <div className="text-xs font-bold text-gray-500 uppercase mt-1">Chamadas</div>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-center">
                                                    <div className="text-2xl font-black text-emerald-600">${openaiCost.toFixed(4)}</div>
                                                    <div className="text-xs font-bold text-gray-500 uppercase mt-1">OpenAI ({openaiLogs.length})</div>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-center">
                                                    <div className="text-2xl font-black text-blue-600">${geminiCost.toFixed(4)}</div>
                                                    <div className="text-xs font-bold text-gray-500 uppercase mt-1">Gemini ({geminiLogs.length})</div>
                                                </div>
                                            </div>

                                            {/* Per Feature Breakdown */}
                                            <div className="mb-6">
                                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Por Funcionalidade</h4>
                                                <div className="space-y-2">
                                                    {Object.entries(featureMap).map(([key, val]) => (
                                                        <div key={key} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{featureLabels[key] || key}</span>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-xs text-gray-500">{val.count} chamadas</span>
                                                                <span className="text-sm font-bold text-gray-900 dark:text-white">${val.cost.toFixed(4)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Tokens Summary */}
                                            <div className="text-center text-xs text-gray-400 font-medium">
                                                Total de tokens consumidos: {totalTokens.toLocaleString('pt-BR')}
                                            </div>

                                            {/* Recent Logs Table */}
                                            {usageLogs.length > 0 && (
                                                <div className="mt-6">
                                                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Histórico Recente</h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                                                    <th className="text-left py-2 px-2 font-bold text-gray-500 uppercase">Data</th>
                                                                    <th className="text-left py-2 px-2 font-bold text-gray-500 uppercase">Provedor</th>
                                                                    <th className="text-left py-2 px-2 font-bold text-gray-500 uppercase">Feature</th>
                                                                    <th className="text-right py-2 px-2 font-bold text-gray-500 uppercase">Tokens</th>
                                                                    <th className="text-right py-2 px-2 font-bold text-gray-500 uppercase">Custo</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {usageLogs.slice(0, 50).map(log => (
                                                                    <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800">
                                                                        <td className="py-2 px-2 text-gray-600 dark:text-gray-400">
                                                                            {new Date(log.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                                        </td>
                                                                        <td className="py-2 px-2">
                                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.provider === 'openai' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                                                                                {log.provider}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-2 px-2 text-gray-700 dark:text-gray-300 font-medium">{featureLabels[log.feature] || log.feature}</td>
                                                                        <td className="py-2 px-2 text-right text-gray-600 dark:text-gray-400">{(log.total_tokens || 0).toLocaleString('pt-BR')}</td>
                                                                        <td className="py-2 px-2 text-right font-bold text-gray-900 dark:text-white">${(log.estimated_cost_usd || 0).toFixed(4)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {usageLogs.length === 0 && (
                                                <div className="text-center py-12 text-gray-400">
                                                    <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                                    <p className="font-medium">Nenhum registro de uso neste período.</p>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
