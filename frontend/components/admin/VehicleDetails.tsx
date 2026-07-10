"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bike,
  Calendar,
  CalendarClock,
  Car,
  CheckCircle2,
  Clock,
  FileText,
  Gauge,
  History,
  MapPin,
  Minus,
  Package,
  RefreshCw,
  ShieldCheck,
  Truck,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import {
  adminGetVehicleById,
  type Vehicle,
  type VehicleStatus,
} from "@/lib/api/fleet.api";
import {
  adminGetDrivers,
  type Driver,
  type VehicleType,
} from "@/lib/api/driver.api";
import {
  adminGetIncidents,
  adminGetFuelExpenses,
  type AdminIncident,
  type AdminFuelExpense,
} from "@/lib/api/fleetReports.api";
import {
  IncidentRow,
  FuelExpenseRow,
} from "@/components/admin/fleetReportShared";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

const STATUS_CONFIG: Record<
  VehicleStatus,
  { label: string; badge: string; hero: string; iconColor: string; dot: string }
> = {
  assigned: {
    label: "Active",
    badge: "bg-[#DEF3E6] text-[#1E9E4C]",
    hero: "from-[#E9F6EE] to-[#CFE9D9]",
    iconColor: "text-[#1E9E4C]",
    dot: "bg-[#1E9E4C]",
  },
  maintenance: {
    label: "Maintenance",
    badge: "bg-[#FBF1DC] text-[#C99A3D]",
    hero: "from-[#FBF2DE] to-[#F3E2BC]",
    iconColor: "text-[#C99A3D]",
    dot: "bg-[#C99A3D]",
  },
  available: {
    label: "Idle",
    badge: "bg-[#EDF1F6] text-[#5A6B82]",
    hero: "from-[#EFF2F7] to-[#DBE2EC]",
    iconColor: "text-[#5A6B82]",
    dot: "bg-[#5A6B82]",
  },
  inactive: {
    label: "Inactive",
    badge: "bg-[#FBE4E1] text-[#D0453A]",
    hero: "from-[#FBE7E3] to-[#F3CEC8]",
    iconColor: "text-[#D0453A]",
    dot: "bg-[#D0453A]",
  },
};

const TYPE_LABELS: Record<VehicleType, string> = {
  bike: "Bike",
  scooter: "Scooter",
  car: "Car",
  van: "Van",
  pickup: "Pickup Truck",
  truck: "Heavy Truck",
};

const TYPE_ICONS: Record<VehicleType, LucideIcon> = {
  bike: Bike,
  scooter: Bike,
  car: Car,
  van: Truck,
  pickup: Truck,
  truck: Truck,
};

function formatDate(value: string | null): string {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysUntil(value: string | null): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// Compliance pill shown next to insurance / registration expiry dates.
function expiryMeta(value: string | null): {
  label: string;
  cls: string;
  Icon: LucideIcon;
} {
  const days = daysUntil(value);
  if (days === null)
    return {
      label: "Not set",
      cls: "bg-[var(--surface-muted)] text-[var(--text-muted)]",
      Icon: Minus,
    };
  if (days < 0)
    return { label: "Expired", cls: "bg-[#FBE4E1] text-[#D0453A]", Icon: AlertTriangle };
  if (days <= 30)
    return {
      label: `${days} day${days === 1 ? "" : "s"} left`,
      cls: "bg-[#FBF1DC] text-[#C99A3D]",
      Icon: Clock,
    };
  return { label: "Valid", cls: "bg-[#DEF3E6] text-[#1E9E4C]", Icon: CheckCircle2 };
}

export default function VehicleDetails({
  token,
  vehicleId,
}: {
  token: string;
  vehicleId: string;
}) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [incidents, setIncidents] = useState<AdminIncident[]>([]);
  const [fuelExpenses, setFuelExpenses] = useState<AdminFuelExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const [vehicleData, driverResult, incidentResult, fuelResult] =
          await Promise.all([
            adminGetVehicleById(token, vehicleId),
            adminGetDrivers(token, 1, 200),
            adminGetIncidents(token, { vehicleId, limit: 50 }),
            adminGetFuelExpenses(token, { vehicleId, limit: 50 }),
          ]);
        setVehicle(vehicleData);
        setDrivers(driverResult.data);
        setIncidents(incidentResult.data);
        setFuelExpenses(fuelResult.data);
        setError(null);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Failed to load vehicle");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token, vehicleId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  // Keep the page live if the vehicle is reassigned/edited elsewhere.
  useAutoRefresh(() => load(true));

  const driverNameById = useMemo(() => {
    const map = new Map<string, string>();
    drivers.forEach((driver) => map.set(driver.id, driver.fullName));
    return map;
  }, [drivers]);

  const history = useMemo(
    () =>
      vehicle
        ? [...vehicle.assignmentHistory].sort(
            (a, b) =>
              new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime(),
          )
        : [],
    [vehicle],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-32 animate-pulse rounded bg-[var(--surface-muted)]" />
        <div className="h-64 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-52 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
          <div className="h-52 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="space-y-6">
        <BackLink />
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBE4E1] text-[#D0453A]">
            <AlertCircle size={24} />
          </div>
          <p className="text-sm font-semibold text-[var(--text)]">
            {error ?? "Vehicle not found."}
          </p>
          <button
            type="button"
            onClick={() => load()}
            className="btn-secondary btn-sm inline-flex items-center gap-2"
          >
            <RefreshCw size={15} /> Try again
          </button>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[vehicle.status];
  const TypeIcon = TYPE_ICONS[vehicle.type];
  const title =
    [vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(" ") ||
    "Details not set";

  return (
    <div className="space-y-6">
      <BackLink />

      {/* ============ Hero ============ */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
        <div className="grid lg:grid-cols-[minmax(0,420px)_1fr]">
          {/* Image / glyph */}
          <div
            className={`relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br ${cfg.hero} lg:h-full`}
          >
            {vehicle.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vehicle.imageUrl}
                alt={vehicle.registrationNumber}
                className="h-full w-full object-cover"
              />
            ) : (
              <TypeIcon
                size={84}
                strokeWidth={1.4}
                className={`${cfg.iconColor} opacity-80`}
              />
            )}
            <span
              className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold ${cfg.badge}`}
            >
              {cfg.label}
            </span>
          </div>

          {/* Identity */}
          <div className="p-6 sm:p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              {TYPE_LABELS[vehicle.type]}
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--text)]">
              {vehicle.registrationNumber}
            </h1>
            <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
              {title}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <HeroStat
                Icon={Gauge}
                label="Odometer"
                value={
                  vehicle.odometerKm > 0
                    ? `${vehicle.odometerKm.toLocaleString()} km`
                    : "New"
                }
              />
              <HeroStat
                Icon={Package}
                label="Capacity"
                value={vehicle.capacityKg ? `${vehicle.capacityKg} kg` : "—"}
              />
              <HeroStat Icon={Truck} label="Type" value={TYPE_LABELS[vehicle.type]} />
              <HeroStat
                Icon={MapPin}
                label="Branch"
                value={vehicle.branch || "—"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============ Detail grid ============ */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Assignment */}
        <SectionCard title="Assignment" Icon={User}>
          <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${cfg.badge}`}
            >
              <User size={22} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-[var(--text)]">
                {vehicle.assignedDriverName || "Unassigned"}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                {vehicle.assignedDriverId
                  ? "Currently assigned"
                  : "No driver assigned"}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Documents & compliance */}
        <SectionCard title="Documents & Compliance" Icon={ShieldCheck}>
          <div className="space-y-3">
            <ComplianceRow
              Icon={ShieldCheck}
              label="Insurance Expiry"
              value={formatDate(vehicle.insuranceExpiry)}
              expiry={vehicle.insuranceExpiry}
            />
            <ComplianceRow
              Icon={FileText}
              label="Registration Expiry"
              value={formatDate(vehicle.registrationExpiry)}
              expiry={vehicle.registrationExpiry}
            />
          </div>
        </SectionCard>

        {/* Maintenance */}
        <SectionCard title="Maintenance" Icon={Wrench}>
          <div className="space-y-3">
            <InfoRow
              Icon={Wrench}
              label="Last Service"
              value={formatDate(vehicle.lastServiceAt)}
            />
            <InfoRow
              Icon={CalendarClock}
              label="Next Service"
              value={formatDate(vehicle.nextServiceAt)}
            />
            <InfoRow
              Icon={Gauge}
              label="Odometer"
              value={
                vehicle.odometerKm > 0
                  ? `${vehicle.odometerKm.toLocaleString()} km`
                  : "New vehicle"
              }
            />
          </div>
        </SectionCard>

        {/* Record */}
        <SectionCard title="Record" Icon={Calendar}>
          <div className="space-y-3">
            <InfoRow
              Icon={Calendar}
              label="Added"
              value={formatDate(vehicle.createdAt)}
            />
            <InfoRow
              Icon={RefreshCw}
              label="Last Updated"
              value={formatDate(vehicle.updatedAt)}
            />
          </div>
        </SectionCard>
      </div>

      {/* ============ Assignment history ============ */}
      <SectionCard title="Assignment History" Icon={History}>
        {history.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-4 py-8 text-center text-sm font-medium text-[var(--text-muted)]">
            No assignment history yet.
          </p>
        ) : (
          <ol className="relative space-y-5 pl-6">
            <span className="absolute left-[7px] top-1.5 bottom-1.5 w-px bg-[var(--border)]" />
            {history.map((entry, idx) => {
              const active = !entry.unassignedAt;
              return (
                <li key={`${entry.driverId}-${idx}`} className="relative">
                  <span
                    className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-[var(--surface)] ${
                      active ? "bg-[#1E9E4C]" : "bg-[var(--text-muted)]"
                    }`}
                  />
                  <p className="text-sm font-bold text-[var(--text)]">
                    {driverNameById.get(entry.driverId) ?? "Former driver"}
                    {active && (
                      <span className="ml-2 rounded-full bg-[#DEF3E6] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#1E9E4C]">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                    {formatDate(entry.assignedAt)} —{" "}
                    {entry.unassignedAt ? formatDate(entry.unassignedAt) : "Present"}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </SectionCard>

      {/* ============ Incident reports ============ */}
      <SectionCard title="Incident Reports" Icon={AlertTriangle}>
        {incidents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-4 py-8 text-center text-sm font-medium text-[var(--text-muted)]">
            No issues reported for this vehicle.
          </p>
        ) : (
          <ul className="space-y-3">
            {incidents.map((inc) => (
              <IncidentRow
                key={inc.id}
                incident={inc}
                token={token}
                onChanged={() => load(true)}
                showVehicle={false}
              />
            ))}
          </ul>
        )}
      </SectionCard>

      {/* ============ Fuel expenses ============ */}
      <SectionCard title="Fuel Expenses" Icon={Gauge}>
        {fuelExpenses.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-soft)] px-4 py-8 text-center text-sm font-medium text-[var(--text-muted)]">
            No fuel expenses logged for this vehicle.
          </p>
        ) : (
          <ul className="space-y-3">
            {fuelExpenses.map((f) => (
              <FuelExpenseRow
                key={f.id}
                expense={f}
                token={token}
                onChanged={() => load(true)}
                showVehicle={false}
              />
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/fleet"
      className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--text-muted)] transition-colors hover:text-[var(--teal)]"
    >
      <ArrowLeft size={16} /> Back to Fleet
    </Link>
  );
}

function HeroStat({
  Icon,
  label,
  value,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        <Icon size={13} /> {label}
      </p>
      <p className="mt-1 truncate text-sm font-black text-[var(--text)]">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  Icon,
  children,
}: {
  title: string;
  Icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-[var(--teal)]">
        <Icon size={16} /> {title}
      </h2>
      {children}
    </div>
  );
}

function InfoRow({
  Icon,
  label,
  value,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
      <span className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
        <Icon size={15} /> {label}
      </span>
      <span className="text-sm font-bold text-[var(--text)]">{value}</span>
    </div>
  );
}

function ComplianceRow({
  Icon,
  label,
  value,
  expiry,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  expiry: string | null;
}) {
  const meta = expiryMeta(expiry);
  const PillIcon = meta.Icon;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
      <span className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)]">
        <Icon size={15} /> {label}
      </span>
      <span className="flex items-center gap-2">
        <span className="text-sm font-bold text-[var(--text)]">{value}</span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.cls}`}
        >
          <PillIcon size={11} /> {meta.label}
        </span>
      </span>
    </div>
  );
}
