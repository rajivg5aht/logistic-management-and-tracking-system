"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  Truck,
  AlertTriangle,
  Fuel,
  Gauge,
  Calendar,
  ShieldCheck,
  FileText,
  MapPin,
  Wrench,
  History,
  Package,
  ExternalLink,
  Pencil,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import {
  driverGetFleet,
  driverReportFleetIncident,
  driverUpdateFleetIncident,
  driverDeleteFleetIncident,
  driverLogFuelExpense,
  driverUpdateFuelExpense,
  driverDeleteFuelExpense,
  type DriverFleet,
  type DriverFleetIncident,
  type DriverFleetIncidentPayload,
  type DriverFuelExpense,
} from "@/lib/api/driver.api";
import { formatNPR } from "@/lib/pricing";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

const VEHICLE_STATUS_META: Record<string, { label: string; cls: string }> = {
  available: { label: "Available", cls: "bg-[#E6F4EC] text-[#1F9D57]" },
  active: { label: "Active", cls: "bg-[var(--info-soft)] text-[var(--info)]" },
  maintenance_required: { label: "Maintenance Required", cls: "bg-[#FBF0DA] text-[#C08A2D]" },
  inactive: { label: "Inactive", cls: "bg-[#FBE9E5] text-[#D0533F]" },
};

const SEVERITY_META: Record<string, string> = {
  low: "bg-[#E6F4EC] text-[#1F9D57]",
  medium: "bg-[var(--info-soft)] text-[var(--info)]",
  high: "bg-[#FBF0DA] text-[#C08A2D]",
  critical: "bg-[#FBE9E5] text-[#D0533F]",
};

const STATUS_META: Record<string, string> = {
  pending_review: "bg-[#FBF0DA] text-[#C08A2D]",
  maintenance_required: "bg-[#FCE8D8] text-[#C06A2D]",
  resolved: "bg-[#E6F4EC] text-[#1F9D57]",
  rejected: "bg-[#FBE9E5] text-[#D0533F]",
  submitted: "bg-[var(--info-soft)] text-[var(--info)]",
  under_review: "bg-[#FBF0DA] text-[#C08A2D]",
  approved: "bg-[#E6F4EC] text-[#1F9D57]",
  reimbursed: "bg-[#E7F5F2] text-[var(--teal)]",
};

const INCIDENT_CATEGORIES: DriverFleetIncidentPayload["category"][] = [
  "mechanical",
  "damage",
  "tire",
  "brake",
  "engine",
  "other",
];

const INCIDENT_SEVERITIES: DriverFleetIncidentPayload["severity"][] = [
  "low",
  "medium",
  "high",
  "critical",
];

const FUEL_TYPES = ["petrol", "diesel", "electric", "other"] as const;

