"use client";

import {
  Calendar,
  SlidersHorizontal,
  Package,
  Radio,
  CircleCheckBig,
  Wallet,
  MoreHorizontal,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  ChevronRight,
  Info,
  Eye,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  adminGetShipments,
  adminGetShipmentStats,
  type Shipment,
  type ShipmentStats,
  type ShipmentStatus,
} from "@/lib/api/shipment.api";
import { formatNPR } from "@/lib/pricing";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

/* Screenshot-matched navy palette (kept local — the shared theme is gold/teal) */
const NAVY = "#0C3B67"; // headings + KPI values
const NAVY_BAR = "#123E6B"; // highlighted chart column
const BAR_IDLE = "#DCE5EE"; // inactive chart columns

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

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  "in-transit": "bg-[#FDECD8] text-[#C77718]",
  delivered: "bg-[#DEF3E6] text-[#1E9E4C]",
  pending: "bg-[#FBF1DC] text-[#C99A3D]",
  cancelled: "bg-[#FBE4E1] text-[#D0453A]",
};

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  "in-transit": "In Transit",
  delivered: "Delivered",
  pending: "Pending",
  cancelled: "Cancelled",
};

const AVATAR_STYLES = [
  "bg-[#E8F0FB] text-[#2E6FD6]",
  "bg-[#E5F1F3] text-[#1D7A8C]",
  "bg-[#FBF1DC] text-[#C99A3D]",
  "bg-[#F0ECFB] text-[#6C63FF]",
];

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "CU";
}

function getDestination(shipment: Shipment): string {
  return [shipment.delivery.city, shipment.delivery.district]
    .filter(Boolean)
    .join(", ") || "—";
}

export default function OverviewDashboard({ token }: { token: string }) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [shipmentStats, setShipmentStats] = useState<ShipmentStats | null>(null);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [shipmentError, setShipmentError] = useState<string | null>(null);

  const loadRecentShipments = useCallback(async () => {
    try {
      const [result, stats] = await Promise.all([
        adminGetShipments(token, 1, 4),
        adminGetShipmentStats(token),
      ]);
      setShipments(result.data);
      setShipmentStats(stats);
      setShipmentError(null);
    } catch (error) {
      setShipmentError(
        error instanceof Error ? error.message : "Failed to load recent shipments",
      );
    } finally {
      setLoadingShipments(false);
    }
  }, [token]);

  useEffect(() => {
    loadRecentShipments();
  }, [loadRecentShipments]);

  // Keep the KPIs and recent-shipments table in sync as customers place orders.
  useAutoRefresh(loadRecentShipments, { intervalMs: 15_000 });

  const kpis = [
    {
      label: "Total Shipments",
      value: shipmentStats?.total.toLocaleString("en-IN") ?? "—",
      Icon: Package,
      tint: "bg-[#E8F0FB] text-[#2E6FD6]",
    },
    {
      label: "Active Now",
      value: shipmentStats?.inTransit.toLocaleString("en-IN") ?? "—",
      Icon: Radio,
      tint: "bg-[#E6F4EC] text-[#1F9D57]",
    },
    {
      label: "Delivered Today",
      value: shipmentStats?.deliveredToday.toLocaleString("en-IN") ?? "—",
      Icon: CircleCheckBig,
      tint: "bg-[#E5F1F3] text-[#1D7A8C]",
    },
    {
      label: "Pending COD",
      value: shipmentStats ? formatNPR(shipmentStats.pendingCodAmount) : "—",
      Icon: Wallet,
      tint: "bg-[#FBE9E5] text-[#D0533F]",
    },
  ];

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
        {kpis.map((kpi) => {
          const Icon = kpi.Icon;
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
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#1F9D57]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1F9D57]" />
                  Live
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
            <Link
              href="/admin/shipments"
              className="text-xs font-bold text-[#123E6B] hover:underline"
            >
              View All
            </Link>
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
              {loadingShipments ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="animate-pulse border-b border-[var(--border-light)]">
                    {Array.from({ length: 6 }).map((__, cell) => (
                      <td key={cell} className="py-4 pr-4">
                        <div className="h-4 max-w-28 rounded bg-[var(--border)]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : shipmentError ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm font-medium text-red-600">
                    {shipmentError}
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm font-medium text-[var(--text-muted)]">
                    No customer shipments have been placed yet.
                  </td>
                </tr>
              ) : (
                shipments.map((shipment, index) => {
                  const customer = shipment.pickup.fullName || "Customer";
                  const assigned = Boolean(shipment.assignedDriver);

                  return (
                    <tr
                      key={shipment.id}
                      className="border-b border-[var(--border-light)] last:border-b-0 transition-colors hover:bg-[var(--surface-soft)]"
                    >
                      <td className="py-4 font-bold" style={{ color: NAVY }}>
                        #{shipment.trackingId}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${AVATAR_STYLES[index % AVATAR_STYLES.length]}`}
                          >
                            {getInitials(customer)}
                          </span>
                          <span className="font-semibold text-[var(--text)]">
                            {customer}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[shipment.status]}`}
                        >
                          {STATUS_LABELS[shipment.status]}
                        </span>
                      </td>
                      <td className="py-4">
                        {assigned ? (
                          <span className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
                            <UserIcon size={14} className="text-[var(--text-muted)]" />
                            {shipment.assignedDriver}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 font-medium italic text-[var(--text-muted)]">
                            <UserIcon size={14} />
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-4 font-medium text-[var(--text-soft)]">
                        {getDestination(shipment)}
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          href="/admin/shipments"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[#123E6B]"
                          aria-label={`View ${shipment.trackingId}`}
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
