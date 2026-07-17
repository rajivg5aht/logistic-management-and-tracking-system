"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  Fuel,
  Loader2,
  MapPin,
  Truck,
  User,
} from "lucide-react";
import {
  adminUpdateFuelExpense,
  adminUpdateIncident,
  type AdminFuelExpense,
  type AdminFuelExpenseUpdatePayload,
  type AdminIncident,
  type AdminIncidentUpdatePayload,
} from "@/lib/api/fleetReports.api";
import { formatNPR } from "@/lib/pricing";

export const INCIDENT_STATUS_META: Record<string, { label: string; cls: string }> = {
  pending_review: { label: "Pending review", cls: "bg-[#FBF1DC] text-[var(--accent-hover)]" },
  resolved: { label: "Resolved", cls: "bg-[var(--success-soft)] text-[var(--success)]" },
  maintenance_required: { label: "Maintenance required", cls: "bg-[#FCE8D8] text-[#C06A2D]" },
};

export const FUEL_STATUS_META: Record<string, { label: string; cls: string }> = {
  submitted: { label: "Submitted", cls: "bg-[var(--info-soft)] text-[var(--info)]" },
  under_review: { label: "Under review", cls: "bg-[#FBF1DC] text-[var(--accent-hover)]" },
  approved: { label: "Approved", cls: "bg-[var(--success-soft)] text-[var(--success)]" },
  rejected: { label: "Rejected", cls: "bg-[var(--danger-soft)] text-[var(--danger)]" },
  reimbursed: { label: "Reimbursed", cls: "bg-[#E7F5F2] text-[var(--teal)]" },
};

