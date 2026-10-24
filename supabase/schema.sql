-- ==============================================================================
-- Zenith Habit Tracker & Productivity Planner - Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. HABITS TABLE
CREATE TABLE IF NOT EXISTS public.habits (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT 'Target',
  color TEXT DEFAULT '#2D5A3D',
  category TEXT DEFAULT 'Health & Fitness',
  type TEXT DEFAULT 'build', -- 'build' | 'break'
  frequency JSONB NOT NULL DEFAULT '{"type":"daily"}',
  target JSONB NOT NULL DEFAULT '{"type":"boolean"}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE,
  "order" INTEGER DEFAULT 0
);

-- 2. HABIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id TEXT REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  completed BOOLEAN DEFAULT FALSE,
  value NUMERIC,
  note TEXT,
  CONSTRAINT unique_habit_date_user UNIQUE (user_id, habit_id, date)
);

-- 3. GOALS TABLE
CREATE TABLE IF NOT EXISTS public.goals (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  target_date TEXT NOT NULL,
  category TEXT DEFAULT 'Health & Fitness',
  milestones JSONB DEFAULT '[]',
  linked_habit_ids JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- 4. DAILY NOTES TABLE
CREATE TABLE IF NOT EXISTS public.daily_notes (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD
  mood INTEGER DEFAULT 4,
  reflection TEXT DEFAULT '',
  gratitude TEXT DEFAULT '',
  CONSTRAINT unique_note_date_user UNIQUE (user_id, date)
);

-- 5. FOCUS SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  duration INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  label TEXT
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each user can only read and write their own private data
-- ==============================================================================

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- Habits Policies
CREATE POLICY "Users can manage their own habits" ON public.habits
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Habit Logs Policies
CREATE POLICY "Users can manage their own logs" ON public.habit_logs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Goals Policies
CREATE POLICY "Users can manage their own goals" ON public.goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Daily Notes Policies
CREATE POLICY "Users can manage their own notes" ON public.daily_notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Focus Sessions Policies
CREATE POLICY "Users can manage their own focus sessions" ON public.focus_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
