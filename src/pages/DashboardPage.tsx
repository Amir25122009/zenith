import { useState } from 'react';
import { format, subDays, addDays } from 'date-fns';
import {
  Plus,
  Flame,
  CheckCircle2,
  Target,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { ProgressRing } from '../components/ui/ProgressRing';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { HabitCard } from '../components/habits/HabitCard';
import { HabitForm } from '../components/habits/HabitForm';
import { useHabits, useHabitLogs, toggleHabitLog, updateHabitLogValue } from '../hooks/useHabits';
import { useJournal } from '../hooks/useJournal';
import { useGoals } from '../hooks/useGoals';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { useAllHabitLogs } from '../hooks/useHabits';
import {
  formatDate,
  formatDisplayDate,
  isHabitScheduledForDate,
  calculateStreak,
  getMoodEmoji,
  getMoodLabel,
} from '../lib/utils';
import { getDailyQuote } from '../lib/constants';
import { useNavigate } from 'react-router-dom';
import type { Habit } from '../types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { habits, addHabit, updateHabit, deleteHabit, archiveHabit } = useHabits();
  const allLogs = useAllHabitLogs();
  const { getNoteForDate, saveNote } = useJournal();
  const { goals } = useGoals();
  const { totalFocusToday } = useFocusTimer();

  // Selected date for viewing / backfilling
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const selectedDateStr = formatDate(selectedDate);
  const isSelectedDateToday = formatDate(new Date()) === selectedDateStr;

  // Modals
  const [isNewHabitOpen, setIsNewHabitOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);

  // Logs for the selected date
  const selectedDateLogs = useHabitLogs(undefined, selectedDateStr, selectedDateStr);

  // Filter habits scheduled for this day
  const scheduledHabits = habits.filter(h => isHabitScheduledForDate(h, selectedDate));

  // Calculate completion for selected date
  const completedCount = scheduledHabits.filter(h => {
    const log = selectedDateLogs.find(l => l.habitId === h.id);
    return log?.completed;
  }).length;
  const totalCount = scheduledHabits.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Best streak across active habits
  const bestStreak = habits.length > 0
    ? Math.max(0, ...habits.map(h => calculateStreak(allLogs.filter(l => l.habitId === h.id), h)))
    : 0;

  // Mood for selected date
  const currentNote = getNoteForDate(selectedDateStr);

  // Dynamic greeting
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  // Habit CRUD handlers
  const handleCreateHabit = async (data: Omit<Habit, 'id' | 'createdAt' | 'archived' | 'order'>) => {
    try {
      await addHabit(data);
      setIsNewHabitOpen(false);
    } catch (err) {
      console.error('Error creating habit:', err);
    }
  };

  const handleUpdateHabit = async (data: Omit<Habit, 'id' | 'createdAt' | 'archived' | 'order'>) => {
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
      {/* Top Banner / Date Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight flex items-center gap-2">
            {greeting} <Sparkles size={20} className="text-[#C9A96E]" />
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Track your discipline, build intentional habits, and reach your peak.
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center bg-white border border-[#E5E7EB] rounded-xl px-2 py-1 shadow-xs">
            <button
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6] transition-colors"
              title="Previous Day"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#1A1A1A]">
              <CalendarIcon size={14} className="text-[#2D5A3D]" />
              <span>{formatDisplayDate(selectedDate)}</span>
              {isSelectedDateToday && (
                <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#2D5A3D]/10 text-[#2D5A3D]">
                  Today
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F4F6] transition-colors"
              title="Next Day"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {!isSelectedDateToday && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
              className="text-xs"
            >
              Back to Today
            </Button>
          )}

          <Button onClick={() => setIsNewHabitOpen(true)} size="sm">
            <Plus size={16} /> Add Habit
          </Button>
        </div>
      </div>

      {/* Motivational Daily Wisdom Quote */}
      <Card className="bg-[#2D5A3D] text-white border-none shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#C9A96E]">
              Daily Discipline Philosophy
            </span>
            <p className="text-sm md:text-base font-medium italic text-white/95">
              "{getDailyQuote()}"
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMoodModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
            >
              <span>{currentNote ? getMoodEmoji(currentNote.mood) : '🙂'}</span>
              <span>{currentNote ? getMoodLabel(currentNote.mood) : 'Log Mood'}</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover onClick={() => navigate('/habits')}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#2D5A3D]/10 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} className="text-[#2D5A3D]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#1A1A1A]">{completedCount}</span>
                <span className="text-xs text-[#9CA3AF]">/ {totalCount}</span>
              </div>
              <p className="text-xs text-[#6B7280] font-medium">Daily Completed</p>
            </div>
          </div>
        </Card>

        <Card hover onClick={() => navigate('/statistics')}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#C9A96E]/15 flex items-center justify-center shrink-0">
              <Flame size={22} className="text-[#C9A96E]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#1A1A1A]">{bestStreak}</span>
                <span className="text-xs text-[#9CA3AF]">days</span>
              </div>
              <p className="text-xs text-[#6B7280] font-medium">Longest Streak</p>
            </div>
          </div>
        </Card>

        <Card hover onClick={() => navigate('/statistics')}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#4A90A4]/15 flex items-center justify-center shrink-0">
              <TrendingUp size={22} className="text-[#4A90A4]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#1A1A1A]">{completionPercent}%</span>
              </div>
              <p className="text-xs text-[#6B7280] font-medium">Day Consistency</p>
            </div>
          </div>
        </Card>

        <Card hover onClick={() => navigate('/focus')}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center shrink-0">
              <Target size={22} className="text-[#8B5CF6]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#1A1A1A]">{totalFocusToday}</span>
                <span className="text-xs text-[#9CA3AF]">mins</span>
              </div>
              <p className="text-xs text-[#6B7280] font-medium">Focus Completed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Two-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Habits */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                {isSelectedDateToday ? "Today's Agenda" : `Agenda for ${format(selectedDate, 'MMM d')}`}
              </h2>
              <p className="text-xs text-[#6B7280]">
                {completedCount} of {totalCount} completed • {totalCount - completedCount} pending
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#4B5563]">
              {scheduledHabits.length} Active Habits
            </span>
          </div>

          {scheduledHabits.length === 0 ? (
            <Card className="text-center py-12 border-dashed">
              <div className="max-w-sm mx-auto space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#2D5A3D]/10 text-[#2D5A3D] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-base font-semibold text-[#1A1A1A]">No habits scheduled</h3>
                <p className="text-xs text-[#6B7280]">
                  You have no habits planned for this date. Create a new habit or adjust frequencies.
                </p>
                <Button size="sm" onClick={() => setIsNewHabitOpen(true)}>
                  <Plus size={16} /> Create Habit
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-2.5">
              {scheduledHabits.map(habit => {
                const log = selectedDateLogs.find(l => l.habitId === habit.id);
                const habitLogs = allLogs.filter(l => l.habitId === habit.id);
                const streak = calculateStreak(habitLogs, habit);
                return (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    log={log}
                    streak={streak}
                    onToggle={() => toggleHabitLog(habit.id, selectedDateStr)}
                    onEdit={() => setEditingHabit(habit)}
                    onArchive={() => archiveHabit(habit.id)}
                    onDelete={() => deleteHabit(habit.id)}
                    onUpdateValue={(v) => updateHabitLogValue(habit.id, selectedDateStr, v)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Ring + Goals + Quick Widgets */}
        <div className="space-y-5">
          {/* Progress Ring Card */}
          <Card className="flex flex-col items-center justify-center py-6 text-center shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-4">
              Consistency Target
            </h3>
            <ProgressRing
              progress={completionPercent}
              size={150}
              strokeWidth={12}
              color="#2D5A3D"
              bgColor="#F3F4F6"
            >
              <div className="text-center">
                <span className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
                  {completionPercent}%
                </span>
                <span className="block text-[11px] font-medium text-[#6B7280]">
                  {completedCount}/{totalCount} Done
                </span>
              </div>
            </ProgressRing>

            <p className="text-xs text-[#6B7280] font-medium mt-4">
              {completionPercent === 100 && totalCount > 0
                ? '🌟 Peak discipline achieved today!'
                : completionPercent >= 50
                ? '⚡ Great momentum! Finish the rest.'
                : '🌱 Every small effort compounds over time.'}
            </p>
          </Card>

          {/* Active Goals Snapshot */}
          <Card className="shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5">
                <Target size={16} className="text-[#2D5A3D]" /> Long-Term Goals
              </h3>
              <button
                onClick={() => navigate('/goals')}
                className="text-xs font-semibold text-[#2D5A3D] hover:underline flex items-center gap-0.5"
              >
                View all <ArrowRight size={12} />
              </button>
            </div>

            {goals.length === 0 ? (
              <p className="text-xs text-[#9CA3AF] py-3 text-center">
                No active goals. Set milestone targets to stay disciplined.
              </p>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 2).map(goal => {
                  const completedM = goal.milestones.filter(m => m.completed).length;
                  const totalM = goal.milestones.length;
                  const pct = totalM > 0 ? Math.round((completedM / totalM) * 100) : 0;
                  return (
                    <div
                      key={goal.id}
                      onClick={() => navigate('/goals')}
                      className="p-3 rounded-lg border border-[#E5E7EB] hover:border-[#D1D5DB] transition-colors cursor-pointer bg-neutral-50/50"
                    >
                      <div className="flex items-center justify-between text-xs font-medium text-[#1A1A1A] mb-1.5">
                        <span className="truncate pr-2">{goal.name}</span>
                        <span className="text-[#2D5A3D] shrink-0 font-bold">{pct}%</span>
                      </div>
                      <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#2D5A3D] h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] mt-1.5">
                        <span>{completedM}/{totalM} milestones</span>
                        <span>Due {goal.targetDate}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Daily Journal Reflection Snapshot */}
          <Card className="shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-[#1A1A1A]">Daily Reflection</h3>
              <button
                onClick={() => navigate('/journal')}
                className="text-xs font-semibold text-[#2D5A3D] hover:underline flex items-center gap-0.5"
              >
                Journal <ArrowRight size={12} />
              </button>
            </div>
            {currentNote?.reflection ? (
              <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB] text-xs text-[#4B5563] italic">
                "{currentNote.reflection}"
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-[#9CA3AF]">No reflection logged for this date.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/journal')}
                  className="text-xs"
                >
                  Write Entry
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* New Habit Modal */}
      <Modal
        isOpen={isNewHabitOpen}
        onClose={() => setIsNewHabitOpen(false)}
        title="Create New Habit"
        size="md"
      >
        <HabitForm
          onSubmit={handleCreateHabit}
          onCancel={() => setIsNewHabitOpen(false)}
        />
      </Modal>

      {/* Edit Habit Modal */}
      <Modal
        isOpen={!!editingHabit}
        onClose={() => setEditingHabit(null)}
        title="Edit Habit"
        size="md"
      >
        {editingHabit && (
          <HabitForm
            habit={editingHabit}
            onSubmit={handleUpdateHabit}
            onCancel={() => setEditingHabit(null)}
          />
        )}
      </Modal>

      {/* Quick Mood Modal */}
      <Modal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
        title="How are you feeling today?"
        size="sm"
      >
        <div className="space-y-4 py-2">
          <div className="flex justify-between items-center px-2">
            {[1, 2, 3, 4, 5].map(m => (
              <button
                key={m}
                onClick={async () => {
                  await saveNote(selectedDateStr, {
                    mood: m,
                    reflection: currentNote?.reflection || '',
                    gratitude: currentNote?.gratitude || '',
                  });
                  setIsMoodModalOpen(false);
                }}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all cursor-pointer ${
                  currentNote?.mood === m
                    ? 'bg-[#2D5A3D]/10 ring-2 ring-[#2D5A3D] scale-105'
                    : 'hover:bg-[#F3F4F6]'
                }`}
              >
                <span className="text-3xl">{getMoodEmoji(m)}</span>
                <span className="text-[10px] font-medium text-[#6B7280]">
                  {getMoodLabel(m)}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-center text-[#9CA3AF]">
            Logging your mood helps uncover links between discipline and wellbeing.
          </p>
        </div>
      </Modal>
    </div>
  );
}