function fmtDate(value: string | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(value: string): string {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function expiryTone(value: string | null | undefined): string {
  if (!value) return "text-[var(--text)]";
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return "text-[var(--text)]";
  const days = (target - Date.now()) / 86_400_000;
  if (days < 0) return "text-[var(--danger)] font-bold";
  if (days < 30) return "text-[#C08A2D] font-bold";
  return "text-[var(--text)]";
}

const FIELD_LABEL =
  "mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]";
const FIELD_BASE =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]";

type TabKey = "overview" | "history" | "incidents" | "fuel";

const TABS: { key: TabKey; label: string; icon: typeof Truck }[] = [
  { key: "overview", label: "Overview", icon: Truck },
  { key: "history", label: "Assignment History", icon: History },
  { key: "incidents", label: "Incident Reports", icon: AlertTriangle },
  { key: "fuel", label: "Fuel Expenses", icon: Fuel },
];

type FleetModal =
  | { type: "incident"; incident?: DriverFleetIncident }
  | { type: "fuel"; expense?: DriverFuelExpense }
  | null;

export default function DriverFleet({ token }: { token: string }) {
  const [fleet, setFleet] = useState<DriverFleet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");
  const [modal, setModal] = useState<FleetModal>(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const res = await driverGetFleet(token);
        setFleet(res);
        setError(null);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Failed to load fleet");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    load();
  }, [load]);

  useAutoRefresh(() => load(true), { intervalMs: 15_000 });

  const vehicle = fleet?.vehicle ?? null;
  const statusMeta = vehicle
    ? VEHICLE_STATUS_META[vehicle.status] ?? {
        label: vehicle.status,
        cls: "bg-[var(--surface-soft)] text-[var(--text-muted)]",
      }
    : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--accent-strong)]">
          My Fleet
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--text)] sm:text-3xl">
          Assigned Vehicle
        </h1>
        <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
          Your vehicle details, assignment history, and expense logs.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="h-80 animate-pulse rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]" />
      ) : !vehicle ? (
        <>
          <EmptyState />
          {fleet && fleet.incidents.length > 0 && (
            <div
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <h2 className="mb-4 text-lg font-black text-[var(--text)]">
                Issue Reports
              </h2>
              <IncidentsTab
                fleet={fleet}
                token={token}
                onChanged={() => load(true)}
                onEdit={(incident) => setModal({ type: "incident", incident })}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div
              className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] lg:col-span-2"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative flex h-44 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#334155] sm:h-auto sm:w-52">
                  {vehicle.imageUrl ? (
                    <Image
                      src={vehicle.imageUrl}
                      alt={vehicle.registrationNumber}
                      fill
                      sizes="(min-width: 640px) 208px, 100vw"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Truck size={52} strokeWidth={1.5} className="text-white/70" />
                  )}
                  {statusMeta && (
                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold ${statusMeta.cls}`}
                    >
                      {statusMeta.label}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-center gap-2 p-6">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--accent-strong)]">
                    <Truck size={12} />
                    {vehicle.type}
                  </span>
                  <h2 className="text-2xl font-black tracking-tight text-[var(--text)]">
                    {[vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
                      vehicle.type}
                  </h2>
                  <p className="text-sm font-semibold text-[var(--text-muted)]">
                    ID: {vehicle.registrationNumber}
                    {vehicle.year ? ` · ${vehicle.year}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs font-medium text-[var(--text-muted)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Gauge size={13} />
                      {vehicle.odometerKm.toLocaleString()} km
                    </span>
                    {vehicle.capacityKg != null && (
                      <span className="inline-flex items-center gap-1.5">
                        <Package size={13} />
                        {vehicle.capacityKg} kg
                      </span>
                    )}
                    {vehicle.branch && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} />
                        {vehicle.branch}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <ActionCard
                Icon={AlertTriangle}
                title="Report an Issue"
                subtitle="Log a mechanical or safety problem"
                tint="bg-[#FBE9E5] text-[#D0533F]"
                onClick={() => setModal({ type: "incident" })}
              />
              <ActionCard
                Icon={Fuel}
                title="Log Fuel Expense"
                subtitle="Record a refuelling stop"
                tint="bg-[var(--info-soft)] text-[var(--info)]"
                onClick={() => setModal({ type: "fuel" })}
              />
            </div>
          </div>

          <div
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex gap-1 overflow-x-auto border-b border-[var(--border)] px-2">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-sm font-bold transition-colors ${
                      active
                        ? "border-[var(--accent)] text-[var(--accent-strong)]"
                        : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    <Icon size={16} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="p-5 sm:p-6">
              {tab === "overview" && <OverviewTab fleet={fleet!} />}
              {tab === "history" && <HistoryTab fleet={fleet!} />}
              {tab === "incidents" && (
                <IncidentsTab
                  fleet={fleet!}
                  token={token}
                  onChanged={() => load(true)}
                  onEdit={(incident) => setModal({ type: "incident", incident })}
                />
              )}
              {tab === "fuel" && (
                <FuelTab
                  fleet={fleet!}
                  token={token}
                  onChanged={() => load(true)}
                  onEdit={(expense) => setModal({ type: "fuel", expense })}
                />
              )}
            </div>
          </div>
        </>
      )}

      {modal?.type === "incident" && (
        <ReportIssueModal
          token={token}
          incident={modal.incident}
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            setTab("incidents");
            load(true);
          }}
        />
      )}
      {modal?.type === "fuel" && (
        <LogFuelModal
          token={token}
          expense={modal.expense}
          onClose={() => setModal(null)}
          onDone={() => {
            setModal(null);
            setTab("fuel");
            load(true);
          }}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="flex min-h-[20rem] flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--text-muted)]">
        <Truck size={26} />
      </div>
      <h3 className="mt-4 text-base font-bold text-[var(--text)]">
        No vehicle assigned
      </h3>
      <p className="mt-1 max-w-xs text-sm text-[var(--text-muted)]">
        You don&apos;t have a vehicle assigned right now. Contact your dispatcher
        and it will appear here.
      </p>
    </div>
  );
}

function ActionCard({
  Icon,
  title,
  subtitle,
  tint,
  onClick,
}: {
  Icon: typeof Truck;
  title: string;
  subtitle: string;
  tint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 text-left transition-colors hover:bg-[var(--surface-soft)] cursor-pointer"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
        <Icon size={19} className="stroke-[2.4]" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-[var(--text)]">{title}</p>
        <p className="truncate text-xs text-[var(--text-muted)]">{subtitle}</p>
      </div>
    </button>
  );
}

function DetailRow({
  Icon,
  label,
  value,
  valueCls = "text-[var(--text)]",
}: {
  Icon: typeof Truck;
  label: string;
  value: string;
  valueCls?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--text-muted)]">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </p>
        <p className={`text-sm font-bold ${valueCls}`}>{value}</p>
      </div>
    </div>
  );
}

