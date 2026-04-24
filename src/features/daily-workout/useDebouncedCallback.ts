'use client';

import { useEffect, useRef } from 'react';

/**
 * Returns a stable function that defers calling `fn` by `delay` ms,
 * cancelling the previous pending call. Useful for "save on change" flows.
 */
export function useDebouncedCallback<T extends unknown[]>(
  fn: (...args: T) => void,
  delay = 400
) {
  const fnRef = useRef(fn);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (...args: T) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fnRef.current(...args);
    }, delay);
  };
}
