import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseGameTimerReturn {
  whiteTime: number;
  blackTime: number;
  activeColor: 'w' | 'b' | null;
  isRunning: boolean;
  isLowTime: (color: 'w' | 'b') => boolean;
  start: () => void;
  stop: () => void;
  switchTurn: () => void;
  reset: (initialSeconds?: number) => void;
}

export function useGameTimer(initialSeconds: number = 600): UseGameTimerReturn {
  const [whiteTime, setWhiteTime] = useState(initialSeconds);
  const [blackTime, setBlackTime] = useState(initialSeconds);
  const [activeColor, setActiveColor] = useState<'w' | 'b' | null>('w');
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialRef = useRef(initialSeconds);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Tick effect
  useEffect(() => {
    if (!isRunning || !activeColor) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      if (activeColor === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return clearTimer;
  }, [isRunning, activeColor, clearTimer]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const switchTurn = useCallback(() => {
    setActiveColor((prev) => (prev === 'w' ? 'b' : 'w'));
  }, []);

  const reset = useCallback((seconds?: number) => {
    const init = seconds ?? initialRef.current;
    initialRef.current = init;
    clearTimer();
    setWhiteTime(init);
    setBlackTime(init);
    setActiveColor('w');
    setIsRunning(false);
  }, [clearTimer]);

  const isLowTime = useCallback(
    (color: 'w' | 'b') => {
      const time = color === 'w' ? whiteTime : blackTime;
      return time <= 30 && time > 0;
    },
    [whiteTime, blackTime]
  );

  return {
    whiteTime,
    blackTime,
    activeColor,
    isRunning,
    isLowTime,
    start,
    stop,
    switchTurn,
    reset,
  };
}