function OverviewTab({ fleet }: { fleet: DriverFleet }) {
  const v = fleet.vehicle!;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <DetailRow
        Icon={Package}
        label="Capacity"
        value={v.capacityKg != null ? `${v.capacityKg} kg` : "—"}
      />
      <DetailRow
        Icon={Gauge}
        label="Odometer"
        value={`${v.odometerKm.toLocaleString()} km`}
      />
      <DetailRow Icon={Calendar} label="Assigned On" value={fmtDate(v.assignedAt)} />
      <DetailRow Icon={Wrench} label="Last Service" value={fmtDate(v.lastServiceAt)} />
      <DetailRow
        Icon={Wrench}
        label="Next Service"
        value={fmtDate(v.nextServiceAt)}
        valueCls={expiryTone(v.nextServiceAt)}
      />
      <DetailRow
        Icon={ShieldCheck}
        label="Insurance Expiry"
        value={fmtDate(v.insuranceExpiry)}
        valueCls={expiryTone(v.insuranceExpiry)}
      />
      <DetailRow
        Icon={FileText}
        label="Registration Expiry"
        value={fmtDate(v.registrationExpiry)}
        valueCls={expiryTone(v.registrationExpiry)}
      />
    </div>
  );
}

function TabEmpty({ Icon, text }: { Icon: typeof Truck; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--text-muted)]">
        <Icon size={22} />
      </div>
      <p className="mt-3 text-sm font-medium text-[var(--text-muted)]">{text}</p>
    </div>
  );
}

