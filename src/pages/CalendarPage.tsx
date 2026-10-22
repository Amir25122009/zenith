import { useState } from 'react';
import {
  format,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  subDays,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { HabitCard } from '../components/habits/HabitCard';
import { useHabits, useAllHabitLogs, toggleHabitLog, updateHabitLogValue } from '../hooks/useHabits';
import { useJournal } from '../hooks/useJournal';
import {
  formatDate,
  formatDisplayDate,
  isHabitScheduledForDate,
  calculateStreak,
  getMoodEmoji,
  getMoodLabel,
} from '../lib/utils';

export function CalendarPage() {
  const { habits } = useHabits();
  const allLogs = useAllHabitLogs();
  const { getNoteForDate } = useJournal();

  // Current calendar month view
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  // Selected day for day-detail modal
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // View mode: monthly grid or yearly heatmap
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  // Month days generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Yearly heatmap days (last 180 days or year)
  const heatmapDays = eachDayOfInterval({
    start: subDays(new Date(), 119), // 17 weeks
    end: new Date(),
  });

  // Calculate day completion stats
  const getDayStats = (date: Date) => {
    const dateStr = formatDate(date);
    const scheduled = habits.filter(h => isHabitScheduledForDate(h, date));
    if (scheduled.length === 0) return { scheduled: 0, completed: 0, rate: 0 };

    const logsForDay = allLogs.filter(l => l.date === dateStr);
    const completed = scheduled.filter(h => {
      const log = logsForDay.find(l => l.habitId === h.id);
      return log?.completed;
    }).length;

    const rate = Math.round((completed / scheduled.length) * 100);
    return { scheduled: scheduled.length, completed, rate };
  };

  // Monthly stats
  const daysInCurrentMonth = calendarDays.filter(d => isSameMonth(d, currentMonth));
  const monthStatsArray = daysInCurrentMonth.map(d => getDayStats(d));
  const activeDaysWithHabits = monthStatsArray.filter(s => s.scheduled > 0);
  const averageMonthRate = activeDaysWithHabits.length > 0
    ? Math.round(activeDaysWithHabits.reduce((acc, curr) => acc + curr.rate, 0) / activeDaysWithHabits.length)
    : 0;
  const totalCompletedMonth = activeDaysWithHabits.reduce((acc, curr) => acc + curr.completed, 0);

  // Selected Day Details
  const selectedDayStr = selectedDay ? formatDate(selectedDay) : '';
  const selectedDayScheduled = selectedDay
    ? habits.filter(h => isHabitScheduledForDate(h, selectedDay))
    : [];
  const selectedDayLogs = selectedDay
    ? allLogs.filter(l => l.date === selectedDayStr)
    : [];
  const selectedDayNote = selectedDay ? getNoteForDate(selectedDayStr) : undefined;

  // Color generator for cell
  const getHeatmapBg = (rate: number, hasScheduled: boolean) => {
    if (!hasScheduled) return 'bg-[#F9FAFB] text-[#D1D5DB]';
    if (rate === 0) return 'bg-[#F3F4F6] text-[#6B7280]';
    if (rate < 35) return 'bg-[#2D5A3D]/20 text-[#2D5A3D] font-semibold';
    if (rate < 70) return 'bg-[#2D5A3D]/40 text-[#1e3d2a] font-semibold';
    if (rate < 100) return 'bg-[#2D5A3D]/70 text-white font-semibold';
    return 'bg-[#2D5A3D] text-white font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Calendar & Consistency Heatmap</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Visualize consistency trends and backfill or review any day's history.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'month' ? 'bg-white text-[#1A1A1A] shadow-xs' : 'text-[#6B7280]'
            }`}
          >
            Monthly Calendar
          </button>
          <button
            onClick={() => setViewMode('year')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              viewMode === 'year' ? 'bg-white text-[#1A1A1A] shadow-xs' : 'text-[#6B7280]'
            }`}
          >
            Consistency Heatmap
          </button>
        </div>
      </div>

      {/* Monthly Summary Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <span className="text-[11px] font-medium text-[#6B7280] block mb-1">Monthly Consistency</span>
          <span className="text-2xl font-bold text-[#2D5A3D]">{averageMonthRate}%</span>
        </Card>
        <Card>
          <span className="text-[11px] font-medium text-[#6B7280] block mb-1">Habits Completed</span>
          <span className="text-2xl font-bold text-[#1A1A1A]">{totalCompletedMonth}</span>
        </Card>
        <Card>
          <span className="text-[11px] font-medium text-[#6B7280] block mb-1">Active Habits</span>
          <span className="text-2xl font-bold text-[#1A1A1A]">{habits.length}</span>
        </Card>
        <Card>
          <span className="text-[11px] font-medium text-[#6B7280] block mb-1">Month Focus</span>
          <span className="text-2xl font-bold text-[#C9A96E]">{format(currentMonth, 'MMMM')}</span>
        </Card>
      </div>

      {viewMode === 'month' ? (
        /* Month View */
        <Card className="p-4 sm:p-6 shadow-xs">
          {/* Calendar Navigation Bar */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <CalendarIcon size={18} className="text-[#2D5A3D]" />
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
                className="text-xs"
              >
                Today
              </Button>
              <div className="flex items-center border border-[#E5E7EB] rounded-lg bg-white">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-xs font-bold text-[#6B7280] py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day, idx) => {
              const inCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);
              const { scheduled, completed, rate } = getDayStats(day);
              const note = getNoteForDate(formatDate(day));

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[70px] sm:min-h-[88px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    inCurrentMonth
                      ? 'bg-white border-[#E5E7EB] hover:border-[#2D5A3D] hover:shadow-xs'
                      : 'bg-[#F9FAFB] border-transparent opacity-40'
                  } ${isTodayDate ? 'ring-2 ring-[#2D5A3D]' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isTodayDate ? 'text-[#2D5A3D]' : 'text-[#1A1A1A]'}`}>
                      {format(day, 'd')}
                    </span>
                    {note && (
                      <span className="text-xs" title={`Mood: ${getMoodLabel(note.mood)}`}>
                        {getMoodEmoji(note.mood)}
                      </span>
                    )}
                  </div>

                  {scheduled > 0 ? (
                    <div className="mt-1">
                      <div className="flex items-center justify-between text-[10px] text-[#6B7280] mb-1">
                        <span>{completed}/{scheduled}</span>
                        <span className="font-semibold text-[#2D5A3D]">{rate}%</span>
                      </div>
                      <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#2D5A3D] h-full rounded-full transition-all duration-300"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-[#D1D5DB] italic">Rest</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Color Scale Legend */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-6 mt-6 border-t border-[#E5E7EB] text-xs text-[#6B7280]">
            <span>Click any day to inspect details or backfill habits</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="w-3.5 h-3.5 rounded bg-[#F3F4F6] border border-[#E5E7EB]" title="0%" />
              <span className="w-3.5 h-3.5 rounded bg-[#2D5A3D]/20" title="1-34%" />
              <span className="w-3.5 h-3.5 rounded bg-[#2D5A3D]/40" title="35-69%" />
              <span className="w-3.5 h-3.5 rounded bg-[#2D5A3D]/70" title="70-99%" />
              <span className="w-3.5 h-3.5 rounded bg-[#2D5A3D]" title="100%" />
              <span>More</span>
            </div>
          </div>
        </Card>
      ) : (
        /* GitHub-style Consistency Heatmap */
        <Card className="p-4 sm:p-6 shadow-xs">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <Sparkles size={18} className="text-[#C9A96E]" />
              Habit Momentum Heatmap (Last 120 Days)
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Consistent small actions create compound discipline. Each square represents your daily completion.
            </p>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 p-2">
              {heatmapDays.map((day, idx) => {
                const { scheduled, rate } = getDayStats(day);
                const isTodayDate = isToday(day);
                const bgClass = getHeatmapBg(rate, scheduled > 0);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(day)}
                    className={`w-4 h-4 rounded-xs transition-transform hover:scale-125 cursor-pointer ${bgClass} ${
                      isTodayDate ? 'ring-2 ring-[#C9A96E]' : ''
                    }`}
                    title={`${format(day, 'MMM d, yyyy')}: ${rate}% completed (${scheduled} scheduled)`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#6B7280] mt-4 pt-4 border-t border-[#E5E7EB]">
            <span>120 Days of Continuous Tracking</span>
            <div className="flex items-center gap-1.5">
              <span>0%</span>
              <span className="w-3 h-3 rounded-xs bg-[#F3F4F6]" />
              <span className="w-3 h-3 rounded-xs bg-[#2D5A3D]/20" />
              <span className="w-3 h-3 rounded-xs bg-[#2D5A3D]/40" />
              <span className="w-3 h-3 rounded-xs bg-[#2D5A3D]/70" />
              <span className="w-3 h-3 rounded-xs bg-[#2D5A3D]" />
              <span>100%</span>
            </div>
          </div>
        </Card>
      )}

      {/* Day Detail & Backfilling Modal */}
      <Modal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? formatDisplayDate(selectedDay) : ''}
        size="md"
      >
        {selectedDay && (
          <div className="space-y-4 py-1">
            {/* Day Header Metric */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#2D5A3D]/10 text-[#2D5A3D]">
              <span className="text-xs font-semibold">Daily Consistency Score</span>
              <span className="text-base font-bold">
                {getDayStats(selectedDay).rate}% ({getDayStats(selectedDay).completed}/{getDayStats(selectedDay).scheduled})
              </span>
            </div>

            {/* Scheduled Habits for Day */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Scheduled Habits (Click to toggle & backfill)
              </h4>

              {selectedDayScheduled.length === 0 ? (
                <p className="text-xs text-[#9CA3AF] py-4 text-center">
                  No habits were scheduled for this day.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDayScheduled.map(habit => {
                    const log = selectedDayLogs.find(l => l.habitId === habit.id);
                    const habitLogs = allLogs.filter(l => l.habitId === habit.id);
                    const streak = calculateStreak(habitLogs, habit);

                    return (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        log={log}
                        streak={streak}
                        onToggle={() => toggleHabitLog(habit.id, selectedDayStr)}
                        onEdit={() => {}}
                        onArchive={() => {}}
                        onDelete={() => {}}
                        onUpdateValue={(v) => updateHabitLogValue(habit.id, selectedDayStr, v)}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reflection Note for Selected Day */}
            {selectedDayNote && (
              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1A1A]">
                  <span>{getMoodEmoji(selectedDayNote.mood)}</span>
                  <span>Daily Reflection ({getMoodLabel(selectedDayNote.mood)})</span>
                </div>
                {selectedDayNote.reflection && (
                  <p className="text-xs text-[#4B5563] italic">"{selectedDayNote.reflection}"</p>
                )}
                {selectedDayNote.gratitude && (
                  <p className="text-xs text-[#6B7280]">Gratitude: {selectedDayNote.gratitude}</p>
                )}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setSelectedDay(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
