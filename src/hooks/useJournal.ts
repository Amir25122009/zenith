import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { DailyNote } from '../types';
import { nanoid } from 'nanoid';

export function useJournal() {
  const notes = useLiveQuery(() =>
    db.dailyNotes.orderBy('date').reverse().toArray()
  ) ?? [];

  async function saveNote(date: string, data: { mood: number; reflection: string; gratitude: string }) {
    const existing = await db.dailyNotes.where('date').equals(date).first();
    if (existing) {
      await db.dailyNotes.update(existing.id, data);
    } else {
      await db.dailyNotes.add({
        id: nanoid(),
        date,
        ...data,
      });
    }
  }

  async function deleteNote(id: string) {
    await db.dailyNotes.delete(id);
  }

  function getNoteForDate(date: string): DailyNote | undefined {
    return notes.find(n => n.date === date);
  }

  return { notes, saveNote, deleteNote, getNoteForDate };
}
