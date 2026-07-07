"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Receipt,
  CircleCheckBig,
  Truck,
  Gauge,
  ArrowUpRight,
  Calendar,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
  MapPin,
  Package,
  Gift,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { driverGetAssignments, driverGetStats } from "@/lib/api/driver.api";
import type { DriverStats } from "@/lib/api/driver.api";
import type { Shipment } from "@/lib/api/shipment.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

const NAVY = "#0C3B67";
const WEEKLY_GOAL = 20; // Deliveries that unlock the weekly bonus.
const PAGE_SIZE = 6;

/* ── Trip bucketing (maps a shipment to a display status) ───────────────────── */
type TripBucket = "delivered" | "failed" | "in-transit" | "pending";

function bucketOf(s: Shipment): TripBucket {
  if (s.status === "delivered") return "delivered";
  if (
    s.driverStage === "failed" ||
    s.driverStage === "returned" ||
    s.status === "cancelled"
  ) {
    return "failed";
  }
  if (s.status === "in-transit") return "in-transit";
  return "pending";
}

const BUCKET_META: Record<TripBucket, { label: string; dot: string; text: string; bg: string }> = {
  delivered: { label: "Delivered", dot: "bg-[#1E9E4C]", text: "text-[#1E9E4C]", bg: "bg-[#DEF3E6]" },
  failed: { label: "Failed", dot: "bg-[#D0453A]", text: "text-[#D0453A]", bg: "bg-[#FBE4E1]" },
  "in-transit": { label: "In Transit", dot: "bg-[#2E6FD6]", text: "text-[#2E6FD6]", bg: "bg-[#E4EEFB]" },
  pending: { label: "Pending", dot: "bg-[#C77718]", text: "text-[#C77718]", bg: "bg-[#FDECD8]" },
};

const TABS: { label: string; bucket?: TripBucket }[] = [
  { label: "All Trips" },
  { label: "Delivered", bucket: "delivered" },
  { label: "Failed", bucket: "failed" },
  { label: "Pending", bucket: "pending" },
];

const RANGE_OPTIONS = [
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
  { label: "All Time", days: 0 },
];

/* ── Formatting helpers ─────────────────────────────────────────────────────── */
function money(n: number): string {
  return `NPR ${Math.round(n).toLocaleString("en-IN")}`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}

function destinationLines(s: Shipment): { primary: string; secondary: string } {
  const primary =
    s.delivery.city || s.delivery.district || s.delivery.recipientName || "—";
  const secondary =
    [s.delivery.streetAddress, s.delivery.district]
      .filter(Boolean)
      .filter((v) => v !== primary)
      .join(", ") || s.delivery.recipientName || "—";
  return { primary, secondary };
}

