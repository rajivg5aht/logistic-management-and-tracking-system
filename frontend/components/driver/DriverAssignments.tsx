"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList, Clock } from "lucide-react";
import { driverGetAssignments } from "@/lib/api/driver.api";
import type {
  Shipment,
  ShipmentStatus,
  DriverStage,
} from "@/lib/api/shipment.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { ActiveAssignmentCard, STAGE_LABEL, shortLoc } from "@/components/driver/shared";

const HISTORY_BADGE: Record<ShipmentStatus, string> = {
  pending: "bg-[#FDECD8] text-[#C77718]",
  "in-transit": "bg-[#E4EEFB] text-[#2E6FD6]",
  delivered: "bg-[#DEF3E6] text-[#1E9E4C]",
  cancelled: "bg-[#FBE4E1] text-[#D0453A]",
};

export default function DriverAssignments({ token }: { token: string }) {
  const [active, setActive] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const [activeRes, historyRes] = await Promise.all([
          driverGetAssignments(token, "active"),
          driverGetAssignments(token, "history"),
        ]);
        setActive(activeRes[0] ?? null);
        setHistory(historyRes);
        setError(null);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Failed to load assignments");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    load();
  }, [load]);

  useAutoRefresh(() => load(true), { intervalMs: 15_000 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--text)]">My Assignments</h1>
        <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
          Your current delivery and completed history.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-[#F3C6BF] bg-[#FBE4E1] px-4 py-3 text-sm font-semibold text-[#D0453A]">
          {error}
        </div>
      )}

      {/* Active */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Active
        </h2>
        {loading ? (
          <div className="h-64 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]" />
        ) : active ? (
          <ActiveAssignmentCard shipment={active} token={token} onChanged={() => load(true)} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <ClipboardList size={26} className="text-[var(--text-muted)]" />
            <p className="mt-3 text-sm font-semibold text-[var(--text)]">No active assignment</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">New deliveries from dispatch appear here.</p>
          </div>
        )}
      </section>

      {/* History */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Delivery History
        </h2>
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]" style={{ boxShadow: "var(--shadow-sm)" }}>
          {loading ? (
            <div className="space-y-px">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-[var(--surface-soft)]" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--text-muted)]">
              No completed deliveries yet.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border-light)]">
              {history.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-[var(--text-muted)]">
                    <Clock size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[var(--text)]">#{s.trackingId}</p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {shortLoc(s.pickup)} → {shortLoc(s.delivery)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${HISTORY_BADGE[s.status]}`}>
                    {s.driverStage ? STAGE_LABEL[s.driverStage as DriverStage] : s.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
