import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  differenceInDays,
  subDays,
  subWeeks,
  startOfMonth,
  endOfMonth,
  getDay,
} from 'date-fns';
import type { Habit, HabitLog } from '../types';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'EEEE, MMMM d, yyyy');
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
}

export function todayStr(): string {
  return formatDate(new Date());
}

export function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
  const freq = habit.frequency;
  if (freq.type === 'daily') return true;
  if (freq.type === 'specific_days' && freq.daysOfWeek) {
    return freq.daysOfWeek.includes(getDay(date));
  }
  // For 'times_per_week', it's available every day so user can log whenever
  if (freq.type === 'times_per_week') return true;
  return true;
}

function countCompletionsInInterval(completedDates: Set<string>, start: Date, end: Date): number {
  let count = 0;
  for (const day of eachDayOfInterval({ start, end })) {
    if (completedDates.has(formatDate(day))) {
      count++;
    }
  }
  return count;
}

export function calculateWeeklyStreak(logs: HabitLog[], timesPerWeek: number): number {
  if (logs.length === 0 || timesPerWeek <= 0) return 0;

  const completedDates = new Set(
    logs.filter(l => l.completed).map(l => l.date)
  );

  if (completedDates.size === 0) return 0;

  const now = new Date();
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // Count completions in the current ongoing week
  const currentWeekCompletions = countCompletionsInInterval(completedDates, currentWeekStart, currentWeekEnd);

  let streak = 0;
  // If target already reached this week, current week counts towards streak
  if (currentWeekCompletions >= timesPerWeek) {
    streak++;
  }

  // Check previous weeks going backwards
  let checkWeekStart = subWeeks(currentWeekStart, 1);
  let checkWeekEnd = endOfWeek(checkWeekStart, { weekStartsOn: 1 });

  for (let w = 0; w < 52; w++) {
    const completions = countCompletionsInInterval(completedDates, checkWeekStart, checkWeekEnd);
    if (completions >= timesPerWeek) {
      streak++;
      checkWeekStart = subWeeks(checkWeekStart, 1);
      checkWeekEnd = endOfWeek(checkWeekStart, { weekStartsOn: 1 });
    } else {
      break;
    }
  }

  return streak;
}

export function calculateLongestWeeklyStreak(logs: HabitLog[], timesPerWeek: number): number {
  if (logs.length === 0 || timesPerWeek <= 0) return 0;

  const completedDates = new Set(
    logs.filter(l => l.completed).map(l => l.date)
  );

  if (completedDates.size === 0) return 0;

  const sortedDates = Array.from(completedDates).sort();
  const firstDate = parseISO(sortedDates[0]);
  const now = new Date();

  let checkWeekStart = startOfWeek(firstDate, { weekStartsOn: 1 });
  let checkWeekEnd = endOfWeek(checkWeekStart, { weekStartsOn: 1 });
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });

  let longest = 0;
  let current = 0;

  while (checkWeekStart <= thisWeekStart) {
    const completions = countCompletionsInInterval(completedDates, checkWeekStart, checkWeekEnd);
    if (completions >= timesPerWeek) {
      current++;
      longest = Math.max(longest, current);
    } else {
      if (checkWeekStart.getTime() !== thisWeekStart.getTime()) {
        current = 0;
      }
    }
    // Advance 1 week forward
    checkWeekStart = subWeeks(checkWeekStart, -1);
    checkWeekEnd = endOfWeek(checkWeekStart, { weekStartsOn: 1 });
  }

  return longest;
}

export function calculateStreak(logs: HabitLog[], habit: Habit): number {
  if (habit.frequency.type === 'times_per_week') {
    return calculateWeeklyStreak(logs, habit.frequency.timesPerWeek || 1);
  }

  if (logs.length === 0) return 0;

  const completedDates = logs
    .filter(l => l.completed)
    .map(l => l.date)
    .sort()
    .reverse();

  if (completedDates.length === 0) return 0;

  let streak = 0;
  let checkDate = new Date();

  // If today is not completed yet, start checking from yesterday
  const todayLog = completedDates.find(d => d === formatDate(checkDate));
  if (!todayLog) {
    checkDate = subDays(checkDate, 1);
  }

  for (let i = 0; i < 365; i++) {
    const dateStr = formatDate(checkDate);
    const dateObj = checkDate;

    if (!isHabitScheduledForDate(habit, dateObj)) {
      checkDate = subDays(checkDate, 1);
      continue;
    }

    if (completedDates.includes(dateStr)) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(logs: HabitLog[], habit: Habit): number {
  if (habit.frequency.type === 'times_per_week') {
    return calculateLongestWeeklyStreak(logs, habit.frequency.timesPerWeek || 1);
  }

  if (logs.length === 0) return 0;

  const completedDates = new Set(
    logs.filter(l => l.completed).map(l => l.date)
  );

  if (completedDates.size === 0) return 0;

  const sortedDates = Array.from(completedDates).sort();
  const firstDate = parseISO(sortedDates[0]);
  const lastDate = parseISO(sortedDates[sortedDates.length - 1]);

  let longestStreak = 0;
  let currentStreak = 0;

  const days = eachDayOfInterval({ start: firstDate, end: lastDate });

  for (const day of days) {
    if (!isHabitScheduledForDate(habit, day)) continue;

    if (completedDates.has(formatDate(day))) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return longestStreak;
}

export function calculateCompletionRate(logs: HabitLog[], days: number): number {
  if (logs.length === 0) return 0;
  const recentLogs = logs.filter(l => {
    const logDate = parseISO(l.date);
    return differenceInDays(new Date(), logDate) < days;
  });
  if (recentLogs.length === 0) return 0;
  const completed = recentLogs.filter(l => l.completed).length;
  return Math.round((completed / recentLogs.length) * 100);
}

export function getWeekDays(date: Date, weekStartsOn: 0 | 1 = 1): Date[] {
  const start = startOfWeek(date, { weekStartsOn });
  const end = endOfWeek(date, { weekStartsOn });
  return eachDayOfInterval({ start, end });
}

export function getMonthDays(date: Date): Date[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
}

export function getCompletionColor(rate: number): string {
  if (rate >= 90) return '#2D5A3D';
  if (rate >= 70) return '#4A7C59';
  if (rate >= 50) return '#8FBC8F';
  if (rate >= 30) return '#C9A96E';
  if (rate > 0) return '#E8C07D';
  return '#F3F4F6';
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getMoodEmoji(mood: number): string {
  const moods: Record<number, string> = {
    1: '😔',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '😊',
  };
  return moods[mood] || '😐';
}

export function getMoodLabel(mood: number): string {
  const labels: Record<number, string> = {
    1: 'Awful',
    2: 'Bad',
    3: 'Okay',
    4: 'Good',
    5: 'Great',
  };
  return labels[mood] || 'Okay';
}