const SEVERITY_META: Record<string, string> = {
  low: "bg-[var(--success-soft)] text-[var(--success)]",
  medium: "bg-[var(--info-soft)] text-[var(--info)]",
  high: "bg-[#FBF1DC] text-[var(--accent-hover)]",
  critical: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

function fmtDate(value: string | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function askFor(label: string, current = "", required = true): string | null {
  const value = window.prompt(label, current);
  if (value === null) return null;
  const next = value.trim();
  if (required && !next) return null;
  return next;
}

function StatusPill({ meta }: { meta: { label: string; cls: string } }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

function ActButton({
  label,
  primary,
  pending,
  onClick,
}: {
  label: string;
  primary: boolean;
  pending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-60 cursor-pointer ${
        primary
          ? "bg-[var(--teal)] text-white hover:opacity-90"
          : "border border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
      }`}
    >
      {pending && <Loader2 size={12} className="animate-spin" />}
      {label}
    </button>
  );
}

function Meta({
  showVehicle,
  registration,
  driverName,
  date,
}: {
  showVehicle: boolean;
  registration: string | null;
  driverName: string | null;
  date: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-[var(--text-muted)]">
      {showVehicle && (
        <span className="inline-flex items-center gap-1.5 font-bold text-[var(--text-soft)]">
          <Truck size={13} /> {registration ?? "Unknown vehicle"}
        </span>
      )}
      <span className="inline-flex items-center gap-1.5">
        <User size={13} /> {driverName ?? "Unknown driver"}
      </span>
      <span>{date}</span>
    </div>
  );
}

function NoteBlock({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-xs font-medium text-[var(--text-soft)]">{value}</p>
    </div>
  );
}

type FuelAction = {
  label: string;
  payload: () => AdminFuelExpenseUpdatePayload | null;
};

function fuelActions(expense: AdminFuelExpense): FuelAction[] {
  const reject = (): AdminFuelExpenseUpdatePayload | null => {
    const rejectionReason = askFor("Rejection reason", expense.rejectionReason);
    return rejectionReason ? { status: "rejected", rejectionReason } : null;
  };
  const reimburse = (): AdminFuelExpenseUpdatePayload | null => {
    const paymentReference = askFor("Payment reference", expense.paymentReference);
    return paymentReference ? { status: "reimbursed", paymentReference } : null;
  };

  switch (expense.status) {
    case "submitted":
      return [
        { label: "Start review", payload: () => ({ status: "under_review" }) },
        { label: "Approve", payload: () => ({ status: "approved" }) },
        { label: "Reject", payload: reject },
      ];
    case "under_review":
      return [
        { label: "Approve", payload: () => ({ status: "approved" }) },
        { label: "Reject", payload: reject },
      ];
    case "approved":
      return [
        { label: "Mark reimbursed", payload: reimburse },
        { label: "Reject", payload: reject },
      ];
    case "rejected":
      return [
        { label: "Review again", payload: () => ({ status: "under_review" }) },
        { label: "Approve", payload: () => ({ status: "approved" }) },
      ];
    default:
      return [];
  }
}

export function IncidentRow({
  incident,
  token,
  onChanged,
  showVehicle = true,
}: {
  incident: AdminIncident;
  token: string;
  onChanged: () => void;
  showVehicle?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState(incident.adminNote || "");

  const act = async (payload: AdminIncidentUpdatePayload | null) => {
    if (!payload) return;
    setPending(true);
    setErr(null);
    try {
      await adminUpdateIncident(token, incident.id, payload);
      await onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setPending(false);
    }
  };

  const statusMeta =
    INCIDENT_STATUS_META[incident.status] ?? {
      label: incident.status,
      cls: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
    };

  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <AlertTriangle size={15} className="text-[var(--danger)]" />
        <span className="text-sm font-bold capitalize text-[var(--text)]">
          {incident.category}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            SEVERITY_META[incident.severity] ?? "bg-[var(--surface)] text-[var(--text-muted)]"
          }`}
        >
          {incident.severity}
        </span>
        <StatusPill meta={statusMeta} />
      </div>

      <p className="mt-2 text-sm text-[var(--text-soft)]">{incident.description}</p>
      {incident.location && (
        <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
          <MapPin size={12} /> {incident.location}
        </p>
      )}

      <div className="mt-3">
        <NoteBlock label="Admin note" value={incident.adminNote} />
      </div>

      <div className="mt-3 border-t border-[var(--border)] pt-3">
        <Meta
          showVehicle={showVehicle}
          registration={incident.vehicleRegistration}
          driverName={incident.driverName}
          date={fmtDate(incident.createdAt)}
        />
        {incident.reviewedAt && (
          <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
            Reviewed {fmtDate(incident.reviewedAt)}
          </p>
        )}
        {incident.status === "pending_review" && (
          <div className="mt-3 space-y-2">
            <textarea
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              rows={2}
              maxLength={800}
              placeholder="Optional review note visible to the driver"
              className="min-h-16 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--teal)]"
            />
            <div className="flex flex-wrap gap-2">
              <ActButton
                label="Normal / No Maintenance Required"
                primary={true}
                pending={pending}
                onClick={() => act({ decision: "normal", adminNote })}
              />
              <ActButton
                label="Maintenance Required"
                primary={false}
                pending={pending}
                onClick={() => {
                  const confirmed = window.confirm(
                    "Mark this fleet as Maintenance Required and unassign its current driver?",
                  );
                  if (confirmed) {
                    void act({ decision: "maintenance_required", adminNote });
                  }
                }}
              />
            </div>
          </div>
        )}
        {err && <p className="mt-2 text-xs font-semibold text-[var(--danger)]">{err}</p>}
      </div>
    </li>
  );
}

export function FuelExpenseRow({
  expense,
  token,
  onChanged,
  showVehicle = true,
}: {
  expense: AdminFuelExpense;
  token: string;
  onChanged: () => void;
  showVehicle?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState(expense.adminNote || "");

  const act = async (payload: AdminFuelExpenseUpdatePayload | null) => {
    if (!payload) return;
    setPending(true);
    setErr(null);
    try {
      await adminUpdateFuelExpense(token, expense.id, payload);
      await onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setPending(false);
    }
  };

  const statusMeta =
    FUEL_STATUS_META[expense.status] ?? {
      label: expense.status,
      cls: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
    };
  const actions = fuelActions(expense);

  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Fuel size={15} className="text-[var(--info)]" />
        <span className="text-sm font-bold text-[var(--text)]">
          {formatNPR(expense.amount)}
        </span>
        <span className="text-xs capitalize text-[var(--text-muted)]">
          {expense.fuelType}
          {expense.liters != null ? ` - ${expense.liters} L` : ""} - {" "}
          {expense.odometerKm.toLocaleString()} km
          {expense.stationName ? ` - ${expense.stationName}` : ""}
        </span>
        <span className="ml-auto">
          <StatusPill meta={statusMeta} />
        </span>
      </div>
      {expense.notes && (
        <p className="mt-2 text-sm text-[var(--text-soft)]">{expense.notes}</p>
      )}
      {expense.receiptUrl && (
        <a
          href={expense.receiptUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--teal)] hover:underline"
        >
          <ExternalLink size={12} /> View receipt
        </a>
      )}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <NoteBlock label="Admin note" value={expense.adminNote} />
        <NoteBlock label="Rejection reason" value={expense.rejectionReason} />
        <NoteBlock label="Payment reference" value={expense.paymentReference} />
        <NoteBlock label="Reimbursed" value={expense.reimbursedAt ? fmtDate(expense.reimbursedAt) : ""} />
      </div>

      <div className="mt-3 border-t border-[var(--border)] pt-3">
        <Meta
          showVehicle={showVehicle}
          registration={expense.vehicleRegistration}
          driverName={expense.driverName}
          date={fmtDate(expense.createdAt)}
        />
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <textarea
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            rows={2}
            placeholder="Admin note visible to driver"
            className="min-h-16 flex-1 resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--text)] outline-none focus:border-[var(--teal)]"
          />
          <ActButton
            label="Save note"
            primary={false}
            pending={pending}
            onClick={() => act({ adminNote })}
          />
        </div>
        {actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <ActButton
                key={action.label}
                label={action.label}
                primary={index === 0}
                pending={pending}
                onClick={() => act(action.payload())}
              />
            ))}
          </div>
        )}
        {err && <p className="mt-2 text-xs font-semibold text-[var(--danger)]">{err}</p>}
      </div>
    </li>
  );
}
