"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, FileText, HelpCircle, Package, MapPin } from "lucide-react";
import type { AuthUser } from "@/lib/api/auth.api";
import {
  getMyShipments,
  getShipmentDisplayStatus,
  type Shipment as CustomerShipment,
} from "@/lib/api/shipment.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

const RECENT_STATUS_STYLES: Record<CustomerShipment["status"], string> = {
  pending: "bg-[var(--warning-soft)] text-[var(--warning)]",
  "in-transit": "bg-[var(--info-soft)] text-[var(--info)]",
  delivered: "bg-[var(--success-soft)] text-[var(--success)]",
  cancelled: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

export default function DashboardOverview({
  user,
  token,
}: {
  user: AuthUser;
  token: string;
}) {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [trackingError, setTrackingError] = useState("");
  const [recentShipments, setRecentShipments] = useState<CustomerShipment[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState("");

  const loadRecentShipments = useCallback(
    async (showLoading = false) => {
      try {
        if (showLoading) setRecentLoading(true);
        const customerShipments = await getMyShipments(token);
        setRecentShipments(customerShipments);
        setRecentError("");
      } catch (error) {
        setRecentError(
          error instanceof Error
            ? error.message
            : "Unable to load recent shipments.",
        );
      } finally {
        setRecentLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadRecentShipments(true);
  }, [loadRecentShipments]);

  useAutoRefresh(() => loadRecentShipments(), { intervalMs: 60_000 });

  const handleTrackParcel = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedTrackingId = trackingId.trim();

    if (!normalizedTrackingId) {
      setTrackingError("Enter a tracking ID to continue.");
      return;
    }

    setTrackingError("");
    router.push(`/tracking?trackingId=${encodeURIComponent(normalizedTrackingId)}`);
  };

  const activeShipments = recentShipments.filter(
    (shipment) =>
      shipment.status === "pending" || shipment.status === "in-transit",
  );

  return (
    <div className="space-y-6 font-sans">
      <div>
        <p className="text-sm font-semibold text-[var(--success)] mb-1">
          Good morning, {user?.fullName?.split(" ")[0] || "Alexander"}
        </p>
        <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">
          Your Logistics Overview
        </h1>
      </div>

      <nav
        aria-label="Dashboard quick actions"
        className="flex w-fit max-w-full flex-wrap items-center gap-2.5 sm:gap-3"
      >
        <button
          type="button"
          className="group inline-flex h-11 w-fit items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--text)] shadow-[0_4px_14px_rgba(32,50,74,0.06)] transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)] hover:shadow-[0_8px_20px_rgba(121,83,18,0.12)]"
          suppressHydrationWarning
        >
          <Building2
            size={17}
            className="text-[var(--accent-strong)] transition-transform group-hover:scale-110"
          />
          Delivery Network
        </button>
        <Link
          href="/payments"
          className="group inline-flex h-11 w-fit items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--text)] no-underline shadow-[0_4px_14px_rgba(32,50,74,0.06)] transition-all hover:-translate-y-0.5 hover:border-[rgba(200,162,74,0.45)] hover:bg-[var(--accent-soft)] hover:shadow-[0_8px_20px_rgba(200,162,74,0.12)]"
        >
          <FileText
            size={17}
            className="text-[var(--accent)] transition-transform group-hover:scale-110"
          />
          View Payments
        </Link>
        <Link
          href="/inquiries"
          className="group inline-flex h-11 w-fit items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--text)] no-underline shadow-[0_4px_14px_rgba(32,50,74,0.06)] transition-all hover:-translate-y-0.5 hover:border-[var(--danger)]/40 hover:bg-[var(--danger-soft)] hover:shadow-[0_8px_20px_rgba(211,106,98,0.12)]"
        >
          <HelpCircle
            size={17}
            className="text-[var(--danger)] transition-transform group-hover:scale-110"
          />
          Get Help
        </Link>
      </nav>

      <form
        onSubmit={handleTrackParcel}
        className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <MapPin size={21} />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-[var(--text)]">
              Track a Parcel
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Enter your tracking ID to see the latest delivery movement.
            </p>
          </div>
        </div>

        <div className="w-full sm:max-w-md">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="dashboard-tracking-id" className="sr-only">
              Tracking ID
            </label>
            <input
              id="dashboard-tracking-id"
              type="text"
              value={trackingId}
              onChange={(event) => {
                setTrackingId(event.target.value);
                if (trackingError) setTrackingError("");
              }}
              placeholder="e.g. LN-482913"
              autoComplete="off"
              className="h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm font-semibold uppercase text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              suppressHydrationWarning
            />
            <button
              type="submit"
              className="h-11 shrink-0 rounded-xl bg-[var(--accent)] px-5 text-sm font-bold text-[var(--text-on-accent)] transition-colors hover:bg-[var(--accent-hover)]"
              suppressHydrationWarning
            >
              Track Now
            </button>
          </div>
          {trackingError && (
            <p className="mt-2 text-xs font-semibold text-[var(--danger)]" role="alert">
              {trackingError}
            </p>
          )}
        </div>
      </form>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[var(--text)]">
            Active Shipments
          </h2>
          <Link
            href="/shipments/history"
            className="text-sm font-semibold text-[var(--info)] no-underline hover:underline"
          >
            See all active ({activeShipments.length})
          </Link>
        </div>

        {recentLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-52 animate-pulse rounded-2xl border border-[var(--border)] bg-white p-5"
              >
                <div className="h-4 w-1/2 rounded bg-[var(--surface-muted)]" />
                <div className="mt-5 h-5 w-2/3 rounded bg-[var(--surface-muted)]" />
                <div className="mt-8 h-3 w-full rounded bg-[var(--surface-muted)]" />
              </div>
            ))}
          </div>
        ) : recentError ? (
          <div className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-5 text-sm font-semibold text-[var(--danger)]">
            {recentError}
          </div>
        ) : activeShipments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-8 text-center">
            <Package size={30} className="mx-auto text-[var(--text-muted)]" />
            <p className="mt-3 text-sm font-bold text-[var(--text)]">
              No active shipments
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              New confirmed shipments will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {activeShipments.slice(0, 3).map((shipment) => {
              const progress = shipment.status === "in-transit" ? 70 : 25;
              const from =
                [shipment.pickup.city, shipment.pickup.district]
                  .filter(Boolean)
                  .join(", ") || "Pickup location";
              const to =
                [shipment.delivery.city, shipment.delivery.district]
                  .filter(Boolean)
                  .join(", ") || "Delivery location";
              const parcelName = `${
                shipment.package.parcelType.charAt(0).toUpperCase() +
                shipment.package.parcelType.slice(1)
              } parcel`;

              return (
                <Link
                  key={shipment.id}
                  href={`/tracking?trackingId=${encodeURIComponent(shipment.trackingId)}`}
                  className="rounded-2xl border border-[var(--border)] bg-white p-5 no-underline shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="truncate text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      {shipment.trackingId}
                    </p>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${RECENT_STATUS_STYLES[shipment.status]}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          shipment.status === "in-transit"
                            ? "bg-[var(--info)]"
                            : "bg-[var(--warning)]"
                        }`}
                      />
                      {getShipmentDisplayStatus(shipment)}
                    </span>
                  </div>

                  <h3 className="mb-3 text-base font-extrabold text-[var(--text)]">
                    {parcelName}
                  </h3>

                  <div className="mb-3 flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        From
                      </p>
                      <p className="truncate text-sm font-semibold text-[var(--text)]">
                        {from}
                      </p>
                    </div>
                    <Package size={16} className="shrink-0 text-[var(--text-muted)]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        To
                      </p>
                      <p className="truncate text-sm font-semibold text-[var(--text)]">
                        {to}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 h-2 w-full rounded-full bg-[var(--surface-muted)]">
                    <div
                      className="h-2 rounded-full bg-[var(--accent)] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="text-xs font-medium text-[var(--text-muted)]">
                    {shipment.status === "pending"
                      ? "Awaiting dispatch"
                      : shipment.assignedDriver
                        ? `Driver: ${shipment.assignedDriver}`
                        : "Shipment is moving to its destination"}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-[var(--surface-dark-2)] rounded-2xl p-6 shadow-lg border border-[var(--border-dark)] relative overflow-hidden">
            <h2 className="text-lg font-extrabold text-white mb-4">
              Live Fleet Tracking
            </h2>
            
            <div className="relative h-64 bg-[var(--surface-dark)] rounded-xl overflow-hidden">
              <svg className="absolute inset-0 w-full h-full">
                <path
                  d="M 150 120 Q 200 80 280 100"
                  stroke="var(--info)"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                />
                <path
                  d="M 450 180 Q 550 150 650 200"
                  stroke="var(--success)"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                />
                <path
                  d="M 200 140 Q 350 180 450 220"
                  stroke="var(--warning)"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                />
                
                <circle cx="150" cy="120" r="4" fill="var(--info)" />
                <circle cx="280" cy="100" r="4" fill="var(--info)" />
                <circle cx="450" cy="180" r="4" fill="var(--success)" />
                <circle cx="650" cy="200" r="4" fill="var(--success)" />
                <circle cx="200" cy="140" r="4" fill="var(--warning)" />
                <circle cx="450" cy="220" r="4" fill="var(--warning)" />
              </svg>

              <div className="absolute top-4 right-4 flex items-center gap-4 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--success)]" />
                  <span className="text-xs font-semibold text-white">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[var(--warning)]" />
                  <span className="text-xs font-semibold text-white">Alert</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
            <div className="border-b border-[var(--border)] p-5">
              <h2 className="text-lg font-extrabold text-[var(--text)]">
                Recent Shipments
              </h2>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {recentLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="animate-pulse p-4">
                    <div className="h-4 w-2/3 rounded bg-[var(--surface-muted)]" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-[var(--surface-muted)]" />
                  </div>
                ))
              ) : recentError ? (
                <p className="p-5 text-sm font-medium text-[var(--danger)]">
                  {recentError}
                </p>
              ) : recentShipments.length === 0 ? (
                <div className="p-5 text-center">
                  <Package
                    size={26}
                    className="mx-auto text-[var(--text-muted)]"
                  />
                  <p className="mt-2 text-sm font-bold text-[var(--text)]">
                    No shipments yet
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Your confirmed shipments will appear here.
                  </p>
                </div>
              ) : (
                recentShipments.slice(0, 4).map((shipment) => (
                  <Link
                    key={shipment.id}
                    href={`/tracking?trackingId=${encodeURIComponent(shipment.trackingId)}`}
                    className="block p-4 no-underline transition-colors hover:bg-[var(--surface-soft)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-extrabold text-[var(--text)]">
                          {shipment.delivery.recipientName ||
                            shipment.delivery.city ||
                            "Parcel delivery"}
                        </h3>
                        <p className="mt-1 text-xs font-semibold text-[var(--text-muted)]">
                          {shipment.trackingId}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${RECENT_STATUS_STYLES[shipment.status]}`}
                      >
                        {getShipmentDisplayStatus(shipment)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
                      <span className="truncate">
                        {shipment.delivery.city ||
                          shipment.delivery.district ||
                          "Destination pending"}
                      </span>
                      <time className="shrink-0" dateTime={shipment.createdAt}>
                        {new Intl.DateTimeFormat("en-NP", {
                          month: "short",
                          day: "numeric",
                        }).format(new Date(shipment.createdAt))}
                      </time>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="bg-[var(--accent-soft)] p-4">
              <Link
                href="/shipments/history"
                className="block w-full rounded-lg py-2.5 text-center text-sm font-bold text-[var(--accent)] no-underline transition-colors hover:bg-[var(--accent-soft)]"
              >
                VIEW SHIPMENT HISTORY
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
