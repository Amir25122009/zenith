import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Input';
import { Select } from '../ui/Select';
import type { Habit, HabitType, FrequencyType, TargetType } from '../../types';
import { HABIT_CATEGORIES, HABIT_ICONS, HABIT_COLORS } from '../../types';
import * as LucideIcons from 'lucide-react';

interface HabitFormProps {
  habit?: Habit;
  onSubmit: (data: Omit<Habit, 'id' | 'createdAt' | 'archived' | 'order'>) => void;
  onCancel: () => void;
}

export function HabitForm({ habit, onSubmit, onCancel }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || '');
  const [nameError, setNameError] = useState('');
  const [description, setDescription] = useState(habit?.description || '');
  const [icon, setIcon] = useState(habit?.icon || 'Target');
  const [color, setColor] = useState(habit?.color || '#2D5A3D');
  const [category, setCategory] = useState(habit?.category || 'Health & Fitness');
  const [type, setType] = useState<HabitType>(habit?.type || 'build');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(habit?.frequency?.type || 'daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(habit?.frequency?.daysOfWeek || [1, 2, 3, 4, 5]);
  const [timesPerWeek, setTimesPerWeek] = useState(habit?.frequency?.timesPerWeek || 3);
  const [targetType, setTargetType] = useState<TargetType>(habit?.target?.type || 'boolean');
  const [targetUnit, setTargetUnit] = useState(habit?.target?.unit || '');
  const [targetValue, setTargetValue] = useState(habit?.target?.value || 1);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Please enter a habit name');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      category,
      type,
      frequency: {
        type: frequencyType,
        ...(frequencyType === 'specific_days' ? { daysOfWeek } : {}),
        ...(frequencyType === 'times_per_week' ? { timesPerWeek } : {}),
      },
      target: {
        type: targetType,
        ...(targetType === 'numeric' ? { unit: targetUnit, value: targetValue } : {}),
      },
    });
  }

  function toggleDay(day: number) {
    setDaysOfWeek(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }

  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[icon] || LucideIcons.Target;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <Input
        label="Habit Name"
        value={name}
        onChange={e => {
          setName(e.target.value);
          if (nameError) setNameError('');
        }}
        error={nameError}
        placeholder="e.g., Morning meditation"
        required
      />

      {/* Description */}
      <Textarea
        label="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Why is this habit important to you?"
        rows={2}
      />

      {/* Type */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-[#1A1A1A]">Type</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('build')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors ${
              type === 'build'
                ? 'border-[#2D5A3D] bg-[#2D5A3D]/10 text-[#2D5A3D]'
                : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
            }`}
          >
            ✅ Build
          </button>
          <button
            type="button"
            onClick={() => setType('break')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors ${
              type === 'break'
                ? 'border-[#B45555] bg-[#B45555]/10 text-[#B45555]'
                : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
            }`}
          >
            🚫 Break
          </button>
        </div>
      </div>

      {/* Category */}
      <Select
        label="Category"
        value={category}
        onChange={e => setCategory(e.target.value)}
        options={HABIT_CATEGORIES.map(c => ({ value: c, label: c }))}
      />

      {/* Icon & Color */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[#1A1A1A]">Icon</label>
          <button
            type="button"
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm hover:border-[#D1D5DB] transition-colors"
          >
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: color + '20', color }}>
              <IconComponent size={14} />
            </div>
            <span className="text-[#6B7280]">{icon}</span>
          </button>
          {showIconPicker && (
            <div className="grid grid-cols-6 gap-1 p-2 border border-[#E5E7EB] rounded-lg max-h-32 overflow-y-auto bg-white">
              {HABIT_ICONS.map(iconName => {
                const IC = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[iconName];
                if (!IC) return null;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => { setIcon(iconName); setShowIconPicker(false); }}
                    className={`p-2 rounded hover:bg-[#F3F4F6] ${icon === iconName ? 'bg-[#2D5A3D]/10 text-[#2D5A3D]' : 'text-[#6B7280]'}`}
                  >
                    <IC size={16} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[#1A1A1A]">Color</label>
          <div className="grid grid-cols-4 gap-1.5 p-2 border border-[#E5E7EB] rounded-lg">
            {HABIT_COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'border-[#1A1A1A] scale-110' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Frequency */}
      <div className="space-y-2">
        <Select
          label="Frequency"
          value={frequencyType}
          onChange={e => setFrequencyType(e.target.value as FrequencyType)}
          options={[
            { value: 'daily', label: 'Every day' },
            { value: 'specific_days', label: 'Specific days' },
            { value: 'times_per_week', label: 'Times per week' },
          ]}
        />

        {frequencyType === 'specific_days' && (
          <div className="flex gap-1.5">
            {dayLabels.map((label, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => toggleDay(idx)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  daysOfWeek.includes(idx)
                    ? 'border-[#2D5A3D] bg-[#2D5A3D] text-white'
                    : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {frequencyType === 'times_per_week' && (
          <Input
            type="number"
            min={1}
            max={7}
            value={timesPerWeek}
            onChange={e => setTimesPerWeek(Number(e.target.value))}
            label="Times per week"
          />
        )}
      </div>

      {/* Target */}
      <div className="space-y-2">
        <Select
          label="Tracking Type"
          value={targetType}
          onChange={e => setTargetType(e.target.value as TargetType)}
          options={[
            { value: 'boolean', label: 'Yes / No (checkbox)' },
            { value: 'numeric', label: 'Numeric value' },
          ]}
        />

        {targetType === 'numeric' && (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Value"
              type="number"
              min={1}
              value={targetValue}
              onChange={e => setTargetValue(Number(e.target.value))}
            />
            <Input
              label="Unit"
              value={targetUnit}
              onChange={e => setTargetUnit(e.target.value)}
              placeholder="e.g., glasses, minutes, pages"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1">
          {habit ? 'Update Habit' : 'Create Habit'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
