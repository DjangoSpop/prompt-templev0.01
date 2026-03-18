'use client';

import { useRef, useState, useEffect } from 'react';

/**
 * Counts from 0 to `target` when the element scrolls into view.
 * Returns [ref to attach to the element, current displayed value].
 */
export function useCountUp(
  target: number,
  duration: number = 1.5,
  suffix: string = '',
): [React.RefObject<HTMLSpanElement | null>, string] {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState('0' + suffix);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animateCount(target, duration, suffix, setValue);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, suffix]);

  return [ref, value];
}

function animateCount(
  target: number,
  duration: number,
  suffix: string,
  setValue: (v: string) => void,
) {
  const start = performance.now();
  const durationMs = duration * 1000;

  function tick(now: number) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / durationMs, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    setValue(current.toLocaleString() + suffix);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}
