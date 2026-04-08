import { useState, useRef, useCallback, useEffect } from 'react';

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function useGameTimer(onGameOver) {
  const [score, setScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const scoreRef = useRef(0);
  const timerRef = useRef(null);
  const timeRef = useRef(0);
  const isRunningRef = useRef(false);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const start = useCallback(() => {
    if (isRunningRef.current) return;
    setIsRunning(true);
    timeRef.current = 0;
    setElapsedTime(0);

    timerRef.current = setInterval(() => {
      timeRef.current++;
      setElapsedTime(timeRef.current);
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resume = useCallback(() => {
    if (isRunningRef.current) return;
    setIsRunning(true);

    timerRef.current = setInterval(() => {
      timeRef.current++;
      setElapsedTime(timeRef.current);
    }, 1000);
  }, []);

  const reset = useCallback(() => {
    pause();
    scoreRef.current = 0;
    timeRef.current = 0;
    setScore(0);
    setElapsedTime(0);
  }, [pause]);

  const addScore = useCallback((points) => {
    scoreRef.current += points;
    setScore(scoreRef.current);
  }, []);

  const triggerGameOver = useCallback(() => {
    pause();
    onGameOver?.();
  }, [pause, onGameOver]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    score,
    elapsedTime,
    isRunning,
    start,
    pause,
    resume,
    reset,
    addScore,
    triggerGameOver,
    formattedTime: formatTime(elapsedTime)
  };
}
