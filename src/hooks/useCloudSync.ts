import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from '../db';
import type { Habit, HabitLog, Goal, DailyNote, FocusSession } from '../types';

export function useCloudSync() {
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Monitor auth state
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  // Upload local data to Supabase
  const syncToCloud = useCallback(async () => {
    if (!supabase || !user) return;
    setIsSyncing(true);
    setSyncStatus('Backing up data to cloud...');
    try {
      const habits = await db.habits.toArray();
      const logs = await db.habitLogs.toArray();
      const goals = await db.goals.toArray();
      const notes = await db.dailyNotes.toArray();
      const focus = await db.focusSessions.toArray();

      // Upsert Habits
      if (habits.length > 0) {
        const payload = habits.map(h => ({
          id: h.id,
          user_id: user.id,
          name: h.name,
          description: h.description,
          icon: h.icon,
          color: h.color,
          category: h.category,
          type: h.type,
          frequency: h.frequency,
          target: h.target,
          created_at: h.createdAt,
          archived: h.archived,
          order: h.order,
        }));
        await supabase.from('habits').upsert(payload, { onConflict: 'id' });
      }

      // Upsert Logs
      if (logs.length > 0) {
        const payload = logs.map(l => ({
          id: l.id,
          user_id: user.id,
          habit_id: l.habitId,
          date: l.date,
          completed: l.completed,
          value: l.value,
          note: l.note,
        }));
        await supabase.from('habit_logs').upsert(payload, { onConflict: 'id' });
      }

      // Upsert Goals
      if (goals.length > 0) {
        const payload = goals.map(g => ({
          id: g.id,
          user_id: user.id,
          name: g.name,
          description: g.description,
          target_date: g.targetDate,
          category: g.category,
          milestones: g.milestones,
          linked_habit_ids: g.linkedHabitIds,
          created_at: g.createdAt,
          archived: g.archived,
        }));
        await supabase.from('goals').upsert(payload, { onConflict: 'id' });
      }

      // Upsert Notes
      if (notes.length > 0) {
        const payload = notes.map(n => ({
          id: n.id,
          user_id: user.id,
          date: n.date,
          mood: n.mood,
          reflection: n.reflection,
          gratitude: n.gratitude,
        }));
        await supabase.from('daily_notes').upsert(payload, { onConflict: 'id' });
      }

      // Upsert Focus
      if (focus.length > 0) {
        const payload = focus.map(f => ({
          id: f.id,
          user_id: user.id,
          date: f.date,
          duration: f.duration,
          completed_at: f.completedAt,
          label: f.label,
        }));
        await supabase.from('focus_sessions').upsert(payload, { onConflict: 'id' });
      }

      setSyncStatus('Synced successfully with cloud!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err: unknown) {
      console.error('Cloud sync error:', err);
      setSyncStatus('Sync error. Check console.');
      setTimeout(() => setSyncStatus(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  // Pull data from Supabase to local DB
  const pullFromCloud = useCallback(async () => {
    if (!supabase || !user) return;
    setIsSyncing(true);
    setSyncStatus('Restoring data from cloud...');
    try {
      const [habitsRes, logsRes, goalsRes, notesRes, focusRes] = await Promise.all([
        supabase.from('habits').select('*'),
        supabase.from('habit_logs').select('*'),
        supabase.from('goals').select('*'),
        supabase.from('daily_notes').select('*'),
        supabase.from('focus_sessions').select('*'),
      ]);

      if (habitsRes.data && habitsRes.data.length > 0) {
        const localHabits: Habit[] = habitsRes.data.map(h => ({
          id: h.id,
          name: h.name,
          description: h.description,
          icon: h.icon,
          color: h.color,
          category: h.category,
          type: h.type,
          frequency: h.frequency,
          target: h.target,
          createdAt: h.created_at,
          archived: h.archived,
          order: h.order,
        }));
        await db.habits.bulkPut(localHabits);
      }

      if (logsRes.data && logsRes.data.length > 0) {
        const localLogs: HabitLog[] = logsRes.data.map(l => ({
          id: l.id,
          habitId: l.habit_id,
          date: l.date,
          completed: l.completed,
          value: l.value,
          note: l.note,
        }));
        await db.habitLogs.bulkPut(localLogs);
      }

      if (goalsRes.data && goalsRes.data.length > 0) {
        const localGoals: Goal[] = goalsRes.data.map(g => ({
          id: g.id,
          name: g.name,
          description: g.description,
          targetDate: g.target_date,
          category: g.category,
          milestones: g.milestones,
          linkedHabitIds: g.linked_habit_ids,
          createdAt: g.created_at,
          archived: g.archived,
        }));
        await db.goals.bulkPut(localGoals);
      }

      if (notesRes.data && notesRes.data.length > 0) {
        const localNotes: DailyNote[] = notesRes.data.map(n => ({
          id: n.id,
          date: n.date,
          mood: n.mood,
          reflection: n.reflection,
          gratitude: n.gratitude,
        }));
        await db.dailyNotes.bulkPut(localNotes);
      }

      if (focusRes.data && focusRes.data.length > 0) {
        const localFocus: FocusSession[] = focusRes.data.map(f => ({
          id: f.id,
          date: f.date,
          duration: f.duration,
          completedAt: f.completed_at,
          label: f.label,
        }));
        await db.focusSessions.bulkPut(localFocus);
      }

      setSyncStatus('Pulled all records from cloud!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err: unknown) {
      console.error('Pull from cloud error:', err);
      setSyncStatus('Pull failed.');
      setTimeout(() => setSyncStatus(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  return {
    isConfigured: isSupabaseConfigured,
    user,
    isSyncing,
    syncStatus,
    signIn,
    signUp,
    signOut,
    syncToCloud,
    pullFromCloud,
  };
}
