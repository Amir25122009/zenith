import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Habit } from '../types';
import { nanoid } from 'nanoid';
import { formatDate } from '../lib/utils';

export function useHabits() {
  const habits = useLiveQuery(async () => {
    const all = await db.habits.toArray();
    return all
      .filter(h => !h.archived)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }) ?? [];

  const archivedHabits = useLiveQuery(async () => {
    const all = await db.habits.toArray();
    return all.filter(h => !!h.archived);
  }) ?? [];

  async function addHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'archived' | 'order'>) {
    try {
      const count = await db.habits.count();
      const newHabit: Habit = {
        ...habit,
        id: nanoid(),
        createdAt: new Date().toISOString(),
        archived: false,
        order: count,
      };
      await db.habits.add(newHabit);
      return newHabit;
    } catch (err) {
      console.error('Failed to add habit to IndexedDB:', err);
      throw err;
    }
  }

  async function updateHabit(id: string, updates: Partial<Habit>) {
    try {
      await db.habits.update(id, updates);
    } catch (err) {
      console.error('Failed to update habit:', err);
      throw err;
    }
  }

  async function deleteHabit(id: string) {
    try {
      await db.transaction('rw', db.habits, db.habitLogs, async () => {
        await db.habits.delete(id);
        await db.habitLogs.where('habitId').equals(id).delete();
      });
    } catch (err) {
      console.error('Failed to delete habit:', err);
      throw err;
    }
  }

  async function archiveHabit(id: string) {
    try {
      await db.habits.update(id, { archived: true });
    } catch (err) {
      console.error('Failed to archive habit:', err);
      throw err;
    }
  }

  async function unarchiveHabit(id: string) {
    try {
      await db.habits.update(id, { archived: false });
    } catch (err) {
      console.error('Failed to unarchive habit:', err);
      throw err;
    }
  }

  return { habits, archivedHabits, addHabit, updateHabit, deleteHabit, archiveHabit, unarchiveHabit };
}

export function useHabitLogs(habitId?: string, startDate?: string, endDate?: string) {
  const logs = useLiveQuery(() => {
    let query = db.habitLogs.orderBy('date');
    if (habitId) {
      query = db.habitLogs.where('habitId').equals(habitId);
    }
    return query.toArray().then(results => {
      if (startDate || endDate) {
        return results.filter(l => {
          if (startDate && l.date < startDate) return false;
          if (endDate && l.date > endDate) return false;
          return true;
        });
      }
      return results;
    });
  }, [habitId, startDate, endDate]) ?? [];

  return logs;
}

export function useAllHabitLogs() {
  const logs = useLiveQuery(() => db.habitLogs.toArray()) ?? [];
  return logs;
}

export function useTodayLogs() {
  const today = formatDate(new Date());
  const logs = useLiveQuery(
    () => db.habitLogs.where('date').equals(today).toArray(),
    [today]
  ) ?? [];
  return logs;
}

export async function toggleHabitLog(habitId: string, date: string, completed?: boolean) {
  const existing = await db.habitLogs
    .where('[habitId+date]')
    .equals([habitId, date])
    .first();

  if (existing) {
    const newCompleted = completed !== undefined ? completed : !existing.completed;
    await db.habitLogs.update(existing.id, { completed: newCompleted });
  } else {
    await db.habitLogs.add({
      id: nanoid(),
      habitId,
      date,
      completed: completed !== undefined ? completed : true,
    });
  }
}

export async function updateHabitLogValue(habitId: string, date: string, value: number) {
  const existing = await db.habitLogs
    .where('[habitId+date]')
    .equals([habitId, date])
    .first();

  if (existing) {
    await db.habitLogs.update(existing.id, { value, completed: value > 0 });
  } else {
    await db.habitLogs.add({
      id: nanoid(),
      habitId,
      date,
      value,
      completed: value > 0,
    });
  }
}
