export type HabitType = 'build' | 'break';

export type FrequencyType = 'daily' | 'specific_days' | 'times_per_week';

export type TargetType = 'boolean' | 'numeric';

export interface HabitFrequency {
  type: FrequencyType;
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, ...6=Saturday
  timesPerWeek?: number;
}

export interface HabitTarget {
  type: TargetType;
  unit?: string;
  value?: number;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  type: HabitType;
  frequency: HabitFrequency;
  target: HabitTarget;
  createdAt: string;
  archived: boolean;
  order: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  value?: number;
  note?: string;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  category: string;
  milestones: Milestone[];
  linkedHabitIds: string[];
  createdAt: string;
  archived: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  completed: boolean;
}

export interface DailyNote {
  id: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1-5
  reflection: string;
  gratitude: string;
}

export interface FocusSession {
  id: string;
  date: string;
  duration: number; // minutes
  completedAt: string;
  label?: string;
}

export interface AppSettings {
  id: string;
  theme: 'light' | 'dark';
  weekStartsOn: 0 | 1; // 0=Sunday, 1=Monday
  defaultView: string;
}

export const HABIT_CATEGORIES = [
  'Health & Fitness',
  'Learning & Growth',
  'Mindfulness',
  'Productivity',
  'Social',
  'Finance',
  'Creativity',
  'Self-Care',
  'Other',
] as const;

export const HABIT_ICONS = [
  'Dumbbell', 'BookOpen', 'Brain', 'Heart', 'Droplets',
  'Sun', 'Moon', 'Coffee', 'Apple', 'Footprints',
  'Pencil', 'Music', 'Palette', 'Code', 'Leaf',
  'Timer', 'Target', 'TrendingUp', 'Smile', 'Zap',
  'Bike', 'Salad', 'Pill', 'BedDouble', 'GlassWater',
  'CircleOff', 'Cigarette', 'Smartphone', 'Cookie', 'Wine',
] as const;

export const HABIT_COLORS = [
  '#2D5A3D', '#4A7C59', '#6B8E5B', '#8FBC8F',
  '#C9A96E', '#D4A574', '#E8C07D',
  '#4A90A4', '#5B7FA6', '#7B9EC7',
  '#A0522D', '#CD853F',
  '#8B5CF6', '#6366F1',
  '#EF4444', '#F97316',
] as const;
