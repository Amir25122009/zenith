export const APP_NAME = 'Zenith';
export const APP_TAGLINE = 'Rise to your best, one habit at a time';

export const COLORS = {
  primary: '#2D5A3D',
  primaryLight: '#4A7C59',
  primaryLighter: '#8FBC8F',
  accent: '#C9A96E',
  accentLight: '#E8C07D',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  success: '#4A7C59',
  error: '#B45555',
  warning: '#C9A96E',
} as const;

export const MOTIVATIONAL_QUOTES = [
  "Small daily improvements over time lead to stunning results.",
  "You don't have to be extreme, just consistent.",
  "The secret of getting ahead is getting started.",
  "Discipline is choosing between what you want now and what you want most.",
  "Success is the sum of small efforts repeated day in and day out.",
  "It's not about perfect. It's about effort.",
  "A habit cannot be tossed out the window. It must be coaxed down the stairs one step at a time.",
  "Motivation gets you going, but discipline keeps you growing.",
  "Your future is created by what you do today, not tomorrow.",
  "The only bad workout is the one that didn't happen.",
  "Progress, not perfection.",
  "Be stronger than your strongest excuse.",
  "Every expert was once a beginner.",
  "You are what you repeatedly do.",
  "Fall seven times, stand up eight.",
  "The best time to start was yesterday. The next best time is now.",
  "Don't count the days, make the days count.",
  "Champions keep playing until they get it right.",
  "One day or day one. You decide.",
  "Strive for progress, not perfection.",
] as const;

export function getDailyQuote(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}

export const DEFAULT_POMODORO_MINUTES = 25;
export const DEFAULT_BREAK_MINUTES = 5;
export const DEFAULT_LONG_BREAK_MINUTES = 15;
