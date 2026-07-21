"use client";

import {
  Calendar,
  Package,
  Radio,
  CircleCheckBig,
  Wallet,
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
  getShipmentDisplayStatus,
  type DailyVolume,
  type Shipment,
  type ShipmentStats,
  type ShipmentStatus,
} from "@/lib/api/shipment.api";
import { formatNPR } from "@/lib/pricing";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import {
  adminGetFleetStats,
  type FleetStats,
} from "@/lib/api/fleet.api";
import { getInitials } from "@/lib/ui-helpers";

const NAVY = "var(--accent-strong)";
const BAR_IDLE = "var(--border)";
const MAX_BAR_HEIGHT = 84;

type ChartBar = {
  date: string;
  day: string;
  count: number;
  heightPercent: number;
};

function buildBars(dailyVolume: DailyVolume[]): ChartBar[] {
  const maxCount = Math.max(0, ...dailyVolume.map((day) => day.count));

  return dailyVolume.map((day) => ({
    date: day.date,
    day: day.label,
    count: day.count,
    heightPercent:
      maxCount === 0 ? 0 : Math.round((day.count / maxCount) * MAX_BAR_HEIGHT),
  }));
}

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  "in-transit": "bg-[var(--warning-soft)] text-[var(--warning)]",
  delivered: "bg-[var(--success-soft)] text-[var(--success)]",
  pending: "bg-[var(--gold-tint)] text-[var(--accent-hover)]",
  cancelled: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const AVATAR_STYLES = [
  "bg-[var(--info-soft)] text-[var(--info)]",
  "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
  "bg-[var(--gold-tint)] text-[var(--accent-hover)]",
  "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
];

function getDestination(shipment: Shipment): string {
  return [shipment.delivery.city, shipment.delivery.district]
    .filter(Boolean)
    .join(", ") || "-";
}

