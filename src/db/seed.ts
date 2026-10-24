import { subDays, format } from 'date-fns';
import { db } from './index';
import type { Habit, HabitLog, Goal, DailyNote } from '../types';

export async function seedInitialData(force: boolean = false) {
  // Seed only once per browser, even if the user later deletes all habits
  if (!force) {
    try {
      if (localStorage.getItem('zenith-seeded') === '1') return;
    } catch { /* storage unavailable, fall back to the count check */ }

    const habitCount = await db.habits.count();
    if (habitCount > 0) {
      try { localStorage.setItem('zenith-seeded', '1'); } catch { /* ignore */ }
      return;
    }
  }

  const initialHabits: Habit[] = [
    {
      id: 'habit-1',
      name: 'Morning Hydration & Sunlight',
      description: 'Drink 500ml of water and get 10 mins of natural light',
      icon: 'Sun',
      color: '#2D5A3D',
      category: 'Health & Fitness',
      type: 'build',
      frequency: { type: 'daily' },
      target: { type: 'boolean' },
      createdAt: subDays(new Date(), 21).toISOString(),
      archived: false,
      order: 0,
    },
    {
      id: 'habit-2',
      name: 'Read 20 Pages',
      description: 'Non-fiction or personal growth books',
      icon: 'BookOpen',
      color: '#4A7C59',
      category: 'Learning & Growth',
      type: 'build',
      frequency: { type: 'daily' },
      target: { type: 'numeric', unit: 'pages', value: 20 },
      createdAt: subDays(new Date(), 21).toISOString(),
      archived: false,
      order: 1,
    },
    {
      id: 'habit-3',
      name: 'Deep Work / Focused Study',
      description: 'At least 60 minutes of uninterrupted work without notifications',
      icon: 'Brain',
      color: '#C9A96E',
      category: 'Productivity',
      type: 'build',
      frequency: { type: 'specific_days', daysOfWeek: [1, 2, 3, 4, 5] },
      target: { type: 'numeric', unit: 'mins', value: 60 },
      createdAt: subDays(new Date(), 21).toISOString(),
      archived: false,
      order: 2,
    },
    {
      id: 'habit-4',
      name: 'Physical Workout or Run',
      description: 'Gym training, cardio, or outdoor calisthenics',
      icon: 'Dumbbell',
      color: '#4A90A4',
      category: 'Health & Fitness',
      type: 'build',
      frequency: { type: 'times_per_week', timesPerWeek: 4 },
      target: { type: 'boolean' },
      createdAt: subDays(new Date(), 21).toISOString(),
      archived: false,
      order: 3,
    },
    {
      id: 'habit-5',
      name: 'Limit Phone Screen Time',
      description: 'Keep non-work screen time under 2 hours',
      icon: 'Smartphone',
      color: '#EF4444',
      category: 'Productivity',
      type: 'break',
      frequency: { type: 'daily' },
      target: { type: 'boolean' },
      createdAt: subDays(new Date(), 21).toISOString(),
      archived: false,
      order: 4,
    },
    {
      id: 'habit-6',
      name: 'Evening Reflection & Wind-down',
      description: 'Log daily gratitude and stop screens 45 mins before sleep',
      icon: 'Moon',
      color: '#8B5CF6',
      category: 'Mindfulness',
      type: 'build',
      frequency: { type: 'daily' },
      target: { type: 'boolean' },
      createdAt: subDays(new Date(), 21).toISOString(),
      archived: false,
      order: 5,
    },
  ];

  await db.habits.bulkAdd(initialHabits);

  // Generate 21 days of realistic logs
  const logs: HabitLog[] = [];
  const today = new Date();

  // Probabilities of completion for realistic variance
  const completionProbabilities: Record<string, number> = {
    'habit-1': 0.88,
    'habit-2': 0.76,
    'habit-3': 0.82,
    'habit-4': 0.65,
    'habit-5': 0.72,
    'habit-6': 0.79,
  };

  for (let i = 20; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayOfWeek = d.getDay();

    for (const habit of initialHabits) {
      // Check if scheduled
      if (habit.frequency.type === 'specific_days' && habit.frequency.daysOfWeek) {
        if (!habit.frequency.daysOfWeek.includes(dayOfWeek)) continue;
      }

      // Slightly lower chance on weekends
      let prob = completionProbabilities[habit.id] ?? 0.75;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        if (habit.id === 'habit-3') prob -= 0.4;
        if (habit.id === 'habit-1') prob += 0.05;
      }

      // For today, leave a couple uncompleted so user can click them!
      if (i === 0) {
        if (habit.id === 'habit-1' || habit.id === 'habit-2') {
          logs.push({
            id: `log-${habit.id}-${dateStr}`,
            habitId: habit.id,
            date: dateStr,
            completed: true,
            value: habit.target.type === 'numeric' ? habit.target.value : undefined,
          });
        }
        continue;
      }

      const completed = Math.random() < prob;
      if (completed) {
        logs.push({
          id: `log-${habit.id}-${dateStr}`,
          habitId: habit.id,
          date: dateStr,
          completed: true,
          value: habit.target.type === 'numeric' ? habit.target.value : undefined,
          note: i % 5 === 0 ? 'Felt energetic and focused.' : undefined,
        });
      }
    }
  }

  await db.habitLogs.bulkAdd(logs);

  // Starter Goals
  const initialGoals: Goal[] = [
    {
      id: 'goal-1',
      name: 'Master Morning Routine Consistency',
      description: 'Build an unbroken 30-day streak of hydration, sunlight, and mindful planning.',
      targetDate: format(subDays(today, -30), 'yyyy-MM-dd'),
      category: 'Health & Fitness',
      milestones: [
        { id: 'm1', name: '7 consecutive days', completed: true },
        { id: 'm2', name: '14 consecutive days', completed: true },
        { id: 'm3', name: '21 consecutive days', completed: false },
        { id: 'm4', name: 'Full 30-day streak achieved', completed: false },
      ],
      linkedHabitIds: ['habit-1', 'habit-6'],
      createdAt: subDays(today, 15).toISOString(),
      archived: false,
    },
    {
      id: 'goal-2',
      name: 'Read 6 Books This Quarter',
      description: 'Complete 6 foundational books on psychology, focus, and productivity.',
      targetDate: format(subDays(today, -60), 'yyyy-MM-dd'),
      category: 'Learning & Growth',
      milestones: [
        { id: 'm2-1', name: 'Book 1: Atomic Habits', completed: true },
        { id: 'm2-2', name: 'Book 2: Deep Work', completed: true },
        { id: 'm2-3', name: 'Book 3: Essentialism', completed: false },
        { id: 'm2-4', name: 'Book 4: Peak Mind', completed: false },
      ],
      linkedHabitIds: ['habit-2'],
      createdAt: subDays(today, 20).toISOString(),
      archived: false,
    },
  ];

  await db.goals.bulkAdd(initialGoals);

  // Starter Journal notes
  const initialNotes: DailyNote[] = [
    {
      id: 'note-1',
      date: format(subDays(today, 2), 'yyyy-MM-dd'),
      mood: 4,
      reflection: 'Had great flow during the morning study session. Getting up early made a huge difference.',
      gratitude: 'Quiet morning coffee, good book, and clarity of mind.',
    },
    {
      id: 'note-2',
      date: format(subDays(today, 1), 'yyyy-MM-dd'),
      mood: 5,
      reflection: 'Crushed my workout. Felt strong and focused throughout the entire afternoon.',
      gratitude: 'Progress on my projects and supportive friends.',
    },
  ];

  await db.dailyNotes.bulkAdd(initialNotes);
  try { localStorage.setItem('zenith-seeded', '1'); } catch { /* ignore */ }
}