"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Truck,
  UserRound,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  adminUpdateWorkOrder,
  type MaintenanceWorkOrder,
} from "@/lib/api/fleetReports.api";
import { formatNPR } from "@/lib/pricing";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  assigned: { label: "Assigned", cls: "bg-[#E8F0FB] text-[#2E6FD6]" },
  in_repair: { label: "In repair", cls: "bg-[#FBF1DC] text-[#C99A3D]" },
  awaiting_verification: {
    label: "Awaiting verification",
    cls: "bg-[#FCE8D8] text-[#C06A2D]",
  },
  closed: { label: "Closed", cls: "bg-[#DEF3E6] text-[#1E9E4C]" },
  cancelled: { label: "Cancelled", cls: "bg-[#FBE4E1] text-[#D0453A]" },
};

function toDateInput(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminWorkOrderRow({
  token,
  workOrder,
  onChanged,
}: {
  token: string;
  workOrder: MaintenanceWorkOrder;
  onChanged: () => void;
}) {
  const [vendorName, setVendorName] = useState(workOrder.vendorName);
  const [priority, setPriority] = useState(workOrder.priority);
  const [expectedCompletionAt, setExpectedCompletionAt] = useState(
    toDateInput(workOrder.expectedCompletionAt),
  );
  const [vehicleOutOfService, setVehicleOutOfService] = useState(
    workOrder.vehicleOutOfService,
  );
  const [adminNote, setAdminNote] = useState(workOrder.adminNote);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (
    action:
      | { status: "closed"; verificationNote: string }
      | { status: "cancelled"; cancellationReason: string }
      | undefined = undefined,
  ) => {
    setPending(true);
    setError(null);
    try {
      await adminUpdateWorkOrder(token, workOrder.id, {
        vendorName,
        priority:
          priority === "low" ||
          priority === "medium" ||
          priority === "high" ||
          priority === "critical"
            ? priority
            : "medium",
        expectedCompletionAt,
        vehicleOutOfService,
        adminNote,
        ...action,
      });
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update work order");
    } finally {
      setPending(false);
    }
  };

  const verify = () => {
    const verificationNote = window.prompt(
      "Verification note",
      "Vehicle inspected and ready for service.",
    );
    if (!verificationNote?.trim()) return;
    void update({ status: "closed", verificationNote: verificationNote.trim() });
  };

  const cancel = () => {
    const cancellationReason = window.prompt(
      "Cancellation reason",
      "Reassignment required.",
    );
    if (!cancellationReason?.trim()) return;
    void update({
      status: "cancelled",
      cancellationReason: cancellationReason.trim(),
    });
  };

  const meta = STATUS_META[workOrder.status] ?? {
    label: workOrder.status,
    cls: "bg-[var(--surface-soft)] text-[var(--text-muted)]",
  };
  const active =
    workOrder.status === "assigned" ||
    workOrder.status === "in_repair" ||
    workOrder.status === "awaiting_verification";

  return (
    <li className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FCE8D8] text-[#C06A2D]">
          <Wrench size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold capitalize text-[var(--text)]">
              {workOrder.incidentCategory} issue
            </p>
            <span className={["rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase", meta.cls].join(" ")}>
              {meta.label}
            </span>
            <span className="rounded-full bg-[var(--surface)] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[var(--text-muted)]">
              {workOrder.priority}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            {workOrder.incidentDescription}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Truck size={13} />
              {workOrder.vehicleRegistration ?? "Vehicle"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <UserRound size={13} />
              {workOrder.driverName ?? "Driver"}
            </span>
            {workOrder.incidentLocation && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} />
                {workOrder.incidentLocation}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} />
              Target {formatDate(workOrder.expectedCompletionAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <Info label="Diagnosis" value={workOrder.diagnosis} />
        <Info label="Repair notes" value={workOrder.repairNotes} />
        <Info label="Parts" value={workOrder.partsUsed} />
        <Info label="Repair cost" value={formatNPR(workOrder.totalCost)} />
      </div>
      {workOrder.invoiceUrl && (
        <a
          href={workOrder.invoiceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--teal)] hover:underline"
        >
          <FileText size={13} />
          View repair document
        </a>
      )}

      {active && (
        <div className="mt-4 grid gap-3 border-t border-[var(--border)] pt-4 md:grid-cols-2">
          <label>
            <span className="mb-1 block text-[10px] font-bold uppercase text-[var(--text-muted)]">
              External workshop
            </span>
            <input
              value={vendorName}
              onChange={(event) => setVendorName(event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--teal)]"
            />
          </label>
          <label>
            <span className="mb-1 block text-[10px] font-bold uppercase text-[var(--text-muted)]">
              Priority
            </span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--teal)]"
            >
              {["low", "medium", "high", "critical"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-[10px] font-bold uppercase text-[var(--text-muted)]">
              Target date
            </span>
            <input
              type="date"
              value={expectedCompletionAt}
              onChange={(event) => setExpectedCompletionAt(event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--teal)]"
            />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block text-[10px] font-bold uppercase text-[var(--text-muted)]">
              Admin note
            </span>
            <textarea
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              rows={2}
              className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--teal)]"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-soft)]">
            <input
              type="checkbox"
              checked={vehicleOutOfService}
              onChange={(event) => setVehicleOutOfService(event.target.checked)}
            />
            Vehicle is unavailable while work is open
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => void update()}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-bold text-[var(--text-soft)] disabled:opacity-60"
            >
              {pending ? <Loader2 size={13} className="animate-spin" /> : "Save changes"}
            </button>
            {workOrder.status === "awaiting_verification" && (
              <button
                type="button"
                disabled={pending}
                onClick={verify}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--teal)] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
              >
                <CheckCircle2 size={13} />
                Verify and close
              </button>
            )}
            {workOrder.status !== "awaiting_verification" && (
              <button
                type="button"
                disabled={pending}
                onClick={cancel}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#F3C6BF] px-3 py-2 text-xs font-bold text-[#D0453A] disabled:opacity-60"
              >
                <XCircle size={13} />
                Cancel work order
              </button>
            )}
          </div>
        </div>
      )}

      {workOrder.events.length > 0 && (
        <p className="mt-4 text-xs text-[var(--text-muted)]">
          Latest update: {workOrder.events[workOrder.events.length - 1].note || workOrder.events[workOrder.events.length - 1].toStatus}
        </p>
      )}
      {error && <p className="mt-2 text-xs font-semibold text-[#D0453A]">{error}</p>}
    </li>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 font-medium text-[var(--text-soft)]">{value || "-"}</p>
    </div>
  );
}