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
