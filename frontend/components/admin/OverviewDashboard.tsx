"use client";

import {
  Calendar,
  SlidersHorizontal,
  Package,
  Radio,
  CircleCheckBig,
  Wallet,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  ChevronRight,
  Info,
  Eye,
  User as UserIcon,
} from "lucide-react";

/* Screenshot-matched navy palette (kept local — the shared theme is gold/teal) */
const NAVY = "#0C3B67"; // headings + KPI values
const NAVY_BAR = "#123E6B"; // highlighted chart column
const BAR_IDLE = "#DCE5EE"; // inactive chart columns

const KPIS = [
  {
    label: "Total Shipments",
    value: "1,284",
    delta: "+12%",
    up: true,
    Icon: Package,
    tint: "bg-[#E8F0FB] text-[#2E6FD6]",
  },
  {
    label: "Active Now",
    value: "342",
    delta: "+5.4%",
    up: true,
    Icon: Radio,
    tint: "bg-[#E6F4EC] text-[#1F9D57]",
  },
  {
    label: "Delivered Today",
    value: "128",
    delta: "+18%",
    up: true,
    Icon: CircleCheckBig,
    tint: "bg-[#E5F1F3] text-[#1D7A8C]",
  },
  {
    label: "Pending COD",
    value: "Rs. 45,280",
    delta: "-2.1%",
    up: false,
    Icon: Wallet,
    tint: "bg-[#FBE9E5] text-[#D0533F]",
  },
];

const BARS = [
  { day: "Mon", h: 58 },
  { day: "Tue", h: 48 },
  { day: "Wed", h: 96, active: true },
  { day: "Thu", h: 66 },
  { day: "Fri", h: 60 },
  { day: "Sat", h: 30 },
  { day: "Sun", h: 42 },
];

const FLEET = [
  {
    label: "Ready to Dispatch",
    sub: "48 Vehicles",
    Icon: CheckCircle2,
    accent: "#1F9D57",
    tint: "bg-[#E6F4EC] text-[#1F9D57]",
  },
  {
    label: "Maintenance",
    sub: "12 Vehicles",
    Icon: Wrench,
    accent: "#C99A3D",
    tint: "bg-[#FBF1DC] text-[#C99A3D]",
  },
  {
    label: "Alerts / Issues",
    sub: "3 Critical",
    Icon: AlertTriangle,
    accent: "#D0453A",
    tint: "bg-[#FBE4E1] text-[#D0453A]",
  },
];

const STATUS_STYLES: Record<string, string> = {
  "in-transit": "bg-[#FDECD8] text-[#C77718]",
  delivered: "bg-[#DEF3E6] text-[#1E9E4C]",
  pending: "bg-[#FBF1DC] text-[#C99A3D]",
  failed: "bg-[#FBE4E1] text-[#D0453A]",
};

const SHIPMENTS = [
  {
    id: "#LN-8429",
    customer: "Rajesh Musalman",
    initials: "RM",
    avatar: "bg-[#E8F0FB] text-[#2E6FD6]",
    status: "In Transit",
    tone: "in-transit",
    driver: "Deepak Sharma",
    assigned: true,
    dest: "Pokhara, Ward 4",
  },
  {
    id: "#LN-8428",
    customer: "Sita Thapa",
    initials: "ST",
    avatar: "bg-[#E5F1F3] text-[#1D7A8C]",
    status: "Delivered",
    tone: "delivered",
    driver: "Bikash Rai",
    assigned: true,
    dest: "Kathmandu, Kalanki",
  },
  {
    id: "#LN-8427",
    customer: "Anil Gurung",
    initials: "AG",
    avatar: "bg-[#FBF1DC] text-[#C99A3D]",
    status: "Pending",
    tone: "pending",
    driver: "Unassigned",
    assigned: false,
    dest: "Butwal, Traffic Chowk",
  },
  {
    id: "#LN-8426",
    customer: "Kiran Basnet",
    initials: "KB",
    avatar: "bg-[#F0ECFB] text-[#6C63FF]",
    status: "Failed",
    tone: "failed",
    driver: "Deepak Sharma",
    assigned: true,
    dest: "Biratnagar, Ward 3",
  },
];

