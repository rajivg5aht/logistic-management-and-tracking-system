"use client";

import { useEffect, useState } from "react";
import { DollarSign, Truck, Timer, ShieldCheck, MapPin, Crown } from "lucide-react";
import { adminGetFleetStats, type FleetStats } from "@/lib/api/fleet.api";
import {
  adminGetAnalytics,
  type ShipmentAnalytics,
} from "@/lib/api/shipment.api";
import { formatNPR } from "@/lib/pricing";

type DeltaTone = "up" | "down" | "neutral";

function deltaBadge(
  delta: number | null,
  { lowerIsBetter = false, unit = "%" }: { lowerIsBetter?: boolean; unit?: string } = {},
): { text: string; tone: DeltaTone } {
  if (delta === null || Number.isNaN(delta)) {
    return { text: "—", tone: "neutral" };
  }
  const sign = delta > 0 ? "+" : "";
  const good = lowerIsBetter ? delta < 0 : delta > 0;
  const tone: DeltaTone = delta === 0 ? "neutral" : good ? "up" : "down";
  return { text: `${sign}${delta}${unit}`, tone };
}

function formatDuration(ms: number | null): string {
  if (ms === null || ms <= 0) return "—";
  const minutes = ms / 60000;
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours * 10) / 10}h`;
  return `${Math.round((hours / 24) * 10) / 10}d`;
}

const TONE_CLASS: Record<DeltaTone, string> = {
  up: "bg-[rgba(95,127,53,0.1)] text-[var(--success)]",
  down: "bg-[rgba(181,71,59,0.1)] text-[var(--danger)]",
  neutral: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
};

export default function AdminAnalytics({ token }: { token: string }) {
  const [fleetStats, setFleetStats] = useState<FleetStats | null>(null);
  const [analytics, setAnalytics] = useState<ShipmentAnalytics | null>(null);

  useEffect(() => {
    adminGetFleetStats(token)
      .then(setFleetStats)
      .catch(() => setFleetStats(null));
    adminGetAnalytics(token)
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
  }, [token]);

  const statCards = [
    {
      label: "Total Revenue",
      value: analytics ? formatNPR(analytics.totalRevenue) : "—",
      sub: "Collected to date",
      icon: DollarSign,
      iconClass: "bg-[#E5F1F3] text-[#1D7A8C]",
      ...deltaBadge(analytics?.revenueDelta ?? null),
    },
    {
      label: "Deliveries",
      value: analytics ? analytics.deliveries.toLocaleString("en-IN") : "—",
      sub: "Completed to date",
      icon: Truck,
      iconClass: "bg-[#E5F1F3] text-[#1D7A8C]",
      ...deltaBadge(analytics?.deliveriesDelta ?? null),
    },
    {
      label: "Avg. Time",
      value: formatDuration(analytics?.avgDeliveryMs ?? null),
      sub: "Order to door",
      icon: Timer,
      iconClass: "bg-[var(--accent-soft)] text-[var(--accent)]",
      ...deltaBadge(analytics?.avgTimeDelta ?? null, { lowerIsBetter: true }),
    },
    {
      label: "Success Rate",
      value: analytics ? `${analytics.successRate}%` : "—",
      sub: "Delivered vs cancelled",
      icon: ShieldCheck,
      iconClass: "bg-[#F3EBF9] text-[#6C63FF]",
      ...deltaBadge(analytics?.successDelta ?? null, { unit: " pts" }),
    },
  ];

  const totalVehicles = fleetStats?.total ?? 0;
  const percentage = (value: number) =>
    totalVehicles > 0 ? Math.round((value / totalVehicles) * 100) : 0;
  const fleetSegments = [
    {
      label: "Available",
      value: percentage(fleetStats?.available ?? 0),
      color: "var(--teal)",
    },
    {
      label: "Assigned",
      value: percentage(fleetStats?.assigned ?? 0),
      color: "var(--accent)",
    },
    {
      label: "Maintenance / Inactive",
      value:
        totalVehicles > 0
          ? 100 -
            percentage(fleetStats?.available ?? 0) -
            percentage(fleetStats?.assigned ?? 0)
          : 0,
      color: "var(--surface-muted)",
    },
  ];
  const r = 70;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  const months = analytics?.monthlyRevenue ?? [];
  const maxRevenue = Math.max(1, ...months.map((m) => m.revenue));
  const CHART = { left: 25, right: 475, top: 30, bottom: 190 };
  const points = months.map((m, i) => {
    const x =
      months.length > 1
        ? CHART.left + (i / (months.length - 1)) * (CHART.right - CHART.left)
        : (CHART.left + CHART.right) / 2;
    const y =
      CHART.bottom - (m.revenue / maxRevenue) * (CHART.bottom - CHART.top);
    return { x, y };
  });
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${CHART.bottom} ` +
        `L ${points[0].x.toFixed(1)} ${CHART.bottom} Z`
      : "";

  const regions = analytics?.regionVolume ?? [];
  const maxRegion = Math.max(1, ...regions.map((rg) => rg.count));
  const regionTotal = analytics?.totalShipments ?? 0;
  const regionShare = (count: number) =>
    regionTotal > 0 ? Math.round((count / regionTotal) * 100) : 0;
  const regionBar = "linear-gradient(90deg, #2E97AB, #1D7A8C)";
  const leader = regions[0];
  const rest = regions.slice(1);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <span className="page-kicker">Insights</span>
        <h1 className="page-title mt-1">Analytics</h1>
        <p className="page-subtitle">Track revenue, fleet efficiency, and delivery performance at a glance.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}>
                  <Icon size={18} className="stroke-[2.5]" />
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${TONE_CLASS[card.tone]}`}>
                  {card.text}
                </span>
              </div>
              <p className="mt-4 text-sm font-bold text-[var(--teal)]">{card.label}</p>
              <h3 className="mt-1 text-2xl font-black tracking-tight text-[var(--text)]">
                {card.value}
              </h3>
              <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">{card.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 lg:col-span-2"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-[var(--text)]">Revenue Trend</h3>
              <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                Paid revenue by month
              </p>
            </div>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold text-[var(--text-soft)]">
              Last 6 Months
            </span>
          </div>

          <div className="mt-6">
            <svg viewBox="0 0 500 220" className="h-56 w-full" preserveAspectRatio="none">
              {[40, 90, 140, 190].map((y) => (
                <line
                  key={y}
                  x1="10"
                  x2="490"
                  y1={y}
                  y2={y}
                  stroke="var(--border-light)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
              ))}
              {points.length > 0 && (
                <>
                  <path d={areaPath} fill="var(--teal)" fillOpacity="0.08" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="var(--teal)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="var(--surface)"
                      stroke="var(--teal)"
                      strokeWidth="3"
                    />
                  ))}
                </>
              )}
            </svg>
            <div className="mt-3 flex items-center justify-between px-2 text-xs font-bold text-[var(--teal)]">
              {(months.length > 0
                ? months.map((m) => m.label)
                : ["—", "—", "—", "—", "—", "—"]
              ).map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <h3 className="text-lg font-extrabold text-[var(--text)]">Fleet Performance</h3>
          <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
            Vehicle availability breakdown
          </p>

          <div className="relative mx-auto mt-5 h-44 w-44">
            <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
              <circle
                cx="90"
                cy="90"
                r={r}
                fill="none"
                stroke="var(--surface-muted)"
                strokeWidth="18"
              />
              {fleetSegments.map((seg) => {
                const dash = (seg.value / 100) * circumference;
                const offset = -(cumulative / 100) * circumference;
                cumulative += seg.value;
                return (
                  <circle
                    key={seg.label}
                    cx="90"
                    cy="90"
                    r={r}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="18"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={offset}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-[#6C63FF]">
                {percentage(
                  (fleetStats?.available ?? 0) + (fleetStats?.assigned ?? 0),
                )}
                %
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Optimal
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {fleetSegments.map((seg) => (
              <div key={seg.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-sm font-semibold text-[var(--text-soft)]">
                    {seg.label}
                  </span>
                </div>
                <span className="text-sm font-extrabold text-[var(--text)]">{seg.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--teal-tint)] text-[var(--teal)]">
              <MapPin size={18} className="stroke-[2.4]" />
            </span>
            <div>
              <h3 className="text-lg font-extrabold text-[var(--text)]">Deliveries by Region</h3>
              <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                Shipment volume concentration by destination district
              </p>
            </div>
          </div>
          {regions.length > 0 && (
            <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-bold text-[var(--text-soft)] sm:self-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />
              {regionTotal.toLocaleString("en-IN")} total shipments
            </span>
          )}
        </div>

        <div className="mt-6 space-y-2.5">
          {regions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] bg-[var(--surface-soft)] py-10 text-center">
              <MapPin size={22} className="text-[var(--text-muted)]" />
              <p className="text-sm font-semibold text-[var(--text-muted)]">
                {analytics ? "No shipment data yet." : "Loading regional volume…"}
              </p>
            </div>
          ) : (
            <>
              <div
                className="relative overflow-hidden rounded-[var(--radius-md)] border p-4"
                style={{
                  borderColor: "rgba(200,162,74,0.4)",
                  background: "linear-gradient(135deg, #FBF1DC 0%, #FFFFFF 55%)",
                }}
                title={`${leader.region} — ${leader.count.toLocaleString("en-IN")} shipments (${regionShare(leader.count)}% of total)`}
              >
                <span
                  className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(233,196,106,0.30), transparent 70%)" }}
                />
                <div className="relative flex items-center gap-3.5">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#3A2E12]"
                    style={{
                      background: "linear-gradient(135deg, #F0D083, #C99A3D)",
                      boxShadow: "0 6px 16px rgba(201,154,61,0.35)",
                    }}
                  >
                    <Crown size={20} className="stroke-[2.4]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#C99A3D]">
                      Top region
                    </span>
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 className="truncate text-base font-black text-[var(--text)]">
                        {leader.region}
                      </h4>
                      <span className="shrink-0 whitespace-nowrap text-lg font-black text-[var(--text)]">
                        {leader.count.toLocaleString("en-IN")}
                        <span className="ml-1 text-xs font-bold text-[var(--text-muted)]">
                          {regionShare(leader.count)}%
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/70">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(6, (leader.count / maxRegion) * 100)}%`,
                      background: regionBar,
                    }}
                  />
                </div>
              </div>

              {rest.map((rg, i) => (
                <div
                  key={rg.region}
                  className="group flex items-center gap-3.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 transition-all hover:border-[var(--border-strong)] hover:bg-[var(--surface-soft)]"
                  title={`${rg.region} — ${rg.count.toLocaleString("en-IN")} shipments (${regionShare(rg.count)}% of total)`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-sm font-black text-[var(--text-soft)]">
                    {i + 2}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-1.5 text-sm font-bold text-[var(--text)]">
                        <MapPin size={13} className="shrink-0 text-[var(--teal)]" />
                        <span className="truncate">{rg.region}</span>
                      </span>
                      <span className="shrink-0 whitespace-nowrap text-sm font-black text-[var(--text)]">
                        {rg.count.toLocaleString("en-IN")}
                        <span className="ml-1 text-xs font-semibold text-[var(--text-muted)]">
                          {regionShare(rg.count)}%
                        </span>
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.max(6, (rg.count / maxRegion) * 100)}%`,
                          background: regionBar,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
