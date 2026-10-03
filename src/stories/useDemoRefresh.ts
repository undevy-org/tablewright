import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Spinner state for story demos' Refresh button: the stories have no data
 * source to refetch, so "refreshing" just spins for `durationMs`.
 */
export function useDemoRefresh(durationMs = 700): [boolean, () => void] {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setIsRefreshing(false), durationMs);
  }, [durationMs]);

  return [isRefreshing, refresh];
}
