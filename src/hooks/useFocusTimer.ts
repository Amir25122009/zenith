import { useState, useRef, useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { nanoid } from 'nanoid';
import { formatDate } from '../lib/utils';
import { DEFAULT_POMODORO_MINUTES, DEFAULT_BREAK_MINUTES } from '../lib/constants';
import { playBellSound } from '../lib/sound';

type TimerState = 'idle' | 'running' | 'paused' | 'break';

export function useFocusTimer() {
  const [minutes, setMinutes] = useState(DEFAULT_POMODORO_MINUTES);
  const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK_MINUTES);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_POMODORO_MINUTES * 60);
  const [state, setState] = useState<TimerState>('idle');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [label, setLabel] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const todaySessions = useLiveQuery(() => {
    const today = formatDate(new Date());
    return db.focusSessions.where('date').equals(today).toArray();
  }) ?? [];

  const allSessions = useLiveQuery(() => db.focusSessions.toArray()) ?? [];

  const totalFocusToday = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    if (state === 'idle') {
      setTimeLeft(minutes * 60);
    }
    setState('running');
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          playBellSound();
          playBellSound();
          // Session completed
          if (state !== 'break') {
            db.focusSessions.add({
              id: nanoid(),
              date: formatDate(new Date()),
              duration: minutes,
              completedAt: new Date().toISOString(),
              label: label || undefined,
            });
            setSessionsCompleted(c => c + 1);
            setState('break');
            return breakMinutes * 60;
          } else {
            setState('idle');
            return minutes * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, minutes, breakMinutes, state, label]);

  const pause = useCallback(() => {
    clearTimer();
    setState('paused');
  }, [clearTimer]);

  const resume = useCallback(() => {
    setState(state === 'break' ? 'break' : 'running');
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          playBellSound();
          if (state === 'break') {
            setState('idle');
            return minutes * 60;
          } else {
            db.focusSessions.add({
              id: nanoid(),
              date: formatDate(new Date()),
              duration: minutes,
              completedAt: new Date().toISOString(),
              label: label || undefined,
            });
            setSessionsCompleted(c => c + 1);
            setState('break');
            return breakMinutes * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, minutes, breakMinutes, state, label]);

  const reset = useCallback(() => {
    clearTimer();
    setState('idle');
    setTimeLeft(minutes * 60);
  }, [clearTimer, minutes]);

  const skip = useCallback(() => {
    clearTimer();
    if (state === 'break') {
      setState('idle');
      setTimeLeft(minutes * 60);
    }
  }, [clearTimer, state, minutes]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    if (state === 'idle') {
      setTimeLeft(minutes * 60);
    }
  }, [minutes, state]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = state === 'break'
    ? ((breakMinutes * 60 - timeLeft) / (breakMinutes * 60)) * 100
    : ((minutes * 60 - timeLeft) / (minutes * 60)) * 100;

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    state,
    progress,
    sessionsCompleted,
    totalFocusToday,
    todaySessions,
    allSessions,
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
  };
}
