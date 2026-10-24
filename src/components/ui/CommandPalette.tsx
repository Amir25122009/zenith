import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Target,
  BookHeart,
  Timer,
  Settings,
  Plus,
  Volume2,
  VolumeX,
  X,
  Sparkles,
} from 'lucide-react';
import { useHabits, toggleHabitLog, useTodayLogs } from '../../hooks/useHabits';
import { todayStr } from '../../lib/utils';
import { isAudioMuted, toggleAudioMute, playCheckSound } from '../../lib/sound';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewHabit: () => void;
}

export function CommandPalette({ isOpen, onClose, onOpenNewHabit }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { habits } = useHabits();
  const todayLogs = useTodayLogs();
  const today = todayStr();

  const [query, setQuery] = useState('');
  const [muted, setMuted] = useState(isAudioMuted());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global keydown listener for Esc
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const navCommands = [
    { label: 'Go to Dashboard', icon: LayoutDashboard, action: () => navigate('/') },
    { label: 'Manage Habits', icon: CheckSquare, action: () => navigate('/habits') },
    { label: 'View Calendar & Heatmap', icon: Calendar, action: () => navigate('/calendar') },
    { label: 'View Statistics & Weaknesses', icon: BarChart3, action: () => navigate('/statistics') },
    { label: 'View Goals & Milestones', icon: Target, action: () => navigate('/goals') },
    { label: 'Open Daily Journal', icon: BookHeart, action: () => navigate('/journal') },
    { label: 'Start Focus Study Timer', icon: Timer, action: () => navigate('/focus') },
    { label: 'Open Settings & Cloud Sync', icon: Settings, action: () => navigate('/settings') },
  ].filter(cmd => !q || cmd.label.toLowerCase().includes(q));

  const habitCommands = habits.filter(h =>
    !q || h.name.toLowerCase().includes(q) || h.category.toLowerCase().includes(q)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-[#E5E7EB] flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E7EB]">
          <Search size={18} className="text-[#9CA3AF] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, habit name, or page... (ESC to exit)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#1A1A1A] hover:bg-[#F3F4F6] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Command List Scrollable */}
        <div className="overflow-y-auto p-2 space-y-4 text-xs">
          {/* Quick Actions */}
          <div>
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">
              Quick Actions
            </span>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onClose();
                  onOpenNewHabit();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-[#2D5A3D]/10 hover:text-[#2D5A3D] text-[#1A1A1A] font-medium transition-colors"
              >
                <Plus size={16} className="text-[#2D5A3D]" />
                <span>Create New Habit</span>
              </button>
              <button
                onClick={() => {
                  const n = toggleAudioMute();
                  setMuted(n);
                  if (!n) playCheckSound();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-[#F3F4F6] text-[#1A1A1A] font-medium transition-colors"
              >
                <div className="flex items-center gap-3">
                  {muted ? <VolumeX size={16} className="text-[#B45555]" /> : <Volume2 size={16} className="text-[#2D5A3D]" />}
                  <span>{muted ? 'Enable Zen Sound Effects' : 'Mute Zen Sound Effects'}</span>
                </div>
                <span className="text-[10px] text-[#9CA3AF]">{muted ? 'Muted' : 'Active'}</span>
              </button>
            </div>
          </div>

          {/* Habit Toggles */}
          {habitCommands.length > 0 && (
            <div>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">
                Toggle Today's Habits ({habitCommands.length})
              </span>
              <div className="space-y-0.5">
                {habitCommands.slice(0, 6).map(h => {
                  const isDone = todayLogs.some(l => l.habitId === h.id && l.completed);
                  return (
                    <button
                      key={h.id}
                      onClick={async () => {
                        await toggleHabitLog(h.id, today);
                        if (!isDone) playCheckSound();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-[#F3F4F6] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 text-[10px] ${
                            isDone ? 'bg-[#2D5A3D] text-white border-[#2D5A3D]' : 'border-[#D1D5DB]'
                          }`}
                        >
                          {isDone ? '✓' : ''}
                        </span>
                        <span className={`truncate font-medium ${isDone ? 'line-through text-[#9CA3AF]' : 'text-[#1A1A1A]'}`}>
                          {h.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#9CA3AF] shrink-0 ml-2">{h.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          {navCommands.length > 0 && (
            <div>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1">
                Navigation
              </span>
              <div className="space-y-0.5">
                {navCommands.map(cmd => (
                  <button
                    key={cmd.label}
                    onClick={() => {
                      cmd.action();
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-[#F3F4F6] text-[#4B5563] hover:text-[#1A1A1A] font-medium transition-colors"
                  >
                    <cmd.icon size={16} className="text-[#9CA3AF]" />
                    <span>{cmd.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div className="px-4 py-2.5 bg-[#FAFAFA] border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#9CA3AF]">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E5E7EB] font-mono font-bold text-[#1A1A1A]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E5E7EB] font-mono font-bold text-[#1A1A1A]">K</kbd> anytime</span>
          <span className="flex items-center gap-1"><Sparkles size={12} className="text-[#C9A96E]" /> Zenith Quick Command</span>
        </div>
      </div>
    </div>
  );
}
