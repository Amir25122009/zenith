import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Goal, Milestone } from '../types';
import { nanoid } from 'nanoid';

export function useGoals() {
  const goals = useLiveQuery(async () => {
    const all = await db.goals.toArray();
    return all.filter(g => !g.archived);
  }) ?? [];

  const archivedGoals = useLiveQuery(async () => {
    const all = await db.goals.toArray();
    return all.filter(g => !!g.archived);
  }) ?? [];

  async function addGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'archived'>) {
    try {
      const newGoal: Goal = {
        ...goal,
        id: nanoid(),
        createdAt: new Date().toISOString(),
        archived: false,
      };
      await db.goals.add(newGoal);
      return newGoal;
    } catch (err) {
      console.error('Failed to add goal:', err);
      throw err;
    }
  }

  async function updateGoal(id: string, updates: Partial<Goal>) {
    try {
      await db.goals.update(id, updates);
    } catch (err) {
      console.error('Failed to update goal:', err);
      throw err;
    }
  }

  async function deleteGoal(id: string) {
    try {
      await db.goals.delete(id);
    } catch (err) {
      console.error('Failed to delete goal:', err);
      throw err;
    }
  }

  async function toggleMilestone(goalId: string, milestoneId: string) {
    const goal = await db.goals.get(goalId);
    if (!goal) return;
    const milestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    await db.goals.update(goalId, { milestones });
  }

  async function addMilestone(goalId: string, name: string) {
    const goal = await db.goals.get(goalId);
    if (!goal) return;
    const milestone: Milestone = { id: nanoid(), name, completed: false };
    await db.goals.update(goalId, { milestones: [...goal.milestones, milestone] });
  }

  async function removeMilestone(goalId: string, milestoneId: string) {
    const goal = await db.goals.get(goalId);
    if (!goal) return;
    const milestones = goal.milestones.filter(m => m.id !== milestoneId);
    await db.goals.update(goalId, { milestones });
  }

  return { goals, archivedGoals, addGoal, updateGoal, deleteGoal, toggleMilestone, addMilestone, removeMilestone };
}
