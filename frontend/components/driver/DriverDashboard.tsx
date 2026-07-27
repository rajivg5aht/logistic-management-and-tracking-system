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
  CalendarClock,
  Fuel,
  MapPin,
  Wrench,
  ArrowRight,
} from "lucide-react";
import type { AuthUser } from "@/lib/api/auth.api";
import {
  driverGetMe,
  driverGetStats,
  driverGetAssignments,
  driverGetFleet,
  type DriverFleet,
  type DriverMe,
  type DriverStats,
} from "@/lib/api/driver.api";
import type { Shipment } from "@/lib/api/shipment.api";
import { formatNPR } from "@/lib/pricing";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { ActiveAssignmentCard } from "@/components/driver/shared";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";

function formatDate(value: string | null, fallback: string) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("en-NP", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function destinationLabel(shipment: Shipment) {
  const destination = [shipment.delivery.city, shipment.delivery.district]
    .filter(Boolean)
    .join(", ");
  return destination || "Delivery destination";
}

function availabilityLabel(status?: string) {
  if (!status) return "Status loading";
  return status.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function availabilityTone(status?: string) {
  if (status === "available") return "bg-[var(--success-soft)] text-[var(--success)]";
  if (status === "off-duty") return "bg-[var(--surface-soft)] text-[var(--text-soft)]";
  return "bg-[var(--accent-soft)] text-[var(--accent-strong)]";
}

function DriverDashboardEmptyState({
  availability,
  recentDeliveries,
}: {
  availability?: string;
  recentDeliveries: Shipment[];
}) {
  const isOffDuty = availability === "off-duty";

  return (
    <section
      className="min-h-[18rem] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
            <ClipboardList size={23} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Dispatch status</p>
            <h3 className="mt-1 text-lg font-black text-[var(--text)]">Ready for your next assignment</h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
              {isOffDuty
                ? "You are currently off duty. Change your availability in the header when you are ready for dispatch."
                : "No active delivery is assigned right now. Keep your vehicle ready and check assignments for new work."}
            </p>
          </div>
        </div>
        <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ${availabilityTone(availability)}`}>
          {availabilityLabel(availability)}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/driver/assignments" className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--text-on-accent)] transition-colors hover:bg-[var(--accent-hover)]">
          View assignments <ArrowRight size={16} />
        </Link>
        <Link href="/driver/fleet" className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-bold text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)]">
          Check vehicle health
        </Link>
      </div>

      <div className="mt-7 border-t border-[var(--border-light)] pt-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-[var(--text)]">Recent delivery activity</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">Your latest completed trips.</p>
          </div>
          <Link href="/driver/assignments" className="text-xs font-bold text-[var(--accent-strong)] hover:underline">View history</Link>
        </div>

        {recentDeliveries.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {recentDeliveries.map((shipment) => (
              <article key={shipment.id} className="rounded-xl bg-[var(--surface-soft)] p-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--success-soft)] text-[var(--success)]">
                  <CircleCheckBig size={16} />
                </div>
                <p className="mt-3 truncate text-sm font-black text-[var(--text)]">{shipment.trackingId}</p>
                <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[var(--text-muted)]"><MapPin size={13} /> {destinationLabel(shipment)}</p>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-soft)]"><CalendarClock size={13} /> {formatDate(shipment.deliveredAt, "Recently completed")}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--text-muted)]">Your completed deliveries will appear here.</p>
        )}
      </div>
    </section>
  );
}

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
  const [history, setHistory] = useState<Shipment[]>([]);
  const [fleet, setFleet] = useState<DriverFleet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const [meRes, statsRes, activeRes, historyRes, fleetRes] = await Promise.all([
          driverGetMe(token),
          driverGetStats(token),
          driverGetAssignments(token, "active"),
          driverGetAssignments(token, "history"),
          driverGetFleet(token),
        ]);
        setMe(meRes);
        setStats(statsRes);
        setActive(activeRes[0] ?? null);
        setHistory(historyRes);
        setFleet(fleetRes);
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
      tint: "bg-[var(--info-soft)] text-[var(--info)]",
    },
    {
      label: "Delivered Today",
      value: stats ? String(stats.deliveredToday) : "-",
      Icon: CircleCheckBig,
      tint: "bg-[var(--success-soft)] text-[var(--success)]",
    },
    {
      label: "Total Completed",
      value: stats ? String(stats.completed) : "-",
      Icon: TrendingUp,
      tint: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
    },
    {
      label: "COD to Collect",
      value: stats ? formatNPR(stats.codToCollect) : "-",
      Icon: Wallet,
      tint: "bg-[var(--danger-soft)] text-[var(--danger)]",
    },
  ];

  const recentDeliveries = [...history]
    .filter((shipment) => shipment.status === "delivered" || Boolean(shipment.deliveredAt))
    .sort((first, second) => {
      const firstTime = new Date(first.deliveredAt ?? first.updatedAt).getTime();
      const secondTime = new Date(second.deliveredAt ?? second.updatedAt).getTime();
      return secondTime - firstTime;
    })
    .slice(0, 3);
  const openIncidentCount = fleet?.incidents.filter(
    (incident) => !["resolved", "closed"].includes(incident.status.toLowerCase()),
  ).length ?? 0;
  const pendingFuelClaims = fleet?.fuelExpenses.filter(
    (expense) => ["submitted", "pending"].includes(expense.status.toLowerCase()),
  ).length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        className="mb-0"
        eyebrow="Driver dashboard"
        title={<>Welcome back, {user.fullName?.split(" ")[0] || "Driver"}</>}
        description="Here is your delivery workload and assigned vehicle."
      />

      {error && (
        <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => {
          return (
            <StatCard
              key={t.label}
              label={t.label}
              value={t.value}
              icon={t.Icon}
              tone={t.tint}
              loading={loading}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
            <DriverDashboardEmptyState
              availability={me?.availabilityStatus}
              recentDeliveries={recentDeliveries}
            />
          )}
        </div>

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
                {fleet?.vehicle && (
                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--border-light)] pt-4">
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]"><Wrench size={13} /> Next service</p>
                      <p className="mt-1 text-xs font-bold text-[var(--text-soft)]">{formatDate(fleet.vehicle.nextServiceAt, "Not scheduled")}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]"><ClipboardList size={13} /> Open reports</p>
                      <p className="mt-1 text-xs font-bold text-[var(--text-soft)]">{openIncidentCount} open</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]"><Fuel size={13} /> Fuel claims</p>
                      <p className="mt-1 text-xs font-bold text-[var(--text-soft)]">{pendingFuelClaims} pending</p>
                    </div>
                    <Link href="/driver/fleet" className="flex items-end text-xs font-bold text-[var(--accent-strong)] hover:underline">View vehicle health</Link>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--text-muted)]">
                No vehicle assigned yet. Contact your dispatcher.
              </p>
            )}
          </div>

          <Link
            href={active ? "/driver/route" : "/driver/assignments"}
            className="flex items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:bg-[var(--surface-soft)]"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div>
              <p className="text-sm font-bold text-[var(--text)]">{active ? "View Route" : "Open assignments"}</p>
              <p className="text-xs text-[var(--text-muted)]">{active ? "Navigate your active delivery" : "Review your delivery queue"}</p>
            </div>
            <ArrowRight size={18} className="text-[var(--accent)]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
