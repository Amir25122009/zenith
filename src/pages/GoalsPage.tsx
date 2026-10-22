import { useState } from 'react';
import {
  Plus,
  Target,
  Calendar,
  Trash2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { useGoals } from '../hooks/useGoals';
import { useHabits } from '../hooks/useHabits';
import { HABIT_CATEGORIES } from '../types';
import { differenceInDays, parseISO, format } from 'date-fns';

export function GoalsPage() {
  const {
    goals,
    addGoal,
    deleteGoal,
    toggleMilestone,
    addMilestone,
    removeMilestone,
  } = useGoals();
  const { habits } = useHabits();

  // State
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [newMilestoneInputs, setNewMilestoneInputs] = useState<Record<string, string>>({});

  // Form State for New/Edit Goal
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalCategory, setGoalCategory] = useState<string>('Health & Fitness');
  const [goalTargetDate, setGoalTargetDate] = useState(format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'));
  const [linkedHabits, setLinkedHabits] = useState<string[]>([]);
  const [milestonesInput, setMilestonesInput] = useState<string[]>(['']);

  const handleOpenCreate = () => {
    setGoalName('');
    setGoalDescription('');
    setGoalCategory('Health & Fitness');
    setGoalTargetDate(format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd'));
    setLinkedHabits([]);
    setMilestonesInput(['Initial Milestone']);
    setIsNewGoalModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim()) return;

    const milestones = milestonesInput
      .filter(m => m.trim().length > 0)
      .map((name, idx) => ({
        id: `m-${Date.now()}-${idx}`,
        name: name.trim(),
        completed: false,
      }));

    await addGoal({
      name: goalName.trim(),
      description: goalDescription.trim(),
      category: goalCategory,
      targetDate: goalTargetDate,
      milestones,
      linkedHabitIds: linkedHabits,
    });

    setIsNewGoalModalOpen(false);
  };

  const toggleLinkedHabit = (habitId: string) => {
    setLinkedHabits(prev =>
      prev.includes(habitId) ? prev.filter(id => id !== habitId) : [...prev, habitId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Milestones & Long-Term Goals</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Connect daily micro-habits to macro-outcomes and monitor milestone progress.
          </p>
        </div>
        <Button onClick={handleOpenCreate} size="sm">
          <Plus size={16} /> New Goal
        </Button>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
          <div className="max-w-sm mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#2D5A3D]/10 text-[#2D5A3D] flex items-center justify-center mx-auto">
              <Target size={24} />
            </div>
            <h3 className="text-base font-semibold text-[#1A1A1A]">No goals defined yet</h3>
            <p className="text-xs text-[#6B7280]">
              Create measurable targets and link your daily habits to stay inspired.
            </p>
            <Button size="sm" onClick={handleOpenCreate}>
              <Plus size={16} /> Create First Goal
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map(goal => {
            const completedCount = goal.milestones.filter(m => m.completed).length;
            const totalCount = goal.milestones.length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const daysLeft = differenceInDays(parseISO(goal.targetDate), new Date());
            const linkedHabitObjects = habits.filter(h => goal.linkedHabitIds?.includes(h.id));

            return (
              <Card key={goal.id} className="p-5 flex flex-col justify-between shadow-xs">
                <div>
                  {/* Top Row: Category + Due Date */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-[#2D5A3D] px-2 py-0.5 rounded-full bg-[#2D5A3D]/10">
                      {goal.category}
                    </span>
                    <span className={`font-medium flex items-center gap-1 ${
                      daysLeft < 0 ? 'text-[#B45555]' : daysLeft < 7 ? 'text-[#C9A96E]' : 'text-[#6B7280]'
                    }`}>
                      <Calendar size={13} />
                      {daysLeft < 0 ? 'Overdue' : `${daysLeft} days remaining`}
                    </span>
                  </div>

                  {/* Goal Name & Desc */}
                  <h3 className="text-base font-bold text-[#1A1A1A] mb-1">{goal.name}</h3>
                  {goal.description && (
                    <p className="text-xs text-[#6B7280] mb-3 leading-relaxed">{goal.description}</p>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#6B7280]">Progress</span>
                      <span className="text-[#2D5A3D]">{progress}%</span>
                    </div>
                    <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#2D5A3D] h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  <div className="space-y-2 mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] block">
                      Milestones ({completedCount}/{totalCount})
                    </span>
                    <div className="space-y-1.5">
                      {goal.milestones.map(m => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-[#F9FAFB] text-xs transition-colors"
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={m.completed}
                              onChange={() => toggleMilestone(goal.id, m.id)}
                              className="rounded border-[#D1D5DB] text-[#2D5A3D] focus:ring-[#2D5A3D] cursor-pointer"
                            />
                            <span className={`truncate ${m.completed ? 'line-through text-[#9CA3AF]' : 'text-[#1A1A1A]'}`}>
                              {m.name}
                            </span>
                          </label>
                          <button
                            onClick={() => removeMilestone(goal.id, m.id)}
                            className="text-[#D1D5DB] hover:text-[#B45555] p-1 transition-colors cursor-pointer"
                            title="Remove milestone"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Milestone Input */}
                    <div className="flex gap-1.5 pt-1">
                      <input
                        type="text"
                        placeholder="Add next step..."
                        value={newMilestoneInputs[goal.id] || ''}
                        onChange={e => setNewMilestoneInputs({ ...newMilestoneInputs, [goal.id]: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && (newMilestoneInputs[goal.id] || '').trim()) {
                            addMilestone(goal.id, newMilestoneInputs[goal.id].trim());
                            setNewMilestoneInputs({ ...newMilestoneInputs, [goal.id]: '' });
                          }
                        }}
                        className="flex-1 px-2.5 py-1 text-xs border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#2D5A3D]"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          if ((newMilestoneInputs[goal.id] || '').trim()) {
                            addMilestone(goal.id, newMilestoneInputs[goal.id].trim());
                            setNewMilestoneInputs({ ...newMilestoneInputs, [goal.id]: '' });
                          }
                        }}
                        className="text-xs px-2.5 py-1"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Linked Habits Tags */}
                  {linkedHabitObjects.length > 0 && (
                    <div className="pt-2 border-t border-[#E5E7EB]">
                      <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">
                        Supporting Habits
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {linkedHabitObjects.map(h => (
                          <span
                            key={h.id}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#F3F4F6] text-[#4B5563]"
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: h.color }} />
                            <span>{h.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-[#E5E7EB]">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteGoal(goal.id)}
                    className="text-xs text-[#B45555] hover:bg-rose-50"
                  >
                    Delete Goal
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal
        isOpen={isNewGoalModalOpen}
        onClose={() => setIsNewGoalModalOpen(false)}
        title="Establish a Goal"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 py-1">
          <Input
            label="Goal Title"
            placeholder="e.g. Run 10k Marathon, Read 10 Books"
            value={goalName}
            onChange={e => setGoalName(e.target.value)}
            required
          />

          <Textarea
            label="Purpose & Vision (optional)"
            placeholder="Why does this goal matter to your personal growth?"
            value={goalDescription}
            onChange={e => setGoalDescription(e.target.value)}
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={goalCategory}
              onChange={e => setGoalCategory(e.target.value)}
              options={HABIT_CATEGORIES.map(c => ({ value: c, label: c }))}
            />

            <Input
              label="Target Date"
              type="date"
              value={goalTargetDate}
              onChange={e => setGoalTargetDate(e.target.value)}
              required
            />
          </div>

          {/* Linked Habits Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#1A1A1A]">
              Supporting Habits (Daily systems to achieve this)
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-1.5 border border-[#E5E7EB] rounded-lg">
              {habits.map(h => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => toggleLinkedHabit(h.id)}
                  className={`flex items-center gap-1.5 p-1.5 rounded-md text-xs text-left transition-colors cursor-pointer ${
                    linkedHabits.includes(h.id)
                      ? 'bg-[#2D5A3D]/10 text-[#2D5A3D] font-semibold'
                      : 'hover:bg-[#F3F4F6] text-[#6B7280]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                  <span className="truncate">{h.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="secondary" onClick={() => setIsNewGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
