import { DependencyList, EffectCallback, useEffect } from 'react';

/**
 * Runs the effect on mount and every time the dependencies change.
 * Semantically equivalent to `useEffect`, but named to make the intent explicit.
 */
function useDidMountAndUpdate(
  effect: EffectCallback,
  deps?: DependencyList
): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, deps);
}

export default useDidMountAndUpdate;
