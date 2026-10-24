import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Check, MoreHorizontal, Archive, Pencil, Trash2 } from 'lucide-react';
import type { Habit, HabitLog } from '../../types';
import { cn } from '../../lib/utils';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  streak: number;
  onToggle: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onUpdateValue?: (value: number) => void;
}

export function HabitCard({ habit, log, streak, onToggle, onEdit, onArchive, onDelete, onUpdateValue }: HabitCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  
  // Safe icon lookup with fallback
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[habit.icon] || LucideIcons.Target;
  const isCompleted = log?.completed || false;

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  return (
    <div className={cn(
      'group flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all duration-200',
      isCompleted
        ? 'bg-[#2D5A3D]/5 border-[#2D5A3D]/25 shadow-xs'
        : 'bg-white border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-xs'
    )}>
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Toggle */}
        {habit.target.type === 'boolean' ? (
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              'w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer',
              isCompleted
                ? 'border-[#2D5A3D] bg-[#2D5A3D] text-white'
                : 'border-[#D1D5DB] hover:border-[#2D5A3D] bg-white'
            )}
            aria-label={`Toggle habit ${habit.name}`}
          >
            {isCompleted && <Check size={16} strokeWidth={3} />}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <input
              type="number"
              min={0}
              max={999}
              value={log?.value || 0}
              onChange={(e) => onUpdateValue?.(Number(e.target.value))}
              className={cn(
                'w-16 h-8 text-center rounded-lg border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]',
                isCompleted ? 'border-[#2D5A3D] bg-[#2D5A3D]/10 text-[#2D5A3D]' : 'border-[#D1D5DB] bg-white'
              )}
            />
            <span className="text-xs text-[#9CA3AF]">/ {habit.target.value} {habit.target.unit}</span>
          </div>
        )}

        {/* Icon */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: habit.color + '20', color: habit.color }}
        >
          <IconComponent size={18} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              'text-sm font-medium truncate',
              isCompleted ? 'text-[#2D5A3D] line-through opacity-75' : 'text-[#1A1A1A]'
            )}>
              {habit.name}
            </h3>
            {habit.type === 'break' && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200">
                Break
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#9CA3AF]">
            <span>{habit.category}</span>
            {streak > 0 && (
              <>
                <span>•</span>
                <span className="font-medium text-[#C9A96E] flex items-center gap-0.5">
                  🔥 {streak}{habit.frequency.type === 'times_per_week' ? 'w' : 'd'} streak
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Menu / Actions */}
      <div className="relative flex items-center gap-1" ref={menuRef}>
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#1A1A1A] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          aria-label="Habit options"
        >
          <MoreHorizontal size={18} />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-9 w-36 bg-white border border-[#E5E7EB] rounded-xl shadow-lg py-1.5 z-20">
            <button
              type="button"
              onClick={() => { onEdit(); setShowMenu(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#1A1A1A] hover:bg-[#F3F4F6] text-left cursor-pointer"
            >
              <Pencil size={14} className="text-[#6B7280]" /> Edit
            </button>
            <button
              type="button"
              onClick={() => { onArchive(); setShowMenu(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#1A1A1A] hover:bg-[#F3F4F6] text-left cursor-pointer"
            >
              <Archive size={14} className="text-[#6B7280]" /> Archive
            </button>
            <div className="h-px bg-[#E5E7EB] my-1" />
            <button
              type="button"
              onClick={() => { onDelete(); setShowMenu(false); }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#B45555] hover:bg-rose-50 text-left cursor-pointer"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
