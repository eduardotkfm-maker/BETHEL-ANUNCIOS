// ─── Gamification Engine ─────────────────────────────────────────────────────
// Pure functions — no React, no Supabase. Fully testable.

export interface GamificationRawData {
    aiLogs: { created_at: string; feature: string }[];
    tasks: { created_at: string; status: string }[];
    products: { id: string }[];
    goldItems: { id: string }[];
}

export const XP_WEIGHTS = {
    SCRIPT_GENERATED: 100,
    VIDEO_ANALYZED: 150,
    TASK_READY: 200,
    PRODUCT_CREATED: 50,
    GOLD_ITEM: 25,
} as const;

export const LEVEL_TABLE = [
    { level: 1, title: 'Iniciante', minXp: 0 },
    { level: 2, title: 'Criador', minXp: 500 },
    { level: 3, title: 'Estrategista', minXp: 1500 },
    { level: 4, title: 'Copywriter Pro', minXp: 3000 },
    { level: 5, title: 'Mestre dos Anúncios', minXp: 6000 },
    { level: 6, title: 'Lenda do Tráfego', minXp: 12000 },
] as const;

export interface LevelInfo {
    level: number;
    title: string;
    xp: number;
    xpForNext: number | null;
    progressPercent: number;
}

export interface StreakInfo {
    currentStreak: number;
    bestStreak: number;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: 'scripts' | 'analysis' | 'pipeline' | 'streak' | 'library';
    unlocked: boolean;
    xpReward: number;
}

// ─── XP ──────────────────────────────────────────────────────────────────────

export function computeXP(data: GamificationRawData): number {
    const scripts = data.aiLogs.filter(l => l.feature === 'script_generator').length;
    const videos = data.aiLogs.filter(l =>
        l.feature === 'ad_analyzer' || l.feature === 'video_clone'
    ).length;
    const ready = data.tasks.filter(t => t.status === 'ready').length;

    return (
        scripts * XP_WEIGHTS.SCRIPT_GENERATED +
        videos * XP_WEIGHTS.VIDEO_ANALYZED +
        ready * XP_WEIGHTS.TASK_READY +
        data.products.length * XP_WEIGHTS.PRODUCT_CREATED +
        data.goldItems.length * XP_WEIGHTS.GOLD_ITEM
    );
}

// ─── Level ───────────────────────────────────────────────────────────────────

export function getLevel(xp: number): LevelInfo {
    let current: (typeof LEVEL_TABLE)[number] = LEVEL_TABLE[0];
    for (const tier of LEVEL_TABLE) {
        if (xp >= tier.minXp) current = tier;
    }

    const idx = LEVEL_TABLE.indexOf(current);
    const next = LEVEL_TABLE[idx + 1] ?? null;

    const xpInLevel = xp - current.minXp;
    const rangeSize = next ? next.minXp - current.minXp : 1;
    const progressPercent = next
        ? Math.min(100, Math.round((xpInLevel / rangeSize) * 100))
        : 100;

    return {
        level: current.level,
        title: current.title,
        xp,
        xpForNext: next ? next.minXp : null,
        progressPercent,
    };
}

// ─── Streak ──────────────────────────────────────────────────────────────────

function computeBestStreak(sortedDaysDesc: string[]): number {
    if (sortedDaysDesc.length === 0) return 0;
    let best = 1, run = 1;
    for (let i = 1; i < sortedDaysDesc.length; i++) {
        const prev = new Date(sortedDaysDesc[i - 1]);
        const curr = new Date(sortedDaysDesc[i]);
        const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
        if (diff === 1) {
            run++;
            best = Math.max(best, run);
        } else {
            run = 1;
        }
    }
    return best;
}

export function computeStreak(aiLogs: { created_at: string }[]): StreakInfo {
    if (aiLogs.length === 0) return { currentStreak: 0, bestStreak: 0 };

    const days = [...new Set(
        aiLogs.map(l => l.created_at.slice(0, 10))
    )].sort().reverse();

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const startDay = days[0];
    if (startDay !== today && startDay !== yesterday) {
        return { currentStreak: 0, bestStreak: computeBestStreak(days) };
    }

    let current = 1;
    for (let i = 1; i < days.length; i++) {
        const prev = new Date(days[i - 1]);
        const curr = new Date(days[i]);
        const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
        if (diffDays === 1) {
            current++;
        } else {
            break;
        }
    }

    return { currentStreak: current, bestStreak: Math.max(current, computeBestStreak(days)) };
}

// ─── Achievements ────────────────────────────────────────────────────────────