export default function OverviewDashboard({ token }: { token: string }) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [shipmentStats, setShipmentStats] = useState<ShipmentStats | null>(null);
  const [fleetStats, setFleetStats] = useState<FleetStats | null>(null);
  const [loadingShipments, setLoadingShipments] = useState(true);
  const [loadingShipmentStats, setLoadingShipmentStats] = useState(true);
  const [recentShipmentsError, setRecentShipmentsError] = useState<string | null>(null);
  const [shipmentStatsError, setShipmentStatsError] = useState<string | null>(null);
  const [fleetError, setFleetError] = useState<string | null>(null);

  const loadRecentShipments = useCallback(async () => {
    try {
      const result = await adminGetShipments(token, 1, 4);
      setShipments(result.data);
      setRecentShipmentsError(null);
    } catch (error) {
      setRecentShipmentsError(
        error instanceof Error ? error.message : "Failed to load recent shipments",
      );
    } finally {
      setLoadingShipments(false);
    }
  }, [token]);

  const loadShipmentStats = useCallback(async () => {
    try {
      const stats = await adminGetShipmentStats(token);
      setShipmentStats(stats);
      setShipmentStatsError(null);
    } catch (error) {
      setShipmentStatsError(
        error instanceof Error ? error.message : "Failed to load shipment analytics",
      );
    } finally {
      setLoadingShipmentStats(false);
    }
  }, [token]);

  const loadFleetStats = useCallback(async () => {
    try {
      const fleet = await adminGetFleetStats(token);
      setFleetStats(fleet);
      setFleetError(null);
    } catch (error) {
      setFleetError(
        error instanceof Error ? error.message : "Failed to load fleet status",
      );
    }
  }, [token]);

  const loadDashboard = useCallback(async () => {
    await Promise.all([
      loadRecentShipments(),
      loadShipmentStats(),
      loadFleetStats(),
    ]);
  }, [loadFleetStats, loadRecentShipments, loadShipmentStats]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useAutoRefresh(loadDashboard, { intervalMs: 60_000 });

  const kpis = [
    {
      label: "Total Shipments",
      value: shipmentStats?.total.toLocaleString("en-IN") ?? "-",
      Icon: Package,
      tint: "bg-[var(--info-soft)] text-[var(--info)]",
    },
    {
      label: "Active Now",
      value: shipmentStats?.inTransit.toLocaleString("en-IN") ?? "-",
      Icon: Radio,
      tint: "bg-[var(--success-soft)] text-[var(--success)]",
    },
    {
      label: "Delivered Today",
      value: shipmentStats?.deliveredToday.toLocaleString("en-IN") ?? "-",
      Icon: CircleCheckBig,
      tint: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
    },
    {
      label: "Pending COD",
      value: shipmentStats ? formatNPR(shipmentStats.pendingCodAmount) : "-",
      Icon: Wallet,
      tint: "bg-[var(--danger-soft)] text-[var(--danger)]",
    },
  ];

  const bars = shipmentStats ? buildBars(shipmentStats.dailyVolume) : null;
  const weekTotal = shipmentStats
    ? shipmentStats.dailyVolume.reduce((sum, d) => sum + d.count, 0)
    : 0;

  const fleetTotal = fleetStats?.total ?? 0;
  const fleetOperational =
    (fleetStats?.available ?? 0) + (fleetStats?.active ?? 0);
  const fleetHealthPct =
    fleetTotal > 0 ? Math.round((fleetOperational / fleetTotal) * 100) : 0;
  const systemStatusMessage = fleetError
    ? "Fleet status is temporarily unavailable."
    : !fleetStats
      ? "Checking fleet status..."
    : fleetTotal === 0
      ? "No vehicles registered in the fleet yet."
      : `${fleetOperational} of ${fleetTotal} vehicle${fleetTotal === 1 ? "" : "s"} operational across all hubs.`;
  const fleetHealth = [
    {
      label: "Ready to Dispatch",
      sub: `${fleetStats?.available ?? 0} Vehicles`,
      Icon: CheckCircle2,
      accent: "var(--success)",
      tint: "bg-[var(--success-soft)] text-[var(--success)]",
    },
    {
      label: "Maintenance",
      sub: `${fleetStats?.maintenanceRequired ?? 0} Vehicles`,
      Icon: Wrench,
      accent: "#C99A3D",
      tint: "bg-[var(--gold-tint)] text-[var(--accent-hover)]",
    },
    {
      label: "Inactive",
      sub: `${fleetStats?.inactive ?? 0} Vehicles`,
      Icon: AlertTriangle,
      accent: "var(--danger)",
      tint: "bg-[var(--danger-soft)] text-[var(--danger)]",
    },
  ];

  return (
    <div className="space-y-6 font-sans">
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
          <div
            className="btn-secondary btn-sm"
            aria-label="Dashboard reporting period: last 7 days"
          >
            <Calendar size={15} />
            Last 7 Days
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.Icon;
          return (
            <div
              key={kpi.label}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.tint}`}>
                <Icon size={19} className="stroke-[2.4]" />
              </div>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-[var(--inactive)]">
                {kpi.label}
              </p>
              <h3 className="mt-0.5 text-2xl font-black tracking-tight" style={{ color: NAVY }}>
                {kpi.value}
              </h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6 lg:col-span-2"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
                Shipments over last 7 days
              </h3>
              <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                {shipmentStats
                  ? `${weekTotal.toLocaleString("en-IN")} shipment${weekTotal === 1 ? "" : "s"} in the last 7 days`
                  : loadingShipmentStats
                    ? "Loading seven-day shipment volume…"
                    : "Seven-day shipment volume is unavailable"}
              </p>
            </div>
          </div>

          {shipmentStatsError && shipmentStats && (
            <p className="mt-2 text-xs font-semibold text-[var(--danger)]" role="status">
              Could not refresh the chart. Showing the latest available data.
            </p>
          )}

          <div
            className="mt-8 flex h-52 items-end gap-2.5 sm:gap-4"
            role={bars ? "list" : undefined}
            aria-label={bars ? "Shipment counts for the last 7 days" : undefined}
          >
            {bars === null ? (
              shipmentStatsError ? (
                <div
                  className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-4 text-center"
                  role="alert"
                >
                  <p className="text-sm font-bold text-[var(--text)]">
                    Shipment analytics could not be loaded.
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Check the connection and try again.
                  </p>
                  <button
                    type="button"
                    className="btn-secondary btn-sm mt-4 cursor-pointer"
                    onClick={() => void loadShipmentStats()}
                  >
                    Try again
                  </button>
                </div>
              ) : (
                Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="flex h-full flex-1 flex-col justify-end">
                    <div
                      className="w-full animate-pulse rounded-lg"
                      style={{ height: `${30 + ((index * 37) % 55)}%`, backgroundColor: BAR_IDLE }}
                    />
                  </div>
                ))
              )
            ) : (
              bars.map((bar) => (
                <div
                  key={bar.date}
                  className="flex h-full flex-1 flex-col justify-end"
                  role="listitem"
                  aria-label={`${bar.day}, ${bar.date}: ${bar.count} shipment${bar.count === 1 ? "" : "s"}`}
                >

                  <div
                    className={`w-full rounded-lg transition-all duration-500 ${
                      bar.count > 0
                        ? "bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
                        : "bg-[var(--border)]"
                    }`}
                    style={{
                      height:
                        bar.count === 0 ? "0.25rem" : `${bar.heightPercent}%`,
                      minHeight: bar.count > 0 ? "0.75rem" : undefined,
                    }}
                    title={`${bar.day}: ${bar.count} shipment${bar.count === 1 ? "" : "s"}`}
                  />
                </div>
              ))
            )}
          </div>
          {(bars !== null || !shipmentStatsError) && (
            <div className="mt-3 flex gap-2.5 sm:gap-4">
              {(bars ?? Array.from({ length: 7 }, () => null)).map((bar, index) => (
                <span
                  key={bar?.date ?? index}
                  title={bar?.date}
                  className={`flex-1 text-center text-xs ${
                    bar && bar.count > 0
                      ? "font-extrabold text-[var(--accent-strong)]"
                      : "font-semibold text-[var(--text-muted)]"
                  }`}
                >
                  {bar?.day ?? "-"}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
            Fleet Health
          </h3>

          <div className="mt-4 space-y-3">
            {fleetHealth.map((item) => {
              const Icon = item.Icon;
              return (
                <Link
                  key={item.label}
                  href="/admin/fleet"
                  className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] py-3 pl-3 pr-3 text-left transition-all hover:bg-[var(--surface-soft)] cursor-pointer"
                  style={{ borderLeft: `3px solid ${item.accent}` }}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.tint}`}>
                    <Icon size={17} className="stroke-[2.4]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-tight text-[var(--text)]">{item.label}</p>
                    <p className="text-xs font-medium text-[var(--text-muted)]">{item.sub}</p>
                  </div>
                  <ChevronRight size={16} className="text-[var(--text-muted)] shrink-0" />
                </Link>
              );
            })}
          </div>

          <div
            className="mt-4 rounded-[var(--radius-md)] p-4"
            style={{ background: "linear-gradient(150deg, var(--accent-hover), var(--accent-strong))" }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white">
                  <Info size={15} />
                </div>
                <span className="text-sm font-bold text-white">System Status</span>
              </div>
              {fleetStats && fleetTotal > 0 && (
                <span className="text-sm font-black text-white">{fleetHealthPct}%</span>
              )}
            </div>
            <p className="mt-2.5 text-xs font-medium leading-relaxed text-white/70">
              {systemStatusMessage}
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[var(--accent-hover)] transition-all duration-500"
                style={{ width: `${fleetHealthPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
            Recent Shipments
          </h3>
          <Link
            href="/admin/shipments"
            className="text-xs font-bold text-[var(--accent-strong)] hover:underline"
          >
            View All
          </Link>
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
              ) : recentShipmentsError ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm font-medium text-[var(--danger)]">
                    {recentShipmentsError}
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
                            {getInitials(customer, "CU")}
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
                          {getShipmentDisplayStatus(shipment)}
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
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--accent-strong)]"
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
