"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  CircleCheckBig,
  TrendingUp,
  Wallet,
  Truck,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import type { AuthUser } from "@/lib/api/auth.api";
import {
  driverGetMe,
  driverGetStats,
  driverGetAssignments,
  type DriverMe,
  type DriverStats,
} from "@/lib/api/driver.api";
import type { Shipment } from "@/lib/api/shipment.api";
import { formatNPR } from "@/lib/pricing";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { ActiveAssignmentCard } from "@/components/driver/shared";

export default function DriverDashboard({
  user,
  token,
}: {
  user: AuthUser;
  token: string;
}) {
  const [me, setMe] = useState<DriverMe | null>(null);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [active, setActive] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const [meRes, statsRes, activeRes] = await Promise.all([
          driverGetMe(token),
          driverGetStats(token),
          driverGetAssignments(token, "active"),
        ]);
        setMe(meRes);
        setStats(statsRes);
        setActive(activeRes[0] ?? null);
        setError(null);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
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

  const tiles = [
    {
      label: "Active Delivery",
      value: stats ? String(stats.active) : "-",
      Icon: Package,
      tint: "bg-[#E8F0FB] text-[#2E6FD6]",
    },
    {
      label: "Delivered Today",
      value: stats ? String(stats.deliveredToday) : "-",
      Icon: CircleCheckBig,
      tint: "bg-[#E6F4EC] text-[#1F9D57]",
    },
    {
      label: "Total Completed",
      value: stats ? String(stats.completed) : "-",
      Icon: TrendingUp,
      tint: "bg-[#E5F1F3] text-[#1D7A8C]",
    },
    {
      label: "COD to Collect",
      value: stats ? formatNPR(stats.codToCollect) : "-",
      Icon: Wallet,
      tint: "bg-[#FBE9E5] text-[#D0533F]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--accent-strong)]">
          Driver Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--text)] sm:text-3xl">
          Welcome back, {user.fullName?.split(" ")[0] || "Driver"}
        </h1>
        <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
          Here is your delivery workload and assigned vehicle.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-[#F3C6BF] bg-[#FBE4E1] px-4 py-3 text-sm font-semibold text-[#D0453A]">
          {error}
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => {
          const Icon = t.Icon;
          return (
            <div
              key={t.label}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.tint}`}>
                <Icon size={19} className="stroke-[2.4]" />
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                {t.label}
              </p>
              <h3 className="mt-0.5 text-2xl font-black tracking-tight text-[var(--text)]">
                {loading ? "-" : t.value}
              </h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active assignment */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="h-72 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]" />
          ) : active ? (
            <ActiveAssignmentCard
              key={active.id}
              shipment={active}
              token={token}
              onChanged={() => load(true)}
            />
          ) : (
            <div
              className="flex h-full min-h-[18rem] flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--text-muted)]">
                <ClipboardList size={26} />
              </div>
              <h3 className="mt-4 text-base font-bold text-[var(--text)]">No active delivery</h3>
              <p className="mt-1 max-w-xs text-sm text-[var(--text-muted)]">
                You have no shipment assigned right now. New assignments from dispatch will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Vehicle + quick link */}
        <div className="space-y-6">
          <div
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                <Truck size={18} />
              </div>
              <h3 className="text-sm font-extrabold text-[var(--text)]">Assigned Vehicle</h3>
            </div>
            {me?.vehicle ? (
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-2xl font-black tracking-tight text-[var(--text)]">
                  {me.vehicle.registrationNumber}
                </p>
                <p className="capitalize text-[var(--text-muted)]">
                  {me.vehicle.type}
                  {me.vehicle.make ? ` - ${me.vehicle.make}` : ""}
                  {me.vehicle.model ? ` ${me.vehicle.model}` : ""}
                </p>
                {me.vehicle.capacityKg != null && (
                  <p className="text-xs font-medium text-[var(--text-muted)]">
                    Capacity {me.vehicle.capacityKg} kg
                  </p>
                )}
                {me.branch && (
                  <p className="text-xs font-medium text-[var(--text-muted)]">Branch: {me.branch}</p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--text-muted)]">
                No vehicle assigned yet. Contact your dispatcher.
              </p>
            )}
          </div>

          <Link
            href="/driver/route"
            className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:bg-[var(--surface-soft)]"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div>
              <p className="text-sm font-bold text-[var(--text)]">View Route</p>
              <p className="text-xs text-[var(--text-muted)]">Navigate your active delivery</p>
            </div>
            <ArrowRight size={18} className="text-[var(--accent)]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
