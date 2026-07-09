"use client";

import { useState } from "react";
import {
  MapPin,
  Package,
  Phone,
  User as UserIcon,
  CheckCircle2,
  Circle,
  Loader2,
  Wallet,
  Banknote,
  AlertTriangle,
  Camera,
  Image as ImageIcon,
  Trash2,
  Undo2,
  Navigation,
  Square,
} from "lucide-react";
import {
  driverUpdateStage,
  driverCollectCod,
  driverSaveProof,
  driverDeleteProof,
} from "@/lib/api/driver.api";
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

// The happy-path milestones shown in the stepper (side states handled apart).
export const MAIN_PATH: DriverStage[] = [
  "assigned",
  "picked-up",
  "in-transit",
  "out-for-delivery",
  "delivered",
];

// Mirrors the backend STAGE_TRANSITIONS so the UI only offers valid moves.
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

/* ── Milestone stepper ─────────────────────────────────────────────────────── */
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

/* ── Reusable active-assignment card with inline stage actions ─────────────── */
export function ActiveAssignmentCard({
  shipment,
  token,
  onChanged,
  withMap = false,
}: {
  shipment: Shipment;
  token: string;
  onChanged: (shipment: Shipment) => void | Promise<void>;
  withMap?: boolean;
}) {
  const [busy, setBusy] = useState<DriverStage | null>(null);
  const [codBusy, setCodBusy] = useState(false);
  const [proofBusy, setProofBusy] = useState(false);
  const [proofRemoving, setProofRemoving] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(
    shipment.proofOfDelivery?.photoUrl ?? null,
  );
  const [proofNotes, setProofNotes] = useState(
    shipment.proofOfDelivery?.notes ?? "",
  );
  const [proofRecipient, setProofRecipient] = useState(
    shipment.proofOfDelivery?.recipientName || shipment.delivery.recipientName || "",
  );
  const [error, setError] = useState<string | null>(null);

  const current = shipment.driverStage ?? "assigned";
  const nextStages = STAGE_TRANSITIONS[current] ?? [];
  const isCodShipment = shipment.paymentMethod === "cod";
  const codPending = isCodShipment && shipment.paymentStatus === "pending";
  const codPaid = isCodShipment && shipment.paymentStatus === "paid";
  const proofReady = Boolean(
    shipment.proofOfDelivery?.confirmedAt && shipment.proofOfDelivery.photoUrl,
  );
  const canSaveProof = Boolean(proofFile || shipment.proofOfDelivery?.photoUrl);

  // Live GPS broadcast for this delivery (driver → customer/admin).
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

  const collectCod = async (collected: boolean) => {
    setCodBusy(true);
    setError(null);
    try {
      const updated = await driverCollectCod(token, shipment.id, collected);
      await onChanged(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update COD payment");
    } finally {
      setCodBusy(false);
    }
  };

  const saveProof = async () => {
    setProofBusy(true);
    setError(null);
    try {
      const updated = await driverSaveProof(token, shipment.id, {
        photo: proofFile ?? undefined,
        notes: proofNotes,
        recipientName: proofRecipient,
      });
      setProofFile(null);
      setProofPreview(updated.proofOfDelivery?.photoUrl ?? null);
      setProofNotes(updated.proofOfDelivery?.notes ?? "");
      setProofRecipient(
        updated.proofOfDelivery?.recipientName ||
          updated.delivery.recipientName ||
          "",
      );
      await onChanged(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save proof");
    } finally {
      setProofBusy(false);
    }
  };

  const removeProof = async () => {
    setProofRemoving(true);
    setError(null);
    try {
      const updated = await driverDeleteProof(token, shipment.id);
      setProofFile(null);
      setProofPreview(null);
      setProofNotes("");
      setProofRecipient(updated.delivery.recipientName || "");
      await onChanged(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove proof");
    } finally {
      setProofRemoving(false);
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

      {withMap && <RoutePlaceholder shipment={shipment} />}

      {/* Route: pickup → delivery */}
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

      {/* Meta grid */}
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


      {/* Live GPS sharing */}
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
        <div className="p-3">
          <LiveMap
            location={driverLocation}
            height={180}
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
      {/* COD collection */}
      {isCodShipment && (
        <div
          className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
            codPaid
              ? "border-[#BFE6CD] bg-[#DEF3E6]"
              : "border-[#F3D9A0] bg-[#FDF3E0]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                codPaid ? "bg-[#1E9E4C] text-white" : "bg-[#E9B44C]/25 text-[#B8791B]"
              }`}
            >
              {codPaid ? <CheckCircle2 size={18} /> : <Banknote size={18} />}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Cash on delivery
              </p>
              <p className="text-sm font-black text-[var(--text)]">
                {formatNPR(shipment.amount)}
                <span
                  className={`ml-2 text-xs font-bold ${
                    codPaid ? "text-[#1E9E4C]" : "text-[#B8791B]"
                  }`}
                >
                  {codPaid ? "· Collected" : "· To collect"}
                </span>
              </p>
            </div>
          </div>
          {codPending ? (
            <button
              type="button"
              onClick={() => collectCod(true)}
              disabled={codBusy}
              className="flex items-center gap-1.5 rounded-lg bg-[#1E9E4C] px-4 py-2 text-sm font-bold text-white transition-colors hover:opacity-90 disabled:opacity-60"
            >
              {codBusy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Wallet size={14} />
              )}
              Mark COD Collected
            </button>
          ) : (
            <button
              type="button"
              onClick={() => collectCod(false)}
              disabled={codBusy}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] disabled:opacity-60"
            >
              {codBusy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Undo2 size={14} />
              )}
              Undo
            </button>
          )}
        </div>
      )}

      {/* Proof of delivery */}
      <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <Camera size={17} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                Proof of delivery
              </p>
              <p className="text-sm font-black text-[var(--text)]">
                {proofReady ? "Proof recorded" : "Photo required before delivery"}
              </p>
            </div>
          </div>
          {shipment.proofOfDelivery && shipment.status !== "delivered" && (
            <button
              type="button"
              onClick={removeProof}
              disabled={proofRemoving || proofBusy}
              className="flex items-center gap-1.5 rounded-lg border border-[#F3C6BF] bg-[#FBE4E1] px-3 py-2 text-xs font-bold text-[#D0453A] transition-colors hover:bg-[#f7d6d1] disabled:opacity-60"
            >
              {proofRemoving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
              Remove
            </button>
          )}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-[8rem_1fr]">
          <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            {proofPreview ? (
              <img
                src={proofPreview}
                alt="Proof of delivery"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon size={24} className="text-[var(--text-muted)]" />
            )}
          </div>
          <div className="space-y-2">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setProofFile(file);
                setProofPreview(
                  file
                    ? URL.createObjectURL(file)
                    : shipment.proofOfDelivery?.photoUrl ?? null,
                );
              }}
              className="block w-full text-xs text-[var(--text-soft)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--surface-muted)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--text)] hover:file:bg-[var(--border)]"
            />
            <input
              value={proofRecipient}
              onChange={(event) => setProofRecipient(event.target.value)}
              placeholder="Recipient name"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
            <textarea
              value={proofNotes}
              onChange={(event) => setProofNotes(event.target.value)}
              placeholder="Delivery note"
              rows={2}
              className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[var(--text-muted)]">
            JPG, PNG or GIF up to 5MB. A saved photo unlocks final delivery.
          </p>
          <button
            type="button"
            onClick={saveProof}
            disabled={proofBusy || proofRemoving || !canSaveProof}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white transition-colors hover:opacity-90 disabled:opacity-60"
          >
            {proofBusy ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Camera size={14} />
            )}
            Save Proof
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="mt-6">
        <StageStepper stage={current} />
      </div>

      {/* Actions */}
      {nextStages.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
          {nextStages.map((stage) => {
            const lockedForCod = stage === "delivered" && codPending;
            const lockedForProof = stage === "delivered" && !proofReady;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => advance(stage)}
                disabled={
                  busy !== null || codBusy || proofBusy || lockedForCod || lockedForProof
                }
                title={
                  lockedForCod
                    ? "Collect COD to enable delivery"
                    : lockedForProof
                      ? "Upload proof photo to enable delivery"
                      : undefined
                }
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-colors disabled:opacity-60 ${TONE_CLASS[ACTION_CONFIG[stage].tone]}`}
              >
                {busy === stage && <Loader2 size={14} className="animate-spin" />}
                {ACTION_CONFIG[stage].label}
              </button>
            );
          })}
          {nextStages.includes("delivered") && codPending && (
            <p className="w-full text-xs font-semibold text-[#B8791B]">
              Collect COD to enable delivery.
            </p>
          )}
          {nextStages.includes("delivered") && !proofReady && (
            <p className="w-full text-xs font-semibold text-[#B8791B]">
              Upload proof photo to enable delivery.
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

/* ── Styled (non-interactive) route placeholder ────────────────────────────── */
export function RoutePlaceholder({ shipment }: { shipment: Shipment }) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-[var(--border)]">
      <div
        className="relative h-40 w-full"
        style={{
          background:
            "linear-gradient(135deg, #EAF1F7 0%, #F3F1E9 100%)",
        }}
      >
        {/* Simple route illustration */}
        <svg viewBox="0 0 400 160" className="h-full w-full" preserveAspectRatio="none">
          <path
            d="M40 120 C 140 40, 260 40, 360 60"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeDasharray="7 7"
            strokeLinecap="round"
          />
          <circle cx="40" cy="120" r="8" fill="#1E9E4C" />
          <circle cx="360" cy="60" r="8" fill="var(--accent)" />
        </svg>
        <span className="absolute bottom-2 left-3 rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-bold text-[#1E9E4C]">
          {shortLoc(shipment.pickup)}
        </span>
        <span className="absolute right-3 top-3 rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-bold text-[var(--accent-strong)]">
          {shortLoc(shipment.delivery)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-[var(--text-soft)]">
          <MapPin size={13} className="text-[var(--accent)]" />
          Route overview
        </span>
        {shipment.assignedVehicle && (
          <span className="flex items-center gap-1.5 font-semibold text-[var(--text-muted)]">
            <UserIcon size={13} /> Vehicle {shipment.assignedVehicle}
          </span>
        )}
      </div>
    </div>
  );
}
