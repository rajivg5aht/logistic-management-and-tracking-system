"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Phone,
  CheckCircle2,
  Circle,
  Loader2,
  Wallet,
  AlertTriangle,
  Undo2,
  Navigation,
  Square,
  ArrowRight,
} from "lucide-react";
import { driverUpdateStage } from "@/lib/api/driver.api";
import { DRIVER_STAGE_LABELS } from "@/lib/api/shipment.api";
import type {
  Shipment,
  ShipmentAddress,
  DriverStage,
} from "@/lib/api/shipment.api";
import { formatNPR } from "@/lib/pricing";
import { useDriverTracking } from "@/lib/hooks/useDriverTracking";
import LiveMap from "@/components/tracking/LiveMap";

export const STAGE_LABEL: Record<DriverStage, string> = {
  ...DRIVER_STAGE_LABELS,
  failed: "Failed",
};

export const MAIN_PATH: DriverStage[] = [
  "assigned",
  "picked-up",
  "in-transit",
  "out-for-delivery",
  "delivered",
];

export const STAGE_TRANSITIONS: Record<DriverStage, DriverStage[]> = {
  assigned: ["picked-up", "failed"],
  "picked-up": ["in-transit", "failed"],
  "in-transit": ["out-for-delivery", "failed"],
  "out-for-delivery": ["delivered", "failed"],
  delivered: [],
  failed: ["picked-up", "returned"],
  returned: [],
};

type Tone = "primary" | "success" | "danger" | "muted";
const ACTION_CONFIG: Record<DriverStage, { label: string; tone: Tone }> = {
  assigned: { label: "Mark Assigned", tone: "muted" },
  "picked-up": { label: "Confirm Pickup", tone: "primary" },
  "in-transit": { label: "Start Transit", tone: "primary" },
  "out-for-delivery": { label: "Out for Delivery", tone: "primary" },
  delivered: { label: "Mark Delivered", tone: "success" },
  failed: { label: "Report Failed", tone: "danger" },
  returned: { label: "Mark Returned", tone: "muted" },
};

const TONE_CLASS: Record<Tone, string> = {
  primary: "bg-[var(--accent)] text-white hover:opacity-90",
  success: "bg-[#1E9E4C] text-white hover:opacity-90",
  danger: "border border-[#F3C6BF] bg-[#FBE4E1] text-[#D0453A] hover:bg-[#f7d6d1]",
  muted: "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]",
};

export function fmtAddress(addr?: ShipmentAddress): string {
  if (!addr) return "—";
  return (
    [addr.streetAddress, addr.city, addr.district].filter(Boolean).join(", ") ||
    "—"
  );
}

export function shortLoc(addr?: ShipmentAddress): string {
  if (!addr) return "—";
  return [addr.city, addr.district].filter(Boolean).join(", ") || "—";
}

export function StageStepper({ stage }: { stage: DriverStage | null }) {
  const current = stage ?? "assigned";

  if (current === "failed" || current === "returned") {
    const failed = current === "failed";
    return (
      <div
        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold ${
          failed
            ? "border-[#F3C6BF] bg-[#FBE4E1] text-[#D0453A]"
            : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-soft)]"
        }`}
      >
        {failed ? <AlertTriangle size={16} /> : <Undo2 size={16} />}
        {failed ? "Delivery failed — awaiting retry or return" : "Parcel returned"}
      </div>
    );
  }

  const currentIndex = MAIN_PATH.indexOf(current);

  return (
    <div className="flex items-center">
      {MAIN_PATH.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              {done ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E9E4C] text-white">
                  <CheckCircle2 size={15} />
                </div>
              ) : active ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-[var(--surface)]">
                  <Circle size={9} className="fill-[var(--accent)] text-[var(--accent)]" />
                </div>
              ) : (
                <div className="h-7 w-7 rounded-full border-2 border-[var(--border)] bg-[var(--surface)]" />
              )}
              <span
                className={`mt-1.5 hidden text-[10px] font-bold sm:block ${
                  active ? "text-[var(--accent-strong)]" : "text-[var(--text-muted)]"
                }`}
              >
                {STAGE_LABEL[s]}
              </span>
            </div>
            {i < MAIN_PATH.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 rounded ${
                  i < currentIndex ? "bg-[#1E9E4C]" : "bg-[var(--border)]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ActiveAssignmentCard({
  shipment,
  token,
  onChanged,
  withMap = false,
  showStepper = true,
}: {
  shipment: Shipment;
  token: string;
  onChanged: (shipment: Shipment) => void | Promise<void>;
  withMap?: boolean;
  showStepper?: boolean;
}) {
  const [busy, setBusy] = useState<DriverStage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const current = shipment.driverStage ?? "assigned";
  const nextStages = STAGE_TRANSITIONS[current] ?? [];
  const isCodShipment = shipment.paymentMethod === "cod";
  const codPending = isCodShipment && shipment.paymentStatus === "pending";
  const codPaid = isCodShipment && shipment.paymentStatus === "paid";

  const tracking = useDriverTracking(token, shipment);
  const driverLocation = tracking.isTracking ? tracking.lastFix : null;
  const liveGpsLabel = tracking.isTracking
    ? driverLocation
      ? "Sharing live GPS"
      : "Finding GPS..."
    : "GPS not shared yet";

  const advance = async (stage: DriverStage) => {
    setBusy(stage);
    setError(null);
    try {
      const updated = await driverUpdateStage(token, shipment.id, stage);
      await onChanged(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update stage");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Active Delivery
          </p>
          <h3 className="mt-0.5 text-lg font-black text-[var(--text)]">
            #{shipment.trackingId}
          </h3>
        </div>
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--accent-strong)]">
          {STAGE_LABEL[current]}
        </span>
      </div>

      <div className="mt-5 space-y-1">
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#1E9E4C] bg-[#DEF3E6] text-[10px] font-black text-[#1E9E4C]">
              A
            </div>
            <div className="my-1 h-8 w-0.5 bg-[var(--border)]" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
              Pickup — {shipment.pickup.fullName || "Sender"}
            </p>
            <p className="text-sm font-semibold text-[var(--text)]">{fmtAddress(shipment.pickup)}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-[var(--accent-soft)] text-[10px] font-black text-[var(--accent-strong)]">
            B
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
              Deliver — {shipment.delivery.recipientName || "Recipient"}
            </p>
            <p className="text-sm font-semibold text-[var(--text)]">{fmtAddress(shipment.delivery)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetaTile icon={<Phone size={14} />} label="Recipient" value={shipment.delivery.phoneNumber || "—"} />
        <MetaTile icon={<Package size={14} />} label="Parcel" value={`${shipment.package.parcelType} · ${shipment.package.weight || "—"}`} />
        <MetaTile
          icon={<Wallet size={14} />}
          label={isCodShipment ? "COD" : "Payment"}
          value={
            isCodShipment
              ? codPaid
                ? "Collected"
                : formatNPR(shipment.amount)
              : "Prepaid"
          }
          highlight={codPending}
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E5F1F3] text-[#1D7A8C]">
              <Navigation size={17} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Live GPS
              </p>
              <p className="text-sm font-black text-[var(--text)]">
                {liveGpsLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-black text-[var(--text)]">
                #{shipment.trackingId}
              </p>
              {shipment.assignedVehicle && (
                <p className="text-[10px] font-semibold text-[var(--text-muted)]">
                  Vehicle {shipment.assignedVehicle}
                </p>
              )}
            </div>
            {tracking.isTracking ? (
              <button
                type="button"
                onClick={tracking.stop}
                className="flex items-center gap-1.5 rounded-lg border border-[#F3C6BF] bg-[#FBE4E1] px-3 py-2 text-xs font-bold text-[#D0453A] transition-colors hover:bg-[#f7d6d1]"
              >
                <Square size={13} />
                Stop Sharing
              </button>
            ) : (
              <button
                type="button"
                onClick={tracking.start}
                disabled={!tracking.trackable}
                className="flex items-center gap-1.5 rounded-lg bg-[#1D7A8C] px-3 py-2 text-xs font-bold text-white transition-colors hover:opacity-90 disabled:opacity-60"
              >
                <Navigation size={13} />
                Start Live GPS
              </button>
            )}
          </div>
        </div>
        <div className="p-3">
          <LiveMap
            location={driverLocation}
            height={withMap ? 360 : 200}
            accent="#1D7A8C"
            waitingLabel={
              tracking.isTracking
                ? "Finding your GPS signal..."
                : tracking.trackable
                  ? "Start live GPS to share your location."
                  : "Live GPS is closed for this shipment."
            }
          />
        </div>
        {tracking.error && (
          <p className="border-t border-[var(--border)] px-4 py-3 text-xs font-semibold text-[#D0453A]">
            {tracking.error}
          </p>
        )}
      </div>
      {showStepper && (
        <div className="mt-6">
          <StageStepper stage={current} />
        </div>
      )}

      {nextStages.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          {nextStages.map((stage) =>
            stage === "delivered" ? (
              <Link
                key={stage}
                href={`/driver/route/${shipment.id}/proof`}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${TONE_CLASS.success}`}
              >
                Complete Delivery
                <ArrowRight size={14} />
              </Link>
            ) : (
              <button
                key={stage}
                type="button"
                onClick={() => advance(stage)}
                disabled={busy !== null}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-colors disabled:opacity-60 ${TONE_CLASS[ACTION_CONFIG[stage].tone]}`}
              >
                {busy === stage && <Loader2 size={14} className="animate-spin" />}
                {ACTION_CONFIG[stage].label}
              </button>
            ),
          )}
          {nextStages.includes("delivered") && codPending && (
            <p className="w-full text-xs font-semibold text-[#B8791B]">
              Collect COD and capture proof on the delivery page.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#D0453A]">
          <AlertTriangle size={14} /> {error}
        </p>
      )}
    </div>
  );
}

function MetaTile({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
        {icon}
        {label}
      </p>
      <p className={`mt-1 truncate text-sm font-bold capitalize ${highlight ? "text-[var(--accent-strong)]" : "text-[var(--text)]"}`}>
        {value}
      </p>
    </div>
  );
}
