import Dexie, { type Table } from 'dexie';
import type { Habit, HabitLog, Goal, DailyNote, FocusSession, AppSettings } from '../types';
import { seedInitialData } from './seed';

export class ZenithDB extends Dexie {
  habits!: Table<Habit, string>;
  habitLogs!: Table<HabitLog, string>;
  goals!: Table<Goal, string>;
  dailyNotes!: Table<DailyNote, string>;
  focusSessions!: Table<FocusSession, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('zenith-db');
    this.version(1).stores({
      habits: 'id, category, type, archived, order',
      habitLogs: 'id, habitId, date, [habitId+date]',
      goals: 'id, category, archived',
      dailyNotes: 'id, date',
      focusSessions: 'id, date',
      settings: 'id',
    });
  }
}

export const db = new ZenithDB();

// Initialize default settings & starter data if empty
db.on('ready', async () => {
  try {
    const count = await db.settings.count();
    if (count === 0) {
      await db.settings.add({
        id: 'app-settings',
        theme: 'light',
        weekStartsOn: 1,
        defaultView: 'dashboard',
      });
    }
    await seedInitialData();
  } catch (err) {
    console.warn('Database initialization note:', err);
  }
});