function HistoryTab({ fleet }: { fleet: DriverFleet }) {
  if (fleet.assignmentHistory.length === 0) {
    return <TabEmpty Icon={History} text="No assignment history yet." />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <th className="pb-3 pr-4">Vehicle</th>
            <th className="pb-3 pr-4">Assigned</th>
            <th className="pb-3 pr-4">Released</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {fleet.assignmentHistory.map((a, i) => (
            <tr key={`${a.vehicleId}-${a.assignedAt}-${i}`}>
              <td className="py-3 pr-4">
                <p className="font-bold text-[var(--text)]">{a.registrationNumber}</p>
                <p className="text-xs capitalize text-[var(--text-muted)]">
                  {[a.make, a.model].filter(Boolean).join(" ") || a.type}
                </p>
              </td>
              <td className="py-3 pr-4 text-[var(--text-soft)]">{fmtDate(a.assignedAt)}</td>
              <td className="py-3 pr-4 text-[var(--text-soft)]">
                {a.unassignedAt ? fmtDate(a.unassignedAt) : "—"}
              </td>
              <td className="py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                    a.status === "current"
                      ? "bg-[#E6F4EC] text-[#1F9D57]"
                      : "bg-[var(--surface-soft)] text-[var(--text-muted)]"
                  }`}
                >
                  {a.status === "current" ? "Current" : "Released"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DriverNote({ label, value }: { label: string; value?: string | null }) {
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

function SmallActionButton({
  Icon,
  label,
  pending,
  onClick,
}: {
  Icon: typeof Truck;
  label: string;
  pending?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-bold text-[var(--text-soft)] transition-colors hover:bg-[var(--surface)] disabled:opacity-60 cursor-pointer"
    >
      {pending ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />}
      {label}
    </button>
  );
}

function IncidentsTab({
  fleet,
  token,
  onChanged,
  onEdit,
}: {
  fleet: DriverFleet;
  token: string;
  onChanged: () => void;
  onEdit: (incident: DriverFleetIncident) => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const cancel = async (incident: DriverFleetIncident) => {
    if (!window.confirm("Cancel this issue report?")) return;
    setPendingId(incident.id);
    try {
      await driverDeleteFleetIncident(token, incident.id);
      onChanged();
    } finally {
      setPendingId(null);
    }
  };

  if (fleet.incidents.length === 0) {
    return <TabEmpty Icon={AlertTriangle} text="No issues reported. Use Report an Issue to log one." />;
  }
  return (
    <ul className="space-y-3">
      {fleet.incidents.map((inc) => {
        const editable = inc.status === "pending_review";
        return (
          <li
            key={inc.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold capitalize text-[var(--text)]">
                {inc.category}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  SEVERITY_META[inc.severity] ?? "bg-[var(--surface)] text-[var(--text-muted)]"
                }`}
              >
                {inc.severity}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  STATUS_META[inc.status] ?? "bg-[var(--surface)] text-[var(--text-muted)]"
                }`}
              >
                {formatStatus(inc.status)}
              </span>
              <span className="ml-auto text-xs font-medium text-[var(--text-muted)]">
                {fmtDate(inc.createdAt)}
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--text-soft)]">{inc.description}</p>
            {inc.location && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--text-muted)]">
                <MapPin size={12} /> {inc.location}
              </p>
            )}
            <div className="mt-3">
              <DriverNote label="Admin note" value={inc.adminNote} />
            </div>
            {editable && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
                <SmallActionButton Icon={Pencil} label="Edit" onClick={() => onEdit(inc)} />
                <SmallActionButton
                  Icon={Trash2}
                  label="Cancel"
                  pending={pendingId === inc.id}
                  onClick={() => cancel(inc)}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function FuelTab({
  fleet,
  token,
  onChanged,
  onEdit,
}: {
  fleet: DriverFleet;
  token: string;
  onChanged: () => void;
  onEdit: (expense: DriverFuelExpense) => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const cancel = async (expense: DriverFuelExpense) => {
    if (!window.confirm("Cancel this fuel expense?")) return;
    setPendingId(expense.id);
    try {
      await driverDeleteFuelExpense(token, expense.id);
      onChanged();
    } finally {
      setPendingId(null);
    }
  };

  if (fleet.fuelExpenses.length === 0) {
    return <TabEmpty Icon={Fuel} text="No fuel expenses logged yet." />;
  }
  return (
    <ul className="space-y-3">
      {fleet.fuelExpenses.map((f) => {
        const editable = f.status === "submitted";
        return (
          <li
            key={f.id}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--info-soft)] text-[var(--info)]">
                <Fuel size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--text)]">{formatNPR(f.amount)}</p>
                <p className="text-xs capitalize text-[var(--text-muted)]">
                  {f.fuelType}
                  {f.liters != null ? ` - ${f.liters} L` : ""} - {f.odometerKm.toLocaleString()} km
                  {f.stationName ? ` - ${f.stationName}` : ""}
                </p>
              </div>
              <div className="ml-auto flex flex-col items-end gap-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    STATUS_META[f.status] ?? "bg-[var(--surface)] text-[var(--text-muted)]"
                  }`}
                >
                  {formatStatus(f.status)}
                </span>
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  {fmtDate(f.createdAt)}
                </span>
              </div>
            </div>
            {f.notes && <p className="mt-2 text-sm text-[var(--text-soft)]">{f.notes}</p>}
            {f.receiptUrl && (
              <a
                href={f.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-strong)] hover:underline"
              >
                <ExternalLink size={12} /> View receipt
              </a>
            )}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <DriverNote label="Admin note" value={f.adminNote} />
              <DriverNote label="Rejection reason" value={f.rejectionReason} />
              <DriverNote label="Payment reference" value={f.paymentReference} />
              <DriverNote label="Reimbursed" value={f.reimbursedAt ? fmtDate(f.reimbursedAt) : ""} />
            </div>
            {editable && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--border)] pt-3">
                <SmallActionButton Icon={Pencil} label="Edit" onClick={() => onEdit(f)} />
                <SmallActionButton
                  Icon={Trash2}
                  label="Cancel"
                  pending={pendingId === f.id}
                  onClick={() => cancel(f)}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
