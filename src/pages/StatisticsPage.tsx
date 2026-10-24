import { useState, useMemo } from 'react';
import {
  subDays,
  format,
  eachDayOfInterval,
} from 'date-fns';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  Flame,
  Award,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useHabits, useAllHabitLogs } from '../hooks/useHabits';
import {
  calculateStreak,
  calculateLongestStreak,
  calculateCompletionRate,
  isHabitScheduledForDate,
  formatDate,
} from '../lib/utils';
import { HABIT_CATEGORIES } from '../types';

export function StatisticsPage() {
  const { habits } = useHabits();
  const allLogs = useAllHabitLogs();

  // Timeframe filter: 7, 30, 90 days
  const [timeframe, setTimeframe] = useState<7 | 30 | 90>(30);

  // Timeframe dates
  const daysInterval = useMemo(() => {
    return eachDayOfInterval({
      start: subDays(new Date(), timeframe - 1),
      end: new Date(),
    });
  }, [timeframe]);

  // Overall Completion Trend data
  const trendData = useMemo(() => {
    return daysInterval.map(day => {
      const dateStr = formatDate(day);
      const scheduled = habits.filter(h => isHabitScheduledForDate(h, day));
      if (scheduled.length === 0) {
        return {
          date: format(day, timeframe === 7 ? 'EEE' : 'MMM d'),
          rate: 100,
          completed: 0,
          total: 0,
        };
      }
      const dayLogs = allLogs.filter(l => l.date === dateStr);
      const completed = scheduled.filter(h => {
        const log = dayLogs.find(l => l.habitId === h.id);
        return log?.completed;
      }).length;

      const rate = Math.round((completed / scheduled.length) * 100);
      return {
        date: format(day, timeframe === 7 ? 'EEE' : 'MMM d'),
        rate,
        completed,
        total: scheduled.length,
      };
    });
  }, [daysInterval, habits, allLogs, timeframe]);

  // Habit performance breakdown
  const habitPerformance = useMemo(() => {
    return habits.map(habit => {
      const habitLogs = allLogs.filter(l => l.habitId === habit.id);
      const rate = calculateCompletionRate(habitLogs, timeframe);
      const currentStreak = calculateStreak(habitLogs, habit);
      const longestStreak = calculateLongestStreak(habitLogs, habit);
      const totalCompleted = habitLogs.filter(l => l.completed).length;

      return {
        id: habit.id,
        name: habit.name,
        category: habit.category,
        color: habit.color,
        frequencyType: habit.frequency.type,
        rate,
        currentStreak,
        longestStreak,
        totalCompleted,
      };
    }).sort((a, b) => b.rate - a.rate);
  }, [habits, allLogs, timeframe]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const counts: Record<string, { total: number; completed: number }> = {};

    HABIT_CATEGORIES.forEach(cat => {
      counts[cat] = { total: 0, completed: 0 };
    });

    daysInterval.forEach(day => {
      const dateStr = formatDate(day);
      habits.forEach(habit => {
        if (!isHabitScheduledForDate(habit, day)) return;
        if (!counts[habit.category]) counts[habit.category] = { total: 0, completed: 0 };
        counts[habit.category].total += 1;

        const isDone = allLogs.some(l => l.habitId === habit.id && l.date === dateStr && l.completed);
        if (isDone) counts[habit.category].completed += 1;
      });
    });

    return Object.entries(counts)
      .filter(([_, val]) => val.total > 0)
      .map(([name, val]) => ({
        name,
        rate: Math.round((val.completed / val.total) * 100),
        completed: val.completed,
      }));
  }, [daysInterval, habits, allLogs]);

  // Key summary stats
  const averageRate = trendData.length > 0
    ? Math.round(trendData.reduce((acc, d) => acc + d.rate, 0) / trendData.length)
    : 0;

  const totalCompletions = trendData.reduce((acc, d) => acc + d.completed, 0);

  const bestPerformingHabit = habitPerformance[0];
  const weakestHabits = habitPerformance.filter(h => h.rate < 50);

  // Consistency Grade
  const getGrade = (rate: number) => {
    if (rate >= 90) return { grade: 'A+', color: 'text-[#2D5A3D]' };
    if (rate >= 80) return { grade: 'A', color: 'text-[#2D5A3D]' };
    if (rate >= 70) return { grade: 'B', color: 'text-[#4A90A4]' };
    if (rate >= 60) return { grade: 'C', color: 'text-[#C9A96E]' };
    return { grade: 'D', color: 'text-[#B45555]' };
  };

  const { grade, color: gradeColor } = getGrade(averageRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Consistency Statistics</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Measure performance, spot weaknesses, and optimize your routine over time.
          </p>
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] rounded-xl self-start sm:self-auto">
          {[
            { value: 7, label: '7 Days' },
            { value: 30, label: '30 Days' },
            { value: 90, label: '90 Days' },
          ].map(t => (
            <button
              key={t.value}
              onClick={() => setTimeframe(t.value as 7 | 30 | 90)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timeframe === t.value ? 'bg-white text-[#1A1A1A] shadow-xs' : 'text-[#6B7280]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#6B7280] font-medium">Consistency Grade</p>
              <p className={`text-3xl font-extrabold mt-1 ${gradeColor}`}>{grade}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#2D5A3D]/10 flex items-center justify-center text-[#2D5A3D]">
              <Award size={20} />
            </div>
          </div>
          <p className="text-[11px] text-[#9CA3AF] mt-2">{averageRate}% overall average</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#6B7280] font-medium">Total Check-ins</p>
              <p className="text-3xl font-extrabold text-[#1A1A1A] mt-1">{totalCompletions}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#4A90A4]/10 flex items-center justify-center text-[#4A90A4]">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p className="text-[11px] text-[#9CA3AF] mt-2">Across last {timeframe} days</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#6B7280] font-medium">Top Performer</p>
              <p className="text-base font-bold text-[#1A1A1A] mt-1 truncate max-w-[120px]">
                {bestPerformingHabit?.name || 'N/A'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/15 flex items-center justify-center text-[#C9A96E]">
              <Flame size={20} />
            </div>
          </div>
          <p className="text-[11px] text-[#2D5A3D] font-medium mt-2">
            {bestPerformingHabit ? `${bestPerformingHabit.rate}% consistency` : 'No data'}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#6B7280] font-medium">Attention Needed</p>
              <p className="text-3xl font-extrabold text-[#B45555] mt-1">{weakestHabits.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#B45555]/10 flex items-center justify-center text-[#B45555]">
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-[11px] text-[#9CA3AF] mt-2">Habits below 50% rate</p>
        </Card>
      </div>

      {/* Main Completion Trend Area Chart */}
      <Card className="p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#1A1A1A]">Daily Completion Momentum</h3>
            <p className="text-xs text-[#6B7280]">
              Overall completion percentage trajectory over the last {timeframe} days.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#2D5A3D]/10 text-[#2D5A3D]">
            Avg {averageRate}%
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D5A3D" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2D5A3D" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
                formatter={(val) => [`${val}%`, 'Completion Rate']}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#2D5A3D"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRate)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Habit Comparison Bar Chart & Weakness Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit Performance Comparison Bar Chart */}
        <Card className="p-4 sm:p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#1A1A1A] mb-1">Habit Consistency Comparison</h3>
          <p className="text-xs text-[#6B7280] mb-4">
            Percentage completion per habit during this timeframe.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={habitPerformance}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#1A1A1A' }}
                  width={110}
                  tickFormatter={(val) => (val.length > 14 ? `${val.slice(0, 14)}...` : val)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [`${val}%`, 'Rate']}
                />
                <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                  {habitPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#2D5A3D'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#1A1A1A] mb-1">Consistency by Category</h3>
            <p className="text-xs text-[#6B7280] mb-4">
              Identify which life areas you excel in vs require reinforcement.
            </p>

            <div className="space-y-3.5">
              {categoryData.map(cat => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#1A1A1A]">{cat.name}</span>
                    <span className="text-[#2D5A3D]">{cat.rate}%</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2D5A3D] h-full rounded-full transition-all duration-300"
                      style={{ width: `${cat.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weakness Detection Card */}
          {weakestHabits.length > 0 && (
            <div className="mt-6 p-3 rounded-xl bg-rose-50/70 border border-rose-200">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold mb-1">
                <AlertTriangle size={15} /> Weakness Detection
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                {weakestHabits.map(h => h.name).join(', ')} {weakestHabits.length === 1 ? 'has' : 'have'} fallen below 50% consistency. Consider reducing target friction or pairing with a morning anchor.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Habit Detailed Leaderboard Table */}
      <Card className="p-4 sm:p-6 shadow-xs overflow-x-auto">
        <h3 className="text-base font-bold text-[#1A1A1A] mb-1">Habit Performance Ledger</h3>
        <p className="text-xs text-[#6B7280] mb-4">
          Detailed metrics including current streaks, personal bests, and total lifetime logs.
        </p>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
              <th className="pb-3 font-semibold">Habit</th>
              <th className="pb-3 font-semibold">Category</th>
              <th className="pb-3 font-semibold text-center">{timeframe}d Rate</th>
              <th className="pb-3 font-semibold text-center">Current Streak</th>
              <th className="pb-3 font-semibold text-center">Longest Streak</th>
              <th className="pb-3 font-semibold text-right">Total Completions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {habitPerformance.map(h => (
              <tr key={h.id} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="py-3 font-medium text-[#1A1A1A] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: h.color }} />
                  <span>{h.name}</span>
                </td>
                <td className="py-3 text-[#6B7280]">{h.category}</td>
                <td className="py-3 text-center">
                  <span className="px-2 py-0.5 rounded-md font-bold bg-[#2D5A3D]/10 text-[#2D5A3D]">
                    {h.rate}%
                  </span>
                </td>
                <td className="py-3 text-center font-semibold text-[#C9A96E]">
                  🔥 {h.currentStreak}{h.frequencyType === 'times_per_week' ? 'w' : 'd'}
                </td>
                <td className="py-3 text-center text-[#6B7280]">
                  {h.longestStreak}{h.frequencyType === 'times_per_week' ? 'w' : 'd'}
                </td>
                <td className="py-3 text-right font-semibold text-[#1A1A1A]">
                  {h.totalCompleted}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
