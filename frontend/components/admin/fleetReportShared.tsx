"use client";

import { useState } from "react";
import { AlertTriangle, Fuel, Loader2, MapPin, Truck, User } from "lucide-react";
import {
  adminUpdateIncidentStatus,
  adminUpdateFuelExpenseStatus,
  type AdminIncident,
  type AdminFuelExpense,
  type IncidentStatus,
  type FuelExpenseStatus,
} from "@/lib/api/fleetReports.api";
import { formatNPR } from "@/lib/pricing";

export const INCIDENT_STATUS_META: Record<string, { label: string; cls: string }> = {
  open: { label: "Open", cls: "bg-[#FBE4E1] text-[#D0453A]" },
  reviewing: { label: "Reviewing", cls: "bg-[#FBF1DC] text-[#C99A3D]" },
  resolved: { label: "Resolved", cls: "bg-[#DEF3E6] text-[#1E9E4C]" },
};

export const FUEL_STATUS_META: Record<string, { label: string; cls: string }> = {
  submitted: { label: "Submitted", cls: "bg-[#E8F0FB] text-[#2E6FD6]" },
  approved: { label: "Approved", cls: "bg-[#DEF3E6] text-[#1E9E4C]" },
  rejected: { label: "Rejected", cls: "bg-[#FBE4E1] text-[#D0453A]" },
};

const SEVERITY_META: Record<string, string> = {
  low: "bg-[#DEF3E6] text-[#1E9E4C]",
  medium: "bg-[#E8F0FB] text-[#2E6FD6]",
  high: "bg-[#FBF1DC] text-[#C99A3D]",
  critical: "bg-[#FBE4E1] text-[#D0453A]",
};

// Available next actions, keyed by current status. Keeps the workflow explicit
// without hiding a correction path (e.g. reopen / re-approve).
const INCIDENT_ACTIONS: Record<string, { label: string; to: IncidentStatus }[]> = {
  open: [
    { label: "Start review", to: "reviewing" },
    { label: "Resolve", to: "resolved" },
  ],
  reviewing: [{ label: "Resolve", to: "resolved" }],
  resolved: [{ label: "Reopen", to: "open" }],
};

const FUEL_ACTIONS: Record<string, { label: string; to: FuelExpenseStatus }[]> = {
  submitted: [
    { label: "Approve", to: "approved" },
    { label: "Reject", to: "rejected" },
  ],
  approved: [{ label: "Reject", to: "rejected" }],
  rejected: [{ label: "Approve", to: "approved" }],
};

function fmtDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

// Meta line shown in the fleet-wide inbox where a report isn't tied to the page's
// vehicle. Hidden on the per-vehicle view via `showVehicle={false}`.
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

  const act = async (to: IncidentStatus) => {
    setPending(true);
    setErr(null);
    try {
      await adminUpdateIncidentStatus(token, incident.id, to);
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to update");
      setPending(false);
    }
  };

  const statusMeta =
    INCIDENT_STATUS_META[incident.status] ?? {
      label: incident.status,
      cls: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
    };
  const actions = INCIDENT_ACTIONS[incident.status] ?? [];

  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <AlertTriangle size={15} className="text-[#D0453A]" />
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

      <div className="mt-3 border-t border-[var(--border)] pt-3">
        <Meta
          showVehicle={showVehicle}
          registration={incident.vehicleRegistration}
          driverName={incident.driverName}
          date={fmtDate(incident.createdAt)}
        />
        {actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {actions.map((a, i) => (
              <ActButton
                key={a.to}
                label={a.label}
                primary={i === 0}
                pending={pending}
                onClick={() => act(a.to)}
              />
            ))}
          </div>
        )}
        {err && <p className="mt-2 text-xs font-semibold text-[#D0453A]">{err}</p>}
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

  const act = async (to: FuelExpenseStatus) => {
    setPending(true);
    setErr(null);
    try {
      await adminUpdateFuelExpenseStatus(token, expense.id, to);
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to update");
      setPending(false);
    }
  };

  const statusMeta =
    FUEL_STATUS_META[expense.status] ?? {
      label: expense.status,
      cls: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
    };
  const actions = FUEL_ACTIONS[expense.status] ?? [];

  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Fuel size={15} className="text-[#2E6FD6]" />
        <span className="text-sm font-bold text-[var(--text)]">
          {formatNPR(expense.amount)}
        </span>
        <span className="text-xs capitalize text-[var(--text-muted)]">
          {expense.fuelType}
          {expense.liters != null ? ` · ${expense.liters} L` : ""} ·{" "}
          {expense.odometerKm.toLocaleString()} km
          {expense.stationName ? ` · ${expense.stationName}` : ""}
        </span>
        <span className="ml-auto">
          <StatusPill meta={statusMeta} />
        </span>
      </div>
      {expense.notes && (
        <p className="mt-2 text-sm text-[var(--text-soft)]">{expense.notes}</p>
      )}

      <div className="mt-3 border-t border-[var(--border)] pt-3">
        <Meta
          showVehicle={showVehicle}
          registration={expense.vehicleRegistration}
          driverName={expense.driverName}
          date={fmtDate(expense.createdAt)}
        />
        {actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {actions.map((a, i) => (
              <ActButton
                key={a.to}
                label={a.label}
                primary={i === 0}
                pending={pending}
                onClick={() => act(a.to)}
              />
            ))}
          </div>
        )}
        {err && <p className="mt-2 text-xs font-semibold text-[#D0453A]">{err}</p>}
      </div>
    </li>
  );
}
