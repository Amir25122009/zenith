import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { AppSettings } from '../types';

export function useSettings() {
  const settings = useLiveQuery(() => db.settings.get('app-settings'));

  async function updateSettings(updates: Partial<AppSettings>) {
    await db.settings.update('app-settings', updates);
  }

  return {
    settings: settings ?? {
      id: 'app-settings',
      theme: 'light' as const,
      weekStartsOn: 1 as const,
      defaultView: 'dashboard',
    },
    updateSettings,
  };
}
