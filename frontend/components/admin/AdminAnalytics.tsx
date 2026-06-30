"use client";

import {
  DollarSign,
  Truck,
  Timer,
  ShieldCheck,
  Download,
} from "lucide-react";

const STAT_CARDS = [
  {
    label: "Total Revenue",
    value: "$428,930",
    sub: "Vs last 30 days",
    delta: "+12.5%",
    deltaTone: "up" as const,
    icon: DollarSign,
    iconClass: "bg-[#E5F1F3] text-[#1D7A8C]",
  },
  {
    label: "Deliveries",
    value: "12,482",
    sub: "Completed this month",
    delta: "+4.2%",
    deltaTone: "up" as const,
    icon: Truck,
    iconClass: "bg-[#E5F1F3] text-[#1D7A8C]",
  },
  {
    label: "Avg. Time",
    value: "42.5m",
    sub: "Order to door",
    delta: "-1.8%",
    deltaTone: "down" as const,
    icon: Timer,
    iconClass: "bg-[var(--accent-soft)] text-[var(--accent)]",
  },
  {
    label: "Success Rate",
    value: "98.4%",
    sub: "Customer Satisfaction",
    delta: "99.2%",
    deltaTone: "up" as const,
    icon: ShieldCheck,
    iconClass: "bg-[#F3EBF9] text-[#6C63FF]",
  },
];

// Donut segments (must sum to 100)
const FLEET_SEGMENTS = [
  { label: "On-Time Deliveries", value: 64, color: "var(--teal)" },
  { label: "Slight Delay", value: 24, color: "var(--accent)" },
  { label: "Critical Lag", value: 12, color: "var(--surface-muted)" },
];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];

export default function AdminAnalytics() {
  // Donut geometry
  const r = 70;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Page header */}
      <div>
        <span className="page-kicker">Insights</span>
        <h1 className="page-title mt-1">Analytics</h1>
        <p className="page-subtitle">Track revenue, fleet efficiency, and delivery performance at a glance.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => {
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
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    card.deltaTone === "up"
                      ? "bg-[rgba(95,127,53,0.1)] text-[var(--success)]"
                      : "bg-[rgba(181,71,59,0.1)] text-[var(--danger)]"
                  }`}
                >
                  {card.delta}
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

      {/* Middle row: revenue forecast + fleet performance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Forecast */}
        <div
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 lg:col-span-2"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-[var(--text)]">Revenue Forecast</h3>
              <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                Quarterly growth analysis
              </p>
            </div>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-bold text-[var(--text-soft)]">
              Last 6 Months
            </span>
          </div>

          {/* Line chart */}
          <div className="mt-6">
            <svg viewBox="0 0 500 220" className="h-56 w-full" preserveAspectRatio="none">
              {/* Horizontal grid lines */}
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
              {/* Forecast dashed curve */}
              <path
                d="M 25 175 C 110 150, 150 110, 230 85 S 360 55, 420 70 L 475 88"
                fill="none"
                stroke="var(--teal)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="10 10"
              />
            </svg>
            {/* Month labels */}
            <div className="mt-3 flex items-center justify-between px-2 text-xs font-bold text-[var(--teal)]">
              {MONTHS.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Fleet Performance */}
        <div
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <h3 className="text-lg font-extrabold text-[var(--text)]">Fleet Performance</h3>
          <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
            Driver efficiency by zone
          </p>

          {/* Donut chart */}
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
              {FLEET_SEGMENTS.map((seg) => {
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
              <span className="text-3xl font-black text-[#6C63FF]">88%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Optimal
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 space-y-3">
            {FLEET_SEGMENTS.map((seg) => (
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

      {/* Delivery Density Map */}
      <div
        className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[var(--text)]">Delivery Density Map</h3>
            <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
              Regional volume concentration - Metropolitan Area
            </p>
          </div>
          <button
            type="button"
            className="btn-primary btn-sm self-start sm:self-auto cursor-pointer"
            suppressHydrationWarning
          >
            <Download size={16} />
            Export Data
          </button>
        </div>

        {/* Heatmap grid */}
        <div className="mt-5 grid grid-cols-6 gap-2.5 sm:grid-cols-8 lg:grid-cols-10">
          {HEATMAP.map((intensity, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg"
              style={{
                backgroundColor:
                  intensity === 0
                    ? "var(--teal-tint)"
                    : `color-mix(in srgb, var(--teal) ${intensity}%, var(--teal-tint))`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Relative intensity (0-100) for the density heatmap cells
const HEATMAP = [
  20, 10, 80, 15, 30, 10, 55, 20, 10, 40,
  35, 70, 90, 25, 10, 45, 15, 60, 30, 10,
  10, 25, 50, 40, 75, 20, 35, 10, 55, 25,
  60, 15, 30, 65, 20, 85, 10, 40, 20, 50,
];