/* ── Component ───────────────────────────────────────────────────────────────── */
export default function DriverAssignments({ token }: { token: string }) {
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [trips, setTrips] = useState<Shipment[]>([]);
  const [active, setActive] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Captured at load time so date math stays pure across renders.
  const [nowTs, setNowTs] = useState(0);

  const [tab, setTab] = useState(0);
  const [rangeDays, setRangeDays] = useState(30);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const [statsRes, activeRes, historyRes] = await Promise.all([
          driverGetStats(token),
          driverGetAssignments(token, "active"),
          driverGetAssignments(token, "history"),
        ]);
        setStats(statsRes);
        setActive(activeRes);
        // Newest first across both scopes.
        setTrips(
          [...activeRes, ...historyRes].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
        setNowTs(Date.now());
        setError(null);
      } catch (err) {
        if (!silent) setError(err instanceof Error ? err.message : "Failed to load assignments");
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

  // Filter changes always jump back to the first page.
  const selectTab = (i: number) => {
    setTab(i);
    setPage(1);
  };
  const selectRange = (days: number) => {
    setRangeDays(days);
    setPage(1);
  };
  const onSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  /* ── Derived metrics (all from real data) ─────────────────────────────────── */
  const derived = useMemo(() => {
    const now = nowTs;
    const DAY = 86_400_000;
    const delivered = trips.filter((t) => t.status === "delivered");

    const totalEarnings = delivered.reduce((sum, t) => sum + t.amount, 0);

    // Month-over-month earnings from deliveredAt timestamps.
    const monthStart = new Date(nowTs);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const prevMonthStart = new Date(monthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
    let thisMonth = 0;
    let lastMonth = 0;
    for (const t of delivered) {
      const at = t.deliveredAt ? new Date(t.deliveredAt).getTime() : null;
      if (at == null) continue;
      if (at >= monthStart.getTime()) thisMonth += t.amount;
      else if (at >= prevMonthStart.getTime()) lastMonth += t.amount;
    }
    const trendPct = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;

    const total = stats?.total ?? 0;
    const completed = stats?.completed ?? 0;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const efficiency = (successRate / 100) * 5;

    const deliveredThisWeek = delivered.filter(
      (t) => t.deliveredAt && now - new Date(t.deliveredAt).getTime() <= 7 * DAY,
    ).length;

    return { totalEarnings, trendPct, successRate, efficiency, deliveredThisWeek };
  }, [trips, stats, nowTs]);

  /* ── Filtered + paginated trips ───────────────────────────────────────────── */
  const filtered = useMemo(() => {
    const bucket = TABS[tab].bucket;
    const cutoff = rangeDays > 0 && nowTs > 0 ? nowTs - rangeDays * 86_400_000 : 0;
    const q = search.trim().toLowerCase();
    return trips.filter((t) => {
      if (bucket && bucketOf(t) !== bucket) return false;
      if (cutoff && new Date(t.createdAt).getTime() < cutoff) return false;
      if (q) {
        const hay = `${t.trackingId} ${t.delivery.city ?? ""} ${t.delivery.district ?? ""} ${t.delivery.streetAddress ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [trips, tab, rangeDays, search, nowTs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const firstRow = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const lastRow = Math.min(safePage * PAGE_SIZE, filtered.length);

  const statCards = [
    {
      label: "Total Earnings",
      Icon: Receipt,
      value: money(derived.totalEarnings),
      foot:
        derived.trendPct != null ? (
          <span className="inline-flex items-center gap-1 text-[#1E9E4C]">
            <ArrowUpRight size={13} className="stroke-[2.6]" />
            {derived.trendPct >= 0 ? "+" : ""}
            {derived.trendPct}% from last month
          </span>
        ) : (
          <span className="text-[var(--text-muted)]">Earned from deliveries</span>
        ),
    },
    {
      label: "Completed Trips",
      Icon: CircleCheckBig,
      value: stats ? String(stats.completed) : "—",
      foot: <span className="text-[var(--text-muted)]">{derived.successRate}% Success rate</span>,
    },
    {
      label: "In Transit",
      Icon: Truck,
      value: stats ? String(stats.active).padStart(2, "0") : "—",
      foot: <span className="text-[#C77718]">Active deliveries now</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-[#F3C6BF] bg-[#FBE4E1] px-4 py-3 text-sm font-semibold text-[#D0453A]">
          {error}
        </div>
      )}

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => {
          const Icon = c.Icon;
          return (
            <div
              key={c.label}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-start justify-between">
                <p className="text-[12px] font-bold text-[var(--text-muted)]">{c.label}</p>
                <Icon size={17} className="text-[var(--text-muted)]" />
              </div>
              <h3 className="mt-2 text-2xl font-black tracking-tight" style={{ color: NAVY }}>
                {loading ? "—" : c.value}
              </h3>
              <p className="mt-1.5 text-xs font-semibold">{loading ? "" : c.foot}</p>
            </div>
          );
        })}

        {/* Efficiency score with progress bar */}
        <div
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-start justify-between">
            <p className="text-[12px] font-bold text-[var(--text-muted)]">Efficiency Score</p>
            <Gauge size={17} className="text-[var(--text-muted)]" />
          </div>
          <h3 className="mt-2 text-2xl font-black tracking-tight" style={{ color: NAVY }}>
            {loading ? "—" : `${derived.efficiency.toFixed(1)}/5.0`}
          </h3>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-full rounded-full"
              style={{ width: `${(derived.efficiency / 5) * 100}%`, backgroundColor: NAVY }}
            />
          </div>
        </div>
      </div>

      {/* ── Trips table ────────────────────────────────────────────────────── */}
      <div
        className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map((t, i) => (
              <button
                key={t.label}
                type="button"
                onClick={() => selectTab(i)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                  tab === i
                    ? "text-white"
                    : "bg-[var(--surface-soft)] text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
                }`}
                style={tab === i ? { backgroundColor: NAVY } : undefined}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <select
                value={rangeDays}
                onChange={(e) => selectRange(Number(e.target.value))}
                className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1.5 pl-8 pr-3 text-xs font-bold text-[var(--text-soft)] focus:outline-none"
              >
                {RANGE_OPTIONS.map((r) => (
                  <option key={r.label} value={r.days}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setShowSearch((s) => !s)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                showSearch
                  ? "border-transparent text-white"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
              }`}
              style={showSearch ? { backgroundColor: NAVY } : undefined}
            >
              <SlidersHorizontal size={14} />
              More Filters
            </button>
          </div>
        </div>

        {/* Search (toggled by More Filters) */}
        {showSearch && (
          <div className="border-b border-[var(--border)] px-5 py-3">
            <div className="relative max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search by tracking ID or destination"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="bg-[var(--surface-soft)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-5 py-3">Shipment ID</th>
                <th className="px-5 py-3">Destination</th>
                <th className="px-5 py-3">Date &amp; Time</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payout</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-6 animate-pulse rounded bg-[var(--surface-soft)]" />
                    </td>
                  </tr>
                ))
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[var(--text-muted)]">
                    No trips match this filter.
                  </td>
                </tr>
              ) : (
                pageRows.map((s) => {
                  const bucket = bucketOf(s);
                  const meta = BUCKET_META[bucket];
                  const dest = destinationLines(s);
                  const failed = bucket === "failed";
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-[var(--surface-soft)]">
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold" style={{ color: NAVY }}>
                          #{s.trackingId}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-[var(--text)]">{dest.primary}</p>
                        <p className="truncate text-xs text-[var(--text-muted)]">{dest.secondary}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-[var(--text-soft)]">
                        {formatDateTime(s.deliveredAt ?? s.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.bg} ${meta.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-sm font-bold ${
                            failed ? "text-[var(--text-muted)] line-through" : "text-[var(--text)]"
                          }`}
                        >
                          {money(s.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ChevronRight size={16} className="text-[var(--text-muted)]" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-4">
          <p className="text-xs font-medium text-[var(--text-muted)]">
            Showing {firstRow}-{lastRow} of {filtered.length} trips
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).slice(0, 4).map((_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-colors ${
                    n === safePage
                      ? "text-white"
                      : "border border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
                  }`}
                  style={n === safePage ? { backgroundColor: NAVY } : undefined}
                >
                  {n}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Upcoming schedule + incentive ──────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-sm font-black tracking-tight" style={{ color: NAVY }}>
          Upcoming Schedule
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Real active assignments as schedule cards */}
          {(active.length > 0 ? active.slice(0, 2) : [null]).map((s, i) =>
            s ? (
              <div
                key={s.id}
                className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[var(--accent-strong)]">
                    {bucketOf(s) === "pending" ? "Pickup" : "In progress"}
                  </span>
                  <span className="text-xs font-bold text-[var(--text-muted)]">
                    {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-sm font-black text-[var(--text)]">
                  <MapPin size={14} className="text-[var(--accent)]" />
                  {s.pickup.city || s.pickup.streetAddress || "Pickup"}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
                  <Package size={13} />#{s.trackingId} · {s.package.quantity} package
                  {s.package.quantity === 1 ? "" : "s"}
                </p>
                <Link
                  href="/driver/route"
                  className="mt-4 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: NAVY }}
                >
                  View Route
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div
                key={`empty-${i}`}
                className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center"
              >
                <ClipboardList size={22} className="text-[var(--text-muted)]" />
                <p className="mt-2 text-sm font-semibold text-[var(--text)]">No upcoming pickups</p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  New assignments from dispatch appear here.
                </p>
              </div>
            ),
          )}

          {/* Weekly incentive (derived from real weekly deliveries) */}
          <div
            className="flex flex-col justify-between rounded-[var(--radius-lg)] p-5 text-white"
            style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #16548C 100%)` }}
          >
            <div>
              <div className="flex items-center gap-2">
                <Gift size={17} />
                <span className="text-sm font-black">Weekly Incentive</span>
              </div>
              <p className="mt-2 text-lg font-black">Earn NPR 5,000 Bonus</p>
              <p className="mt-1 text-xs font-medium text-white/70">
                {derived.deliveredThisWeek >= WEEKLY_GOAL
                  ? "Goal reached — bonus unlocked!"
                  : `Complete ${WEEKLY_GOAL - derived.deliveredThisWeek} more deliveries this week.`}
              </p>
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white"
                  style={{
                    width: `${Math.min(100, (derived.deliveredThisWeek / WEEKLY_GOAL) * 100)}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-right text-xs font-bold text-white/80">
                {Math.min(derived.deliveredThisWeek, WEEKLY_GOAL)}/{WEEKLY_GOAL} Completed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