export default function OverviewDashboard() {
  return (
    <div className="space-y-6 font-sans">
      {/* ============ Page title + actions ============ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color: NAVY }}>
            Logistics Overview
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--text-soft)]">
            Real-time monitoring of your delivery ecosystem across Nepal.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" className="btn-secondary btn-sm cursor-pointer" suppressHydrationWarning>
            <Calendar size={15} />
            Last 7 Days
          </button>
          <button type="button" className="btn-secondary btn-sm cursor-pointer" suppressHydrationWarning>
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>
      </div>

      {/* ============ KPI cards ============ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi) => {
          const Icon = kpi.Icon;
          const Trend = kpi.up ? TrendingUp : TrendingDown;
          return (
            <div
              key={kpi.label}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.tint}`}>
                  <Icon size={19} className="stroke-[2.4]" />
                </div>
                <span
                  className={`flex items-center gap-0.5 text-xs font-bold ${
                    kpi.up ? "text-[#17A34A]" : "text-[#E0533F]"
                  }`}
                >
                  {kpi.delta}
                  <Trend size={13} className="stroke-[2.5]" />
                </span>
              </div>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-[#5A6B82]">
                {kpi.label}
              </p>
              <h3 className="mt-0.5 text-2xl font-black tracking-tight" style={{ color: NAVY }}>
                {kpi.value}
              </h3>
            </div>
          );
        })}
      </div>

      {/* ============ Chart + Fleet Health ============ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bar chart */}
        <div
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 lg:col-span-2"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
                Shipments over last 7 days
              </h3>
              <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                Daily volume analysis from current hub
              </p>
            </div>
            <button
              type="button"
              className="text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
              aria-label="More options"
              suppressHydrationWarning
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Bars */}
          <div className="mt-8 flex h-52 items-end gap-2.5 sm:gap-4">
            {BARS.map((bar) => (
              <div key={bar.day} className="flex h-full flex-1 flex-col justify-end">
                <div
                  className="w-full rounded-lg transition-all duration-500"
                  style={{
                    height: `${bar.h}%`,
                    backgroundColor: bar.active ? NAVY_BAR : BAR_IDLE,
                  }}
                />
              </div>
            ))}
          </div>
          {/* Day labels */}
          <div className="mt-3 flex gap-2.5 sm:gap-4">
            {BARS.map((bar) => (
              <span
                key={bar.day}
                className={`flex-1 text-center text-xs ${
                  bar.active
                    ? "font-extrabold text-[#123E6B]"
                    : "font-semibold text-[var(--text-muted)]"
                }`}
              >
                {bar.day}
              </span>
            ))}
          </div>
        </div>

        {/* Fleet Health + System Status */}
        <div
          className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
            Fleet Health
          </h3>

          <div className="mt-4 space-y-3">
            {FLEET.map((item) => {
              const Icon = item.Icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 pl-3 pr-3 text-left transition-all hover:bg-[var(--surface-soft)] cursor-pointer"
                  style={{ borderLeft: `3px solid ${item.accent}` }}
                  suppressHydrationWarning
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.tint}`}>
                    <Icon size={17} className="stroke-[2.4]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-tight text-[var(--text)]">{item.label}</p>
                    <p className="text-xs font-medium text-[var(--text-muted)]">{item.sub}</p>
                  </div>
                  <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />
                </button>
              );
            })}
          </div>

          {/* System status dark card */}
          <div
            className="mt-4 rounded-[var(--radius-md)] p-4"
            style={{ background: "linear-gradient(150deg, #0C2E4E, #123A5E)" }}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
                <Info size={15} />
              </div>
              <span className="text-sm font-bold text-white">System Status</span>
            </div>
            <p className="mt-2.5 text-xs font-medium leading-relaxed text-white/70">
              All delivery hubs are operating within optimal parameters.
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-[#6FA8DC]" style={{ width: "78%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ============ Recent Shipments ============ */}
      <div
        className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
            Recent Shipments
          </h3>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
              suppressHydrationWarning
            >
              Export CSV
            </button>
            <button
              type="button"
              className="text-xs font-bold text-[#123E6B] hover:underline cursor-pointer"
              suppressHydrationWarning
            >
              View All
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  ID
                </th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Customer
                </th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Status
                </th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Assigned Driver
                </th>
                <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Destination
                </th>
                <th className="pb-3 text-right text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {SHIPMENTS.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-[var(--border-light)] last:border-b-0 transition-colors hover:bg-[var(--surface-soft)]"
                >
                  <td className="py-4 font-bold" style={{ color: NAVY }}>
                    {s.id}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${s.avatar}`}
                      >
                        {s.initials}
                      </span>
                      <span className="font-semibold text-[var(--text)]">{s.customer}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[s.tone]}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-4">
                    {s.assigned ? (
                      <span className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
                        <UserIcon size={14} className="text-[var(--text-muted)]" />
                        {s.driver}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-medium italic text-[var(--text-muted)]">
                        <UserIcon size={14} />
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="py-4 font-medium text-[var(--text-soft)]">{s.dest}</td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[#123E6B] cursor-pointer"
                      aria-label={`View ${s.id}`}
                      suppressHydrationWarning
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
