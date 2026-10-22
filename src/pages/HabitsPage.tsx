import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Archive,
  RefreshCw,
  Flame,
  Filter,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { HabitForm } from '../components/habits/HabitForm';
import { HabitCard } from '../components/habits/HabitCard';
import { useHabits, useAllHabitLogs, toggleHabitLog, updateHabitLogValue } from '../hooks/useHabits';
import { calculateStreak, calculateCompletionRate, formatDate } from '../lib/utils';
import { HABIT_CATEGORIES } from '../types';
import type { Habit } from '../types';

export function HabitsPage() {
  const {
    habits,
    archivedHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    unarchiveHabit,
  } = useHabits();
  const allLogs = useAllHabitLogs();
  const todayStr = formatDate(new Date());

  // Filters & State
  const [activeTab, setActiveTab] = useState<'active' | 'build' | 'break' | 'archived'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Filtered habits
  const displayedHabits = useMemo(() => {
    let list = activeTab === 'archived' ? archivedHabits : habits;

    if (activeTab === 'build') {
      list = list.filter(h => h.type === 'build');
    } else if (activeTab === 'break') {
      list = list.filter(h => h.type === 'break');
    }

    if (selectedCategory !== 'All') {
      list = list.filter(h => h.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [habits, archivedHabits, activeTab, selectedCategory, searchQuery]);

  const handleCreate = async (data: Omit<Habit, 'id' | 'createdAt' | 'archived' | 'order'>) => {
    try {
      await addHabit(data);
      setIsNewModalOpen(false);
    } catch (err) {
      console.error('Error creating habit:', err);
    }
  };

  const handleUpdate = async (data: Omit<Habit, 'id' | 'createdAt' | 'archived' | 'order'>) => {
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, data);
        setEditingHabit(null);
      }
    } catch (err) {
      console.error('Error updating habit:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Habit Management</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Configure routines, set flexible recurrence, and eliminate friction.
          </p>
        </div>
        <Button onClick={() => setIsNewModalOpen(true)} size="sm">
          <Plus size={16} /> New Habit
        </Button>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white text-[#1A1A1A] shadow-xs'
                : 'text-[#6B7280] hover:text-[#1A1A1A]'
            }`}
          >
            All Active ({habits.length})
          </button>
          <button
            onClick={() => setActiveTab('build')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'build'
                ? 'bg-white text-[#2D5A3D] shadow-xs'
                : 'text-[#6B7280] hover:text-[#1A1A1A]'
            }`}
          >
            Build ({habits.filter(h => h.type === 'build').length})
          </button>
          <button
            onClick={() => setActiveTab('break')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'break'
                ? 'bg-white text-[#B45555] shadow-xs'
                : 'text-[#6B7280] hover:text-[#1A1A1A]'
            }`}
          >
            Break ({habits.filter(h => h.type === 'break').length})
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'archived'
                ? 'bg-white text-[#1A1A1A] shadow-xs'
                : 'text-[#6B7280] hover:text-[#1A1A1A]'
            }`}
          >
            Archived ({archivedHabits.length})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search habits..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]"
            />
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-[#E5E7EB] bg-white text-[#4B5563] focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]"
            >
              <option value="All">All Categories</option>
              {HABIT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Habits List Grid */}
      {displayedHabits.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
          <div className="max-w-sm mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center mx-auto">
              {activeTab === 'archived' ? <Archive size={24} /> : <Filter size={24} />}
            </div>
            <h3 className="text-base font-semibold text-[#1A1A1A]">No habits found</h3>
            <p className="text-xs text-[#6B7280]">
              {searchQuery || selectedCategory !== 'All'
                ? 'Try clearing your search query or category filters.'
                : activeTab === 'archived'
                ? 'You do not have any archived habits.'
                : 'Get started by creating your first healthy daily routine.'}
            </p>
            {activeTab !== 'archived' && (
              <Button size="sm" onClick={() => setIsNewModalOpen(true)}>
                <Plus size={16} /> Create Habit
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {displayedHabits.map(habit => {
            const habitLogs = allLogs.filter(l => l.habitId === habit.id);
            const todayLog = habitLogs.find(l => l.date === todayStr);
            const streak = calculateStreak(habitLogs, habit);
            const rate30d = calculateCompletionRate(habitLogs, 30);

            if (activeTab === 'archived') {
              return (
                <Card key={habit.id} className="opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#1A1A1A] truncate">{habit.name}</h3>
                      <p className="text-xs text-[#9CA3AF]">{habit.category} • Archived</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unarchiveHabit(habit.id)}
                        className="text-xs"
                      >
                        <RefreshCw size={14} /> Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteHabit(habit.id)}
                        className="text-xs"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            }

            return (
              <div key={habit.id} className="relative flex flex-col">
                <HabitCard
                  habit={habit}
                  log={todayLog}
                  streak={streak}
                  onToggle={() => toggleHabitLog(habit.id, todayStr)}
                  onEdit={() => setEditingHabit(habit)}
                  onArchive={() => archiveHabit(habit.id)}
                  onDelete={() => deleteHabit(habit.id)}
                  onUpdateValue={(v) => updateHabitLogValue(habit.id, todayStr, v)}
                />

                {/* Sub-card with micro statistics */}
                <div className="mx-3 -mt-1 pt-2 pb-1.5 px-3 bg-neutral-50/70 border-x border-b border-[#E5E7EB] rounded-b-xl flex items-center justify-between text-[11px] text-[#6B7280]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#9CA3AF]">Frequency:</span>
                    <span className="font-medium text-[#1A1A1A] capitalize">
                      {habit.frequency.type === 'daily'
                        ? 'Daily'
                        : habit.frequency.type === 'specific_days'
                        ? `${habit.frequency.daysOfWeek?.length || 0} days/wk`
                        : `${habit.frequency.timesPerWeek || 0}x/week`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Flame size={12} className="text-[#C9A96E]" />
                      <span>{streak}d</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-semibold text-[#2D5A3D]">{rate30d}%</span>
                      <span className="text-[10px] text-[#9CA3AF]">30d rate</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Habit Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Add New Habit"
        size="md"
      >
        <HabitForm
          onSubmit={handleCreate}
          onCancel={() => setIsNewModalOpen(false)}
        />
      </Modal>

      {/* Edit Habit Modal */}
      <Modal
        isOpen={!!editingHabit}
        onClose={() => setEditingHabit(null)}
        title="Edit Habit Settings"
        size="md"
      >
        {editingHabit && (
          <HabitForm
            habit={editingHabit}
            onSubmit={handleUpdate}
            onCancel={() => setEditingHabit(null)}
          />
        )}
      </Modal>
    </div>
  );
}
