"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MapPinned, ArrowLeft } from "lucide-react";
import { driverGetAssignments } from "@/lib/api/driver.api";
import type { Shipment } from "@/lib/api/shipment.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { ActiveAssignmentCard } from "@/components/driver/shared";

export default function DriverRoute({ token }: { token: string }) {
  const [active, setActive] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const res = await driverGetAssignments(token, "active");
        setActive(res[0] ?? null);
        setError(null);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Failed to load route");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useAutoRefresh(() => load(true), { intervalMs: 15_000 });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/driver"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)]"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={17} />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text)]">Route</h1>
          <p className="text-sm font-medium text-[var(--text-muted)]">
            Your active delivery route and status updates.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[#F3C6BF] bg-[#FBE4E1] px-4 py-3 text-sm font-semibold text-[#D0453A]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-[28rem] animate-pulse rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]" />
      ) : active ? (
        <div className="max-w-3xl">
          <ActiveAssignmentCard
            shipment={active}
            token={token}
            onChanged={(updated) => {
              setActive(
                updated.status === "pending" || updated.status === "in-transit"
                  ? updated
                  : null,
              );
              void load(true);
            }}
            withMap
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
          <MapPinned size={28} className="text-[var(--text-muted)]" />
          <h3 className="mt-4 text-base font-bold text-[var(--text)]">No route to show</h3>
          <p className="mt-1 max-w-xs text-sm text-[var(--text-muted)]">
            You have no active delivery. Once dispatch assigns you a shipment, its route appears here.
          </p>
        </div>
      )}
    </div>
  );
}
