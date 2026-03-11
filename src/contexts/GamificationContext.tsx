import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
    computeXP,
    getLevel,
    computeStreak,
    computeAchievements,
    computeDailyChallenges,
    type GamificationRawData,
    type LevelInfo,
    type StreakInfo,
    type Achievement,
    type DailyChallenge,
} from '../lib/gamification';

interface GamificationContextType {
    xp: number;
    levelInfo: LevelInfo;
    streak: StreakInfo;
    achievements: Achievement[];
    dailyChallenges: DailyChallenge[];
    isLoading: boolean;
    refresh: () => Promise<void>;
}

const defaultLevel: LevelInfo = { level: 1, title: 'Iniciante', xp: 0, xpForNext: 500, progressPercent: 0 };

const GamificationContext = createContext<GamificationContextType>({
    xp: 0,
    levelInfo: defaultLevel,
    streak: { currentStreak: 0, bestStreak: 0 },
    achievements: [],
    dailyChallenges: [],
    isLoading: true,
    refresh: async () => {},
});

export function useGamification() {
    return useContext(GamificationContext);
}

const emptyData: GamificationRawData = { aiLogs: [], tasks: [], products: [], goldItems: [] };

export function GamificationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [rawData, setRawData] = useState<GamificationRawData>(emptyData);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAll = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);

        const [logsRes, tasksRes, productsRes, goldRes] = await Promise.all([
            supabase
                .from('ai_usage_logs')
                .select('created_at, feature')
                .eq('user_id', user.id),
            supabase
                .from('creative_production_tasks')
                .select('created_at, status')
                .eq('user_id', user.id),
            supabase
                .from('products')
                .select('id')
                .eq('user_id', user.id),
            supabase
                .from('gold_library')
                .select('id'),
        ]);

        setRawData({
            aiLogs: logsRes.data ?? [],
            tasks: tasksRes.data ?? [],
            products: productsRes.data ?? [],
            goldItems: goldRes.data ?? [],
        });
        setIsLoading(false);
    }, [user]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const xp = computeXP(rawData);
    const levelInfo = getLevel(xp);
    const streak = computeStreak(rawData.aiLogs);
    const achievements = computeAchievements(rawData, xp, streak);
    const dailyChallenges = computeDailyChallenges(rawData);

    return (
        <GamificationContext.Provider value={{ xp, levelInfo, streak, achievements, dailyChallenges, isLoading, refresh: fetchAll }}>
            {children}
        </GamificationContext.Provider>
    );
}
