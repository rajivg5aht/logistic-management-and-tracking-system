"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  UserRound,
  Weight,
} from "lucide-react";
import {
  DRIVER_STAGE_LABELS,
  getShipmentDisplayStatus,
  type DriverStage,
  type Shipment,
  type ShipmentStatus,
} from "@/lib/api/shipment.api";
import LiveMap from "@/components/tracking/LiveMap";
import { getDistrictCoords } from "@/lib/nepalGeo";

export type MapLocation = {
  latitude: number;
  longitude: number;
  speed?: number | null;
  updatedAt?: string;
} | null;

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  pending: "bg-[#FFF3DD] text-[#A96512]",
  "in-transit": "bg-[#EAF1FC] text-[var(--info)]",
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

export default function ShipmentTrackingView({
  shipment,
  liveLocation,
}: {
  shipment: Shipment;
  liveLocation: MapLocation;
}) {
  const journey = useMemo(() => {
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

  const currentStage = shipment.driverStage ?? null;
  const progress = currentStage
    ? STAGE_PROGRESS[currentStage]
    : shipment.status === "delivered"
      ? 100
      : 10;

  const hasAssignedDriver = Boolean(
    shipment.assignedDriverId || shipment.assignedDriver,
  );
  const liveStatusLabel = liveLocation
    ? "Live"
    : hasAssignedDriver
      ? "Waiting for driver GPS..."
      : "Driver not assigned yet";
  const mapWaitingLabel = hasAssignedDriver
    ? "Waiting for driver GPS..."
    : "A driver will appear here after assignment.";

  return (
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
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-2.5 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-[var(--text-soft)]">
                <MapPin size={14} className="text-[var(--teal)]" />
                Live location
                <span className="rounded-md bg-[var(--surface-soft)] px-2 py-0.5 text-[10px] font-black uppercase text-[var(--text)]">
                  #{shipment.trackingId}
                </span>
              </span>
              {liveLocation ? (
                <span className="flex items-center gap-1.5 rounded-full bg-[var(--teal)] px-2.5 py-1 font-bold text-white">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  {liveStatusLabel}
                </span>
              ) : (
                <span className="font-semibold text-[var(--text-muted)]">
                  {liveStatusLabel}
                </span>
              )}
            </div>
            <div className="relative isolate">
              <LiveMap
                location={liveLocation}
                delivery={getDistrictCoords(shipment.delivery.district ?? "")}
                height={240}
                accent="#1D7A8C"
                waitingLabel={mapWaitingLabel}
              />
              <span className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-[#18864B] shadow">
                <MapPin size={13} className="mr-1 inline" />
                {shipment.pickup.city || "Pickup"}
              </span>
              <span className="pointer-events-none absolute right-4 top-4 z-10 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-[var(--accent-strong)] shadow">
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
            <h2 className="font-extrabold text-[var(--text)]">Parcel details</h2>
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

          {shipment.proofOfDelivery && (
            <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 font-extrabold text-[var(--text)]">
                <Camera size={17} className="text-[var(--accent)]" />
                Delivery confirmation
              </h2>
              {shipment.proofOfDelivery.photoUrl && (
                <Image
                  src={shipment.proofOfDelivery.photoUrl}
                  alt="Proof of delivery"
                  width={1200}
                  height={600}
                  className="mt-4 h-44 w-full rounded-xl object-cover"
                  unoptimized
                />
              )}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Detail
                  icon={<UserRound size={16} />}
                  label="Received by"
                  value={shipment.proofOfDelivery.recipientName || "Not noted"}
                />
                <Detail
                  icon={<Clock size={16} />}
                  label="Confirmed"
                  value={
                    shipment.proofOfDelivery.confirmedAt
                      ? formatDate(shipment.proofOfDelivery.confirmedAt)
                      : "Not noted"
                  }
                />
              </div>
              {shipment.proofOfDelivery.notes && (
                <p className="mt-3 rounded-xl bg-[var(--surface-soft)] p-3 text-sm font-semibold text-[var(--text-soft)]">
                  {shipment.proofOfDelivery.notes}
                </p>
              )}
            </div>
          )}
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
                          : "bg-[var(--success)] text-white"
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
                      <span className="min-h-14 w-0.5 flex-1 bg-[var(--success)]" />
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
