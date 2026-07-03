"use client";

import { useEffect, useRef } from "react";

type RefreshCallback = () => void | Promise<void>;

interface AutoRefreshOptions {
  /** Poll interval in milliseconds. Default: 10s. */
  intervalMs?: number;
  /** When false the hook attaches nothing (e.g. while a token is missing). Default: true. */
  enabled?: boolean;
  /** Also refetch when the tab regains focus / becomes visible again. Default: true. */
  refreshOnFocus?: boolean;
}

/**
 * Keeps a view in sync with server-side changes made by *other* actors without
 * the user having to refresh the page. For example, when an admin marks a
 * shipment "delivered", the customer's list picks it up on the next tick.
 *
 * It periodically calls `callback` and (by default) also calls it whenever the
 * tab regains focus or becomes visible again, so switching back to the tab
 * always shows fresh data. Polling is skipped while the tab is hidden to avoid
 * needless background requests — the visibility handler refetches on return.
 *
 * The `callback` should perform a *silent* refetch (no loading skeleton) so the
 * UI doesn't flicker on every tick. The latest `callback` is always used, so it
 * may safely close over changing state (page, filters, search) without
 * restarting the interval.
 */
export function useAutoRefresh(
  callback: RefreshCallback,
  { intervalMs = 10_000, enabled = true, refreshOnFocus = true }: AutoRefreshOptions = {},
): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const run = () => void savedCallback.current();

    const tick = () => {
      // Don't poll a backgrounded tab; the visibility handler refetches on return.
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      run();
    };

    const intervalId = window.setInterval(tick, intervalMs);

    const onVisibility = () => {
      if (document.visibilityState === "visible") run();
    };

    if (refreshOnFocus) {
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("focus", run);
    }

    return () => {
      window.clearInterval(intervalId);
      if (refreshOnFocus) {
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("focus", run);
      }
    };
  }, [intervalMs, enabled, refreshOnFocus]);
}