function ModalShell({
  title,
  Icon,
  onClose,
  children,
}: {
  title: string;
  Icon: typeof Truck;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-[var(--surface)] sm:rounded-2xl"
        style={{ boxShadow: "var(--shadow-md)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-[var(--text)]">
            <Icon size={18} className="text-[var(--accent)]" />
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)] cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-3.5 py-2.5 text-sm font-semibold text-[var(--danger)]">
      {message}
    </div>
  );
}

function SubmitRow({
  pending,
  label,
  onCancel,
}: {
  pending: boolean;
  label: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex justify-end gap-3 pt-1">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-bold text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
      >
        {pending && <Loader2 size={15} className="animate-spin" />}
        {label}
      </button>
    </div>
  );
}

function ReportIssueModal({
  token,
  incident,
  onClose,
  onDone,
}: {
  token: string;
  incident?: DriverFleetIncident;
  onClose: () => void;
  onDone: () => void;
}) {
  const isEdit = Boolean(incident);
  const [category, setCategory] =
    useState<DriverFleetIncidentPayload["category"]>(
      (incident?.category as DriverFleetIncidentPayload["category"]) ?? "mechanical",
    );
  const [severity, setSeverity] =
    useState<DriverFleetIncidentPayload["severity"]>(
      (incident?.severity as DriverFleetIncidentPayload["severity"]) ?? "medium",
    );
  const [description, setDescription] = useState(incident?.description ?? "");
  const [location, setLocation] = useState(incident?.location ?? "");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 10) {
      setErr("Describe the issue in at least 10 characters.");
      return;
    }
    setPending(true);
    setErr(null);
    try {
      const payload = {
        category,
        severity,
        description: description.trim(),
        location: location.trim() || undefined,
      };
      if (incident) {
        await driverUpdateFleetIncident(token, incident.id, payload);
      } else {
        await driverReportFleetIncident(token, payload);
      }
      onDone();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Failed to save issue");
      setPending(false);
    }
  };

  return (
    <ModalShell title={isEdit ? "Edit Issue" : "Report an Issue"} Icon={AlertTriangle} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {err && <FormError message={err} />}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={FIELD_LABEL}>Category</label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as DriverFleetIncidentPayload["category"])
              }
              className={`${FIELD_BASE} capitalize`}
            >
              {INCIDENT_CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={FIELD_LABEL}>Severity</label>
            <select
              value={severity}
              onChange={(e) =>
                setSeverity(e.target.value as DriverFleetIncidentPayload["severity"])
              }
              className={`${FIELD_BASE} capitalize`}
            >
              {INCIDENT_SEVERITIES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className={FIELD_LABEL}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="What is wrong with the vehicle?"
            className={`${FIELD_BASE} resize-none`}
          />
          <p className="mt-1 text-[11px] font-medium text-[var(--text-muted)]">
            {description.trim().length}/10 characters minimum
          </p>
        </div>
        <div>
          <label className={FIELD_LABEL}>Location (optional)</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where did this happen?"
            className={FIELD_BASE}
          />
        </div>
        <SubmitRow pending={pending} label={isEdit ? "Save Report" : "Submit Report"} onCancel={onClose} />
      </form>
    </ModalShell>
  );
}
function LogFuelModal({
  token,
  expense,
  onClose,
  onDone,
}: {
  token: string;
  expense?: DriverFuelExpense;
  onClose: () => void;
  onDone: () => void;
}) {
  const isEdit = Boolean(expense);
  const [fuelType, setFuelType] =
    useState<(typeof FUEL_TYPES)[number]>(
      (expense?.fuelType as (typeof FUEL_TYPES)[number]) ?? "diesel",
    );
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [odometerKm, setOdometerKm] = useState(
    expense ? String(expense.odometerKm) : "",
  );
  const [liters, setLiters] = useState(
    expense?.liters != null ? String(expense.liters) : "",
  );
  const [stationName, setStationName] = useState(expense?.stationName ?? "");
  const [notes, setNotes] = useState(expense?.notes ?? "");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount);
    const odoNum = Number(odometerKm);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setErr("Enter a valid fuel amount.");
      return;
    }
    if (!Number.isFinite(odoNum) || odoNum < 0) {
      setErr("Enter a valid odometer reading.");
      return;
    }
    setPending(true);
    setErr(null);
    try {
      const payload = {
        fuelType,
        amount: amountNum,
        odometerKm: odoNum,
        liters: liters.trim() ? Number(liters) : undefined,
        stationName: stationName.trim() || undefined,
        notes: notes.trim() || undefined,
        receipt,
      };
      if (expense) {
        await driverUpdateFuelExpense(token, expense.id, payload);
      } else {
        await driverLogFuelExpense(token, payload);
      }
      onDone();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Failed to save fuel expense");
      setPending(false);
    }
  };

  return (
    <ModalShell title={isEdit ? "Edit Fuel Expense" : "Log Fuel Expense"} Icon={Fuel} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {err && <FormError message={err} />}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={FIELD_LABEL}>Fuel Type</label>
            <select
              value={fuelType}
              onChange={(e) =>
                setFuelType(e.target.value as (typeof FUEL_TYPES)[number])
              }
              className={`${FIELD_BASE} capitalize`}
            >
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f} className="capitalize">
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={FIELD_LABEL}>Amount (Rs)</label>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className={FIELD_BASE}
            />
          </div>
          <div>
            <label className={FIELD_LABEL}>Odometer (km)</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={odometerKm}
              onChange={(e) => setOdometerKm(e.target.value)}
              placeholder="0"
              className={FIELD_BASE}
            />
          </div>
          <div>
            <label className={FIELD_LABEL}>Liters (optional)</label>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={liters}
              onChange={(e) => setLiters(e.target.value)}
              placeholder="0"
              className={FIELD_BASE}
            />
          </div>
        </div>
        <div>
          <label className={FIELD_LABEL}>Station (optional)</label>
          <input
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
            placeholder="Fuel station name"
            className={FIELD_BASE}
          />
        </div>
        <div>
          <label className={FIELD_LABEL}>Receipt (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
            className={FIELD_BASE}
          />
          {expense?.receiptUrl && !receipt && (
            <a
              href={expense.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-strong)] hover:underline"
            >
              <ExternalLink size={12} /> Current receipt
            </a>
          )}
        </div>
        <div>
          <label className={FIELD_LABEL}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Anything to add?"
            className={`${FIELD_BASE} resize-none`}
          />
        </div>
        <SubmitRow pending={pending} label={isEdit ? "Save Expense" : "Submit Expense"} onCancel={onClose} />
      </form>
    </ModalShell>
  );
}
