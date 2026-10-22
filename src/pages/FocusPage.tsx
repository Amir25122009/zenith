import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Timer,
  CheckCircle2,
  Coffee,
  Brain,
  Clock,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ProgressRing } from '../components/ui/ProgressRing';
import { useFocusTimer } from '../hooks/useFocusTimer';

export function FocusPage() {
  const {
    formattedTime,
    state,
    progress,
    totalFocusToday,
    todaySessions,
    label,
    minutes,
    breakMinutes,
    setLabel,
    setMinutes,
    setBreakMinutes,
    start,
    pause,
    resume,
    reset,
    skip,
  } = useFocusTimer();

  const presets = [
    { label: 'Pomodoro', focus: 25, rest: 5 },
    { label: 'Deep Work', focus: 50, rest: 10 },
    { label: 'Quick Sprint', focus: 15, rest: 3 },
    { label: 'Ultra Marathon', focus: 90, rest: 15 },
  ];

  const handleSelectPreset = (focus: number, rest: number) => {
    if (state === 'idle') {
      setMinutes(focus);
      setBreakMinutes(rest);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Focus & Deep Work Timer</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            Eliminate phone distractions, enter flow state, and log productive study hours.
          </p>
        </div>

        {/* Daily Total Summary */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-[#2D5A3D]/10 text-[#2D5A3D] text-xs font-bold flex items-center gap-1.5">
            <Clock size={15} />
            <span>{totalFocusToday} mins focused today</span>
          </div>
        </div>
      </div>

      {/* Main Focus Console */}
      <Card className="p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-xs">
        {/* State Banner */}
        <div className="mb-6">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            state === 'break'
              ? 'bg-[#C9A96E]/15 text-[#92700E]'
              : state === 'running'
              ? 'bg-[#2D5A3D]/15 text-[#2D5A3D]'
              : 'bg-[#F3F4F6] text-[#6B7280]'
          }`}>
            {state === 'break' ? (
              <>
                <Coffee size={14} /> Short Break — Recharge
              </>
            ) : state === 'running' ? (
              <>
                <Brain size={14} /> In Flow State
              </>
            ) : (
              <>
                <Timer size={14} /> Ready to Focus
              </>
            )}
          </span>
        </div>

        {/* Big Circular Timer Display */}
        <div className="relative my-2">
          <ProgressRing
            progress={progress}
            size={240}
            strokeWidth={14}
            color={state === 'break' ? '#C9A96E' : '#2D5A3D'}
            bgColor="#F3F4F6"
          >
            <div className="text-center">
              <span className="text-5xl sm:text-6xl font-black text-[#1A1A1A] tracking-tight font-mono">
                {formattedTime}
              </span>
              <span className="block text-xs font-semibold text-[#6B7280] mt-1">
                {state === 'break' ? `${breakMinutes}m break` : `${minutes}m session`}
              </span>
            </div>
          </ProgressRing>
        </div>

        {/* Focus Intent / Subject Label */}
        <div className="w-full max-w-xs mt-6 mb-4">
          <Input
            placeholder="What are you working on? (e.g. Coding, Math)"
            value={label}
            onChange={e => setLabel(e.target.value)}
            disabled={state === 'running'}
            className="text-center text-xs"
          />
        </div>

        {/* Timer Controls Buttons */}
        <div className="flex items-center gap-3 mt-2">
          {state === 'idle' && (
            <Button size="lg" onClick={start} className="w-36 text-base font-bold shadow-md">
              <Play size={18} /> Start
            </Button>
          )}

          {state === 'running' && (
            <Button size="lg" variant="secondary" onClick={pause} className="w-36 text-base font-bold">
              <Pause size={18} /> Pause
            </Button>
          )}

          {state === 'paused' && (
            <div className="flex items-center gap-2">
              <Button size="lg" onClick={resume} className="w-32 text-base font-bold">
                <Play size={18} /> Resume
              </Button>
              <Button size="lg" variant="outline" onClick={reset} className="text-xs">
                <RotateCcw size={16} /> Reset
              </Button>
            </div>
          )}

          {state === 'break' && (
            <div className="flex items-center gap-2">
              <Button size="lg" variant="secondary" onClick={skip} className="w-32 text-sm font-bold">
                <SkipForward size={16} /> Skip Break
              </Button>
            </div>
          )}
        </div>

        {/* Presets Row */}
        {state === 'idle' && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8 pt-6 border-t border-[#E5E7EB] w-full max-w-md">
            {presets.map(p => (
              <button
                key={p.label}
                onClick={() => handleSelectPreset(p.focus, p.rest)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  minutes === p.focus
                    ? 'border-[#2D5A3D] bg-[#2D5A3D]/10 text-[#2D5A3D]'
                    : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB]'
                }`}
              >
                {p.label} ({p.focus}m)
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Today's Focus Ledger */}
      <Card className="p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#2D5A3D]" />
            Completed Sessions Today ({todaySessions.length})
          </h3>
          <span className="text-xs font-semibold text-[#6B7280]">
            Total: {totalFocusToday} minutes
          </span>
        </div>

        {todaySessions.length === 0 ? (
          <p className="text-xs text-[#9CA3AF] py-6 text-center">
            No focus sessions logged yet today. Hit start above to begin your first round!
          </p>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {todaySessions.map((session, idx) => (
              <div key={session.id || idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#2D5A3D]" />
                  <span className="font-semibold text-[#1A1A1A]">
                    {session.label || 'Focused Session'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[#6B7280]">
                  <span className="font-medium text-[#2D5A3D]">+{session.duration} mins</span>
                  <span>{new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
