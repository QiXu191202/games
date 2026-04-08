import { useEffect, useRef } from 'react';

const KEYS = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  KeyW: false,
  KeyS: false,
  KeyA: false,
  KeyD: false
};

export function useKeyboardControls(onMove) {
  const keysRef = useRef({ ...KEYS });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (Object.hasOwn(keysRef.current, e.code)) {
        keysRef.current[e.code] = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      if (Object.hasOwn(keysRef.current, e.code)) {
        keysRef.current[e.code] = false;
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const interval = setInterval(() => {
      const state = {
        up: keysRef.current.ArrowUp || keysRef.current.KeyW,
        down: keysRef.current.ArrowDown || keysRef.current.KeyS,
        left: keysRef.current.ArrowLeft || keysRef.current.KeyA,
        right: keysRef.current.ArrowRight || keysRef.current.KeyD
      };
      onMove?.(state);
    }, 16);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(interval);
    };
  }, [onMove]);

  return keysRef;
}

export function useTouchControls(onDirection) {
  const touchStartRef = useRef(null);

  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      const threshold = 5;
      const direction = {
        left: deltaX < -threshold,
        right: deltaX > threshold,
        up: deltaY < -threshold,
        down: deltaY > threshold
      };
      onDirection?.(direction);

      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = () => {
      onDirection?.({ left: false, right: false, up: false, down: false });
      touchStartRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onDirection]);
}
