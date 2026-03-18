'use client';

import { useEffect, useCallback } from 'react';

export function useAutoRotate(
  current: number,
  setCurrent: (n: number) => void,
  total: number,
  intervalMs: number,
  paused: boolean,
) {
  const advance = useCallback(() => {
    setCurrent((current + 1) % total);
  }, [current, setCurrent, total]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(advance, intervalMs);
    return () => clearInterval(id);
  }, [advance, intervalMs, paused]);
}