export function computeAchievements(
    data: GamificationRawData,
    xp: number,
    streak: StreakInfo
): Achievement[] {
    const scripts = data.aiLogs.filter(l => l.feature === 'script_generator').length;
    const videos = data.aiLogs.filter(l =>
        l.feature === 'ad_analyzer' || l.feature === 'video_clone'
    ).length;
    const ready = data.tasks.filter(t => t.status === 'ready').length;

    const defs = [
        // Scripts
        { id: 'first_script', title: 'Primeiro Roteiro', desc: 'Gerou seu 1o roteiro com IA', icon: '\u270D\uFE0F', cat: 'scripts' as const, xpR: 50, check: scripts >= 1 },
        { id: 'scripts_10', title: 'Máquina de Copy', desc: '10 roteiros gerados', icon: '\uD83D\uDE80', cat: 'scripts' as const, xpR: 100, check: scripts >= 10 },
        { id: 'scripts_50', title: 'Copy Viciado', desc: '50 roteiros gerados', icon: '\uD83D\uDD25', cat: 'scripts' as const, xpR: 250, check: scripts >= 50 },
        // Analysis
        { id: 'first_analysis', title: 'Espião de Anúncios', desc: 'Analisou seu 1o vídeo', icon: '\uD83D\uDD0D', cat: 'analysis' as const, xpR: 75, check: videos >= 1 },
        { id: 'analysis_10', title: 'Analista de Elite', desc: '10 vídeos analisados', icon: '\uD83C\uDFAF', cat: 'analysis' as const, xpR: 200, check: videos >= 10 },
        // Pipeline
        { id: 'first_ready', title: 'Criativo no Ar', desc: 'Primeiro vídeo pronto para veicular', icon: '\uD83D\uDCFA', cat: 'pipeline' as const, xpR: 100, check: ready >= 1 },
        { id: 'ready_10', title: 'Fábrica de Criativos', desc: '10 vídeos prontos para campanha', icon: '\uD83C\uDFED', cat: 'pipeline' as const, xpR: 300, check: ready >= 10 },
        // Streaks
        { id: 'streak_3', title: 'Consistência', desc: '3 dias consecutivos ativo', icon: '\u26A1', cat: 'streak' as const, xpR: 50, check: streak.bestStreak >= 3 },
        { id: 'streak_7', title: 'Semana Perfeita', desc: '7 dias consecutivos ativo', icon: '\uD83C\uDF1F', cat: 'streak' as const, xpR: 150, check: streak.bestStreak >= 7 },
        { id: 'streak_30', title: 'Imparável', desc: '30 dias consecutivos ativo', icon: '\uD83D\uDC51', cat: 'streak' as const, xpR: 500, check: streak.bestStreak >= 30 },
        // Library
        { id: 'first_product', title: 'Produto Cadastrado', desc: 'Cadastrou seu primeiro produto', icon: '\uD83D\uDCE6', cat: 'library' as const, xpR: 50, check: data.products.length >= 1 },
        { id: 'gold_5', title: 'Colecionador de Ouro', desc: '5 itens na Biblioteca de Ouro', icon: '\u2B50', cat: 'library' as const, xpR: 100, check: data.goldItems.length >= 5 },
        // XP milestone
        { id: 'xp_1000', title: 'Mil Pontos', desc: '1000 XP acumulados', icon: '\uD83D\uDC8E', cat: 'scripts' as const, xpR: 0, check: xp >= 1000 },
    ];

    return defs.map(d => ({
        id: d.id,
        title: d.title,
        description: d.desc,
        icon: d.icon,
        category: d.cat,
        unlocked: d.check,
        xpReward: d.xpR,
    }));
}

// ─── Daily Challenges ────────────────────────────────────────────────────────

export interface DailyChallenge {
    id: string;
    label: string;
    icon: string;
    xpReward: number;
    completed: boolean;
    current: number;
    goal: number;
}

export function computeDailyChallenges(data: GamificationRawData): DailyChallenge[] {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    const todayLogs = data.aiLogs.filter(l => l.created_at >= todayISO);
    const todayTasks = data.tasks.filter(t => t.created_at >= todayISO);

    const todayScripts = todayLogs.filter(l => l.feature === 'script_generator').length;
    const todayVideos = todayLogs.filter(l => l.feature === 'ad_analyzer' || l.feature === 'video_clone').length;
    const todayReady = todayTasks.filter(t => t.status === 'ready').length;

    return [
        { id: 'daily_script', label: 'Gere 1 roteiro hoje', icon: '✍️', xpReward: 100, completed: todayScripts >= 1, current: Math.min(todayScripts, 1), goal: 1 },
        { id: 'daily_analysis', label: 'Analise 1 vídeo hoje', icon: '🔍', xpReward: 150, completed: todayVideos >= 1, current: Math.min(todayVideos, 1), goal: 1 },
        { id: 'daily_pipeline', label: 'Finalize 1 criativo', icon: '🎬', xpReward: 200, completed: todayReady >= 1, current: Math.min(todayReady, 1), goal: 1 },
    ];
}
