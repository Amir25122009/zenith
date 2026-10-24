import { useMemo } from 'react';
import { useAllHabitLogs, useHabits } from './useHabits';
import { useFocusTimer } from './useFocusTimer';
import { calculateStreak } from '../lib/utils';

export function useGamification() {
  const { habits } = useHabits();
  const allLogs = useAllHabitLogs();
  const { allSessions } = useFocusTimer();

  return useMemo(() => {
    // 15 XP per completed habit check-in
    const checkinXP = allLogs.filter(l => l.completed).length * 15;

    // 2 XP per focused minute
    const focusMinutes = allSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const focusXP = focusMinutes * 2;

    // Best streak bonus XP
    const bestStreak = habits.length > 0
      ? Math.max(0, ...habits.map(h => calculateStreak(allLogs.filter(l => l.habitId === h.id), h)))
      : 0;
    const streakXP = bestStreak * 30;

    const totalXP = checkinXP + focusXP + streakXP;

    // Level curve: 150 XP per level
    const level = Math.max(1, Math.floor(totalXP / 150) + 1);
    const currentLevelBaseXP = (level - 1) * 150;
    const xpInCurrentLevel = totalXP - currentLevelBaseXP;
    const xpForNextLevel = 150;
    const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpForNextLevel) * 100));

    let rankName = 'Basecamp Novice';
    let rankEmoji = '🏕️';

    if (level >= 20) {
      rankName = 'Zenith Peak Master';
      rankEmoji = '👑';
    } else if (level >= 12) {
      rankName = 'Summit Ascender';
      rankEmoji = '🏔️';
    } else if (level >= 7) {
      rankName = 'Ridge Runner';
      rankEmoji = '⚡';
    } else if (level >= 4) {
      rankName = 'Alpine Trailblazer';
      rankEmoji = '🌲';
    }

    return {
      totalXP,
      level,
      xpInCurrentLevel,
      xpForNextLevel,
      progressPercent,
      rankName,
      rankEmoji,
      checkinCount: allLogs.filter(l => l.completed).length,
      focusMinutes,
      bestStreak,
    };
  }, [habits, allLogs, allSessions]);
}
