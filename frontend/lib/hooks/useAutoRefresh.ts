"use client";

import { useEffect, useRef } from "react";

type RefreshCallback = () => void | Promise<void>;

interface AutoRefreshOptions {
  intervalMs?: number;
  enabled?: boolean;
  refreshOnFocus?: boolean;
}

export function useAutoRefresh(
  callback: RefreshCallback,
  { intervalMs = 30_000, enabled = true, refreshOnFocus = true }: AutoRefreshOptions = {},
): void {
  const savedCallback = useRef(callback);
  const inFlight = useRef(false);
  const lastRunAt = useRef(0);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    lastRunAt.current = Date.now();

    const run = async () => {
      if (
        inFlight.current ||
        document.visibilityState !== "visible" ||
        !navigator.onLine
      ) {
        return;
      }

      inFlight.current = true;
      try {
        await savedCallback.current();
        lastRunAt.current = Date.now();
      } finally {
        inFlight.current = false;
      }
    };

    const tick = () => {
      void run();
    };

    const intervalId = window.setInterval(tick, intervalMs);

    const onVisibility = () => {
      const isStale = Date.now() - lastRunAt.current >= intervalMs;
      if (document.visibilityState === "visible" && isStale) {
        void run();
      }
    };

    if (refreshOnFocus) {
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("focus", tick);
    }

    return () => {
      window.clearInterval(intervalId);
      if (refreshOnFocus) {
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("focus", tick);
      }
    };
  }, [intervalMs, enabled, refreshOnFocus]);
}
