import { useEffect, useRef } from 'react';
import { useGamification } from '../contexts/GamificationContext';
import { useToast } from '../contexts/ToastContext';

export function useAchievementWatcher() {
    const { achievements, levelInfo, isLoading } = useGamification();
    const { showToast } = useToast();

    const seenAchievements = useRef<Set<string> | null>(null);
    const seenLevel = useRef<number | null>(null);

    useEffect(() => {
        if (isLoading) return;

        const unlockedIds = achievements.filter(a => a.unlocked).map(a => a.id);

        // First load — populate refs without firing toasts
        if (seenAchievements.current === null) {
            seenAchievements.current = new Set(unlockedIds);
            seenLevel.current = levelInfo.level;
            return;
        }

        // Check for new achievements
        for (const a of achievements) {
            if (a.unlocked && !seenAchievements.current.has(a.id)) {
                seenAchievements.current.add(a.id);
                showToast({
                    type: 'achievement',
                    icon: a.icon,
                    title: a.title,
                    message: a.description,
                });
            }
        }

        // Check for level up
        if (seenLevel.current !== null && levelInfo.level > seenLevel.current) {
            showToast({
                type: 'levelup',
                icon: '⬆️',
                title: `Nível ${levelInfo.level} — ${levelInfo.title}`,
                message: `Parabéns! Você avançou para o nível ${levelInfo.level}!`,
            });
        }
        seenLevel.current = levelInfo.level;
    }, [achievements, levelInfo, isLoading, showToast]);
}
