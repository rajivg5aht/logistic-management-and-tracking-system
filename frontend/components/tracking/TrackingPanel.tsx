"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  Truck,
  UserRound,
  Weight,
} from "lucide-react";
import {
  DRIVER_STAGE_LABELS,
  getMyShipments,
  getShipmentDisplayStatus,
  type DriverStage,
  type Shipment,
  type ShipmentStatus,
} from "@/lib/api/shipment.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  pending: "bg-[#FFF3DD] text-[#A96512]",
  "in-transit": "bg-[#EAF1FC] text-[#2E6FD6]",
  delivered: "bg-[#E2F5EA] text-[#18864B]",
  cancelled: "bg-[#FDE8E5] text-[#C43D32]",
};

const STAGE_PROGRESS: Record<DriverStage, number> = {
  assigned: 20,
  "picked-up": 40,
  "in-transit": 60,
  "out-for-delivery": 82,
  delivered: 100,
  failed: 60,
  returned: 100,
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-NP", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function addressLine(address: Shipment["pickup"]): string {
  return (
    [address.streetAddress, address.city, address.district]
      .filter(Boolean)
      .join(", ") || "Address unavailable"
  );
}

export default function TrackingPanel({
  token,
  initialTrackingId = "",
}: {
  token: string;
  initialTrackingId?: string;
}) {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState(initialTrackingId);
  const [activeTrackingId, setActiveTrackingId] = useState(initialTrackingId);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(Boolean(initialTrackingId));
  const [error, setError] = useState<string | null>(null);

  const loadShipment = useCallback(
    async (silent = false) => {
      const normalized = activeTrackingId.trim().toUpperCase();
      if (!normalized) {
        setShipment(null);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        if (!silent) setLoading(true);
        const shipments = await getMyShipments(token);
        const match =
          shipments.find(
            (item) => item.trackingId.trim().toUpperCase() === normalized,
          ) ?? null;
        setShipment(match);
        setError(
          match
            ? null
            : "No shipment with this tracking ID was found in your account.",
        );
      } catch (loadError) {
        if (!silent) {
          setShipment(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load tracking details.",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [activeTrackingId, token],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadShipment();
  }, [loadShipment]);

  useAutoRefresh(() => loadShipment(true), {
    intervalMs: 10_000,
    enabled: Boolean(activeTrackingId),
  });

  const journey = useMemo(() => {
    if (!shipment) return [];
    return [
      {
        stage: null as DriverStage | null,
        at: shipment.createdAt,
        note: "Shipment booked",
      },
      ...shipment.timeline.map((entry) => ({
        stage: entry.stage,
        at: entry.at,
        note: entry.note || "",
      })),
    ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  }, [shipment]);

  const handleTrack = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = trackingId.trim().toUpperCase();
    if (!normalized) {
      setError("Enter a tracking ID to continue.");
      return;
    }
    setActiveTrackingId(normalized);
    router.replace(`/tracking?trackingId=${encodeURIComponent(normalized)}`);
    if (normalized === activeTrackingId.trim().toUpperCase()) {
      void loadShipment();
    }
  };

  const currentStage = shipment?.driverStage ?? null;
  const progress = currentStage
    ? STAGE_PROGRESS[currentStage]
    : shipment?.status === "delivered"
      ? 100
      : 10;

  return (
    <div className="space-y-6">
      <form onSubmit={handleTrack} className="relative mx-auto w-full max-w-xl">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
        />
        <input
          type="text"
          value={trackingId}
          onChange={(event) => setTrackingId(event.target.value)}
          className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-11 pr-28 text-sm font-semibold uppercase text-[var(--text)] shadow-sm outline-none focus:border-[var(--accent)]"
          placeholder="Enter tracking ID"
          autoComplete="off"
          suppressHydrationWarning
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 flex h-9 -translate-y-1/2 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-bold text-[var(--text-on-accent)]"
          suppressHydrationWarning
        >
          Track Now
        </button>
      </form>

      {loading ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-[var(--border)] bg-white">
          <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
        </div>
      ) : error ? (
        <div className="mx-auto flex max-w-2xl items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          {error}
        </div>
      ) : !shipment ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-[var(--border)] bg-white p-10 text-center">
          <Package size={32} className="mx-auto text-[var(--text-muted)]" />
          <h1 className="mt-3 text-lg font-extrabold text-[var(--text)]">
            Track your shipment
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Enter one of your tracking IDs to see its latest driver update.
          </p>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Tracking ID
                </p>
                <h1 className="mt-1 text-2xl font-black text-[var(--text)]">
                  {shipment.trackingId}
                </h1>
                <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
                  Last updated {formatDate(shipment.updatedAt)}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold uppercase ${STATUS_STYLES[shipment.status]}`}
                >
                  {getShipmentDisplayStatus(shipment)}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs font-semibold text-[var(--text-muted)]">
                <span>{shipment.pickup.city || "Pickup"}</span>
                <span>{shipment.delivery.city || "Destination"}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <section className="space-y-4 lg:col-span-3">
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
                <div className="relative h-60 bg-gradient-to-br from-[#EAF1F7] to-[#F3F1E9]">
                  <svg
                    viewBox="0 0 600 240"
                    className="h-full w-full"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M65 185 C 190 65, 400 75, 535 50"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="5"
                      strokeDasharray="10 10"
                    />
                    <circle cx="65" cy="185" r="11" fill="#1E9E4C" />
                    <circle cx="535" cy="50" r="11" fill="var(--accent)" />
                    <circle
                      cx={65 + (470 * progress) / 100}
                      cy={185 - (135 * progress) / 100}
                      r="13"
                      fill="#1D7A8C"
                    />
                  </svg>
                  <span className="absolute bottom-4 left-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-[#18864B]">
                    <MapPin size={13} className="mr-1 inline" />
                    {shipment.pickup.city || "Pickup"}
                  </span>
                  <span className="absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-[var(--accent-strong)]">
                    <MapPin size={13} className="mr-1 inline" />
                    {shipment.delivery.city || "Destination"}
                  </span>
                </div>

                <div className="grid gap-4 border-t border-[var(--border)] p-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Pickup
                    </p>
                    <p className="mt-1 text-sm font-bold text-[var(--text)]">
                      {addressLine(shipment.pickup)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Delivery
                    </p>
                    <p className="mt-1 text-sm font-bold text-[var(--text)]">
                      {addressLine(shipment.delivery)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                <h2 className="font-extrabold text-[var(--text)]">
                  Parcel details
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Detail
                    icon={<Package size={16} />}
                    label="Parcel"
                    value={shipment.package.parcelType}
                  />
                  <Detail
                    icon={<Weight size={16} />}
                    label="Weight"
                    value={shipment.package.weight || "Not specified"}
                  />
                  <Detail
                    icon={<ShieldCheck size={16} />}
                    label="Service"
                    value={shipment.service}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-[var(--text)]">
                    Shipment journey
                  </h2>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Updates refresh automatically.
                  </p>
                </div>
                {shipment.assignedDriver && (
                  <span className="flex items-center gap-1.5 rounded-lg bg-[var(--surface-soft)] px-2.5 py-1.5 text-xs font-bold text-[var(--text-soft)]">
                    <UserRound size={14} />
                    {shipment.assignedDriver}
                  </span>
                )}
              </div>

              <ol className="mt-6">
                {journey.map((entry, index) => {
                  const isLatest = index === journey.length - 1;
                  const title = entry.stage
                    ? DRIVER_STAGE_LABELS[entry.stage]
                    : "Shipment Booked";
                  return (
                    <li key={`${entry.at}-${index}`} className="relative flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${
                            isLatest
                              ? "bg-[var(--accent)] text-white ring-4 ring-[var(--accent-soft)]"
                              : "bg-[#1E9E4C] text-white"
                          }`}
                        >
                          {isLatest &&
                          shipment.status !== "delivered" &&
                          shipment.status !== "cancelled" ? (
                            <Truck size={14} />
                          ) : (
                            <CheckCircle2 size={15} />
                          )}
                        </span>
                        {index < journey.length - 1 && (
                          <span className="min-h-14 w-0.5 flex-1 bg-[#1E9E4C]" />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="text-sm font-extrabold text-[var(--text)]">
                          {title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)]">
                          <Clock size={12} />
                          {formatDate(entry.at)}
                        </p>
                        {entry.note && (
                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[var(--surface-soft)] p-3">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-extrabold capitalize text-[var(--text)]">
        {value}
      </p>
    </div>
  );
}
