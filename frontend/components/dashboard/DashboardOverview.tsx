"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Plus, Search, Building2, FileText, HelpCircle, Package, MapPin } from "lucide-react";
import type { AuthUser } from "@/lib/api/auth.api";
import {
  getMyShipments,
  type Shipment as CustomerShipment,
} from "@/lib/api/shipment.api";

const RECENT_STATUS_LABELS: Record<CustomerShipment["status"], string> = {
  pending: "Pending",
  "in-transit": "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const RECENT_STATUS_STYLES: Record<CustomerShipment["status"], string> = {
  pending: "bg-[#FFF3DD] text-[#A96512]",
  "in-transit": "bg-[#EAF1FC] text-[#3E80E5]",
  delivered: "bg-[#E2F5EA] text-[#18864B]",
  cancelled: "bg-[#FDE8E5] text-[#C43D32]",
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

  useEffect(() => {
    let active = true;

    const loadRecentShipments = async (showLoading = false) => {
      try {
        if (showLoading) setRecentLoading(true);
        const customerShipments = await getMyShipments(token);
        if (!active) return;
        setRecentShipments(customerShipments);
        setRecentError("");
      } catch (error) {
        if (!active) return;
        setRecentError(
          error instanceof Error
            ? error.message
            : "Unable to load recent shipments.",
        );
      } finally {
        if (active) setRecentLoading(false);
      }
    };

    void loadRecentShipments(true);
    const refreshId = window.setInterval(loadRecentShipments, 15_000);
    const handleFocus = () => void loadRecentShipments();
    window.addEventListener("focus", handleFocus);

    return () => {
      active = false;
      window.clearInterval(refreshId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [token]);

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--success)] mb-1">
            Good morning, {user?.fullName?.split(" ")[0] || "Alexander"}
          </p>
          <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">
            Your Logistics Overview
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2.5 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
          <Link
            href="/shipments"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D7A8C] hover:bg-[#15656e] text-white text-sm font-bold transition-colors no-underline"
          >
            <Plus size={16} />
            New Shipment
          </Link>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-white hover:bg-[var(--surface-soft)] text-sm font-semibold text-[var(--text)] transition-all"
        >
          <Search size={18} className="text-[var(--accent)]" />
          Track Package
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-white hover:bg-[var(--surface-soft)] text-sm font-semibold text-[var(--text)] transition-all"
        >
          <Building2 size={18} className="text-[var(--accent)]" />
          Delivery Network
        </button>
        <Link
          href="/billing"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-white hover:bg-[var(--surface-soft)] text-sm font-semibold text-[var(--text)] transition-all no-underline"
        >
          <FileText size={18} className="text-[var(--accent)]" />
          View Invoices
        </Link>
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-white hover:bg-[var(--surface-soft)] text-sm font-semibold text-[var(--text)] transition-all"
        >
          <HelpCircle size={18} className="text-[var(--accent)]" />
          Get Help
        </button>
      </div>

      {/* Quick parcel tracking */}
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
              className="h-11 shrink-0 rounded-xl bg-[#1D7A8C] px-5 text-sm font-bold text-white transition-colors hover:bg-[#15656e]"
              suppressHydrationWarning
            >
              Track Now
            </button>
          </div>
          {trackingError && (
            <p className="mt-2 text-xs font-semibold text-red-600" role="alert">
              {trackingError}
            </p>
          )}
        </div>
      </form>

      {/* Live Active Shipments Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[var(--text)]">
            Active Shipments
          </h2>
          <Link
            href="/shipments/history"
            className="text-sm font-semibold text-[#3E80E5] no-underline hover:underline"
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
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
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
                            ? "bg-[#3E80E5]"
                            : "bg-[#A96512]"
                        }`}
                      />
                      {RECENT_STATUS_LABELS[shipment.status]}
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

      {/* Bottom Section - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Live Fleet Tracking (65%) */}
        <div className="lg:col-span-2">
          <div className="bg-[#1a1f2e] rounded-2xl p-6 shadow-lg border border-[#2d3548] relative overflow-hidden">
            <h2 className="text-lg font-extrabold text-white mb-4">
              Live Fleet Tracking
            </h2>
            
            {/* World Map Visualization */}
            <div className="relative h-64 bg-[#0f1419] rounded-xl overflow-hidden">
              {/* Animated Route Lines */}
              <svg className="absolute inset-0 w-full h-full">
                {/* Route 1: Munich to London */}
                <path
                  d="M 150 120 Q 200 80 280 100"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                />
                {/* Route 2: Shenzhen to San Jose */}
                <path
                  d="M 450 180 Q 550 150 650 200"
                  stroke="#10B981"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                />
                {/* Route 3: Lyon to Austin */}
                <path
                  d="M 200 140 Q 350 180 450 220"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                />
                
                {/* Location Pins */}
                <circle cx="150" cy="120" r="4" fill="#3B82F6" />
                <circle cx="280" cy="100" r="4" fill="#3B82F6" />
                <circle cx="450" cy="180" r="4" fill="#10B981" />
                <circle cx="650" cy="200" r="4" fill="#10B981" />
                <circle cx="200" cy="140" r="4" fill="#F59E0B" />
                <circle cx="450" cy="220" r="4" fill="#F59E0B" />
              </svg>

              {/* Legend */}
              <div className="absolute top-4 right-4 flex items-center gap-4 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                  <span className="text-xs font-semibold text-white">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-xs font-semibold text-white">Alert</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Shipments (35%) */}
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
                <p className="p-5 text-sm font-medium text-red-600">
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
                        {RECENT_STATUS_LABELS[shipment.status]}
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

            <div className="bg-[#F3EBF9] p-4">
              <Link
                href="/shipments/history"
                className="block w-full rounded-lg py-2.5 text-center text-sm font-bold text-[var(--accent)] no-underline transition-colors hover:bg-[#E8D9F0]"
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