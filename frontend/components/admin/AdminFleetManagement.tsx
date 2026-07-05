"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Gauge,
  Loader2,
  Plus,
  Search,
  Truck,
  UserRoundCheck,
  Wrench,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import {
  adminAssignVehicle,
  adminCreateVehicle,
  adminDeactivateVehicle,
  adminGetFleetStats,
  adminGetVehicles,
  adminUpdateVehicle,
  type FleetMeta,
  type FleetStats,
  type Vehicle,
  type VehiclePayload,
  type VehicleStatus,
} from "@/lib/api/fleet.api";
import {
  adminGetDrivers,
  VEHICLE_TYPES,
  type Driver,
} from "@/lib/api/driver.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

const EMPTY_FORM = {
  registrationNumber: "",
  type: "bike" as (typeof VEHICLE_TYPES)[number],
  make: "",
  model: "",
  year: "",
  capacityKg: "",
  branch: "",
  status: "available" as VehicleStatus,
  insuranceExpiry: "",
  registrationExpiry: "",
  lastServiceAt: "",
  nextServiceAt: "",
  odometerKm: "0",
};

const STATUS_CONFIG: Record<
  VehicleStatus,
  { label: string; className: string }
> = {
  available: {
    label: "Available",
    className: "bg-[#DEF3E6] text-[#1E9E4C]",
  },
  assigned: {
    label: "Assigned",
    className: "bg-[#E8F0FB] text-[#2E6FD6]",
  },
  maintenance: {
    label: "Maintenance",
    className: "bg-[#FBF1DC] text-[#C99A3D]",
  },
  inactive: {
    label: "Inactive",
    className: "bg-[#FBE4E1] text-[#D0453A]",
  },
};

const FILTERS: Array<{ id: VehicleStatus | "all"; label: string }> = [
  { id: "all", label: "All Vehicles" },
  { id: "available", label: "Available" },
  { id: "assigned", label: "Assigned" },
  { id: "maintenance", label: "Maintenance" },
  { id: "inactive", label: "Inactive" },
];

function toDateInput(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

export default function AdminFleetManagement({ token }: { token: string }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stats, setStats] = useState<FleetStats | null>(null);
  const [meta, setMeta] = useState<FleetMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<VehicleStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [driverId, setDriverId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadData = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const [fleet, fleetStats, driverResult] = await Promise.all([
          adminGetVehicles(
            token,
            page,
            10,
            search,
            filter === "all" ? "" : filter,
          ),
          adminGetFleetStats(token),
          adminGetDrivers(token, 1, 200),
        ]);
        setVehicles(fleet.data);
        setMeta(fleet.meta);
        setStats(fleetStats);
        setDrivers(driverResult.data);
        setError(null);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Failed to load fleet");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token, page, search, filter],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  useAutoRefresh(() => loadData(true));

  const assignableDrivers = useMemo(
    () =>
      drivers.filter(
        (driver) =>
          driver.status === "active" &&
          !!driver.phoneNumber &&
          !!driver.licenseNumber &&
          (driver.availabilityStatus === "available" ||
            driver.id === selected?.assignedDriverId),
      ),
    [drivers, selected],
  );

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    setSelected(vehicle);
    setForm({
      registrationNumber: vehicle.registrationNumber,
      type: vehicle.type,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year?.toString() ?? "",
      capacityKg: vehicle.capacityKg?.toString() ?? "",
      branch: vehicle.branch,
      status: vehicle.status,
      insuranceExpiry: toDateInput(vehicle.insuranceExpiry),
      registrationExpiry: toDateInput(vehicle.registrationExpiry),
      lastServiceAt: toDateInput(vehicle.lastServiceAt),
      nextServiceAt: toDateInput(vehicle.nextServiceAt),
      odometerKm: vehicle.odometerKm.toString(),
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const openAssignment = (vehicle: Vehicle) => {
    setSelected(vehicle);
    setDriverId(vehicle.assignedDriverId ?? "");
    setFormError(null);
    setIsAssignOpen(true);
  };

  const buildPayload = (): VehiclePayload => ({
    registrationNumber: form.registrationNumber.trim().toUpperCase(),
    type: form.type,
    make: form.make.trim(),
    model: form.model.trim(),
    year: form.year ? Number(form.year) : undefined,
    capacityKg: form.capacityKg ? Number(form.capacityKg) : undefined,
    branch: form.branch.trim(),
    status: form.status === "assigned" ? undefined : form.status,
    insuranceExpiry: form.insuranceExpiry || null,
    registrationExpiry: form.registrationExpiry || null,
    lastServiceAt: form.lastServiceAt || null,
    nextServiceAt: form.nextServiceAt || null,
    odometerKm: Number(form.odometerKm || 0),
  });

  const submitVehicle = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.registrationNumber) {
      setFormError("Registration number is required.");
      return;
    }
    try {
      setSaving(true);
      setFormError(null);
      const payload = buildPayload();
      if (isEditOpen && selected) {
        await adminUpdateVehicle(token, selected.id, {
          type: payload.type,
          make: payload.make,
          model: payload.model,
          year: payload.year,
          capacityKg: payload.capacityKg,
          branch: payload.branch,
          status: payload.status,
          insuranceExpiry: payload.insuranceExpiry,
          registrationExpiry: payload.registrationExpiry,
          lastServiceAt: payload.lastServiceAt,
          nextServiceAt: payload.nextServiceAt,
          odometerKm: payload.odometerKm,
        });
        setIsEditOpen(false);
      } else {
        await adminCreateVehicle(token, payload);
        setIsCreateOpen(false);
      }
      await loadData(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to save vehicle",
      );
    } finally {
      setSaving(false);
    }
  };

  const submitAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    try {
      setSaving(true);
      setFormError(null);
      await adminAssignVehicle(token, selected.id, driverId || null);
      setIsAssignOpen(false);
      await loadData(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to update assignment",
      );
    } finally {
      setSaving(false);
    }
  };

  const deactivateVehicle = async (vehicle: Vehicle) => {
    if (
      !window.confirm(
        `Deactivate ${vehicle.registrationNumber}? Historical records will be kept.`,
      )
    ) {
      return;
    }
    try {
      setSaving(true);
      await adminDeactivateVehicle(token, vehicle.id);
      await loadData(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to deactivate vehicle",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--teal)]">
            Fleet Management
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
            Manage vehicles, maintenance state, documents, and driver assignments.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search registration, make, branch…"
              className="form-input w-full pl-9 sm:w-72"
            />
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="btn-primary flex items-center justify-center gap-1.5"
          >
            <Plus size={17} /> Add Vehicle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          ["Total", stats?.total, Truck],
          ["Available", stats?.available, Gauge],
          ["Assigned", stats?.assigned, UserRoundCheck],
          ["Maintenance", stats?.maintenance, Wrench],
          ["Inactive", stats?.inactive, Ban],
        ].map(([label, value, Icon]) => {
          const StatIcon = Icon as typeof Truck;
          return (
            <div key={label as string} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">
                    {label as string}
                  </p>
                  <p className="mt-1 text-2xl font-black text-[var(--text)]">
                    {value === undefined ? "—" : String(value)}
                  </p>
                </div>
                <StatIcon size={20} className="text-[var(--teal)]" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setFilter(item.id);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              filter === item.id
                ? "bg-[var(--teal)] text-white"
                : "bg-[var(--surface-muted)] text-[var(--text-soft)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#F3C6BF] bg-[#FBE4E1] px-4 py-3 text-sm font-semibold text-[#D0453A]">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[62rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
                {[
                  "Registration",
                  "Vehicle",
                  "Capacity",
                  "Branch",
                  "Driver",
                  "Status",
                  "Service",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-[var(--teal)]" />
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-[var(--text-muted)]"
                  >
                    No vehicles found.
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="border-b border-[var(--border-light)] last:border-0"
                  >
                    <td className="px-5 py-4 font-black text-[var(--text)]">
                      {vehicle.registrationNumber}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold capitalize text-[var(--text)]">
                        {vehicle.type}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {[vehicle.make, vehicle.model, vehicle.year]
                          .filter(Boolean)
                          .join(" ") || "Details not set"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-[var(--text-soft)]">
                      {vehicle.capacityKg
                        ? `${vehicle.capacityKg.toLocaleString()} kg`
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-[var(--text-soft)]">
                      {vehicle.branch || "—"}
                    </td>
                    <td className="px-5 py-4">
                      {vehicle.assignedDriverName || "Unassigned"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${STATUS_CONFIG[vehicle.status].className}`}
                      >
                        {STATUS_CONFIG[vehicle.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-[var(--text-soft)]">
                      {vehicle.nextServiceAt
                        ? new Date(vehicle.nextServiceAt).toLocaleDateString()
                        : "Not scheduled"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(vehicle)}
                          className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--teal)]"
                          aria-label="Edit vehicle"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openAssignment(vehicle)}
                          disabled={["maintenance", "inactive"].includes(
                            vehicle.status,
                          )}
                          className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[#2E6FD6] disabled:opacity-35"
                          aria-label="Assign driver"
                        >
                          <UserRoundCheck size={16} />
                        </button>
                        {vehicle.status !== "inactive" && (
                          <button
                            type="button"
                            onClick={() => deactivateVehicle(vehicle)}
                            disabled={saving || !!vehicle.assignedDriverId}
                            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[#FBE4E1] hover:text-[#D0453A] disabled:opacity-35"
                            aria-label="Deactivate vehicle"
                          >
                            <Ban size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
            <span className="text-xs text-[var(--text-muted)]">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg p-2 disabled:opacity-35"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg p-2 disabled:opacity-35"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateOpen || isEditOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setIsEditOpen(false);
        }}
        title={isEditOpen ? "Edit Vehicle" : "Add Vehicle"}
      >
        <VehicleForm
          form={form}
          setForm={setForm}
          isEdit={isEditOpen}
          error={formError}
          saving={saving}
          onSubmit={submitVehicle}
          onCancel={() => {
            setIsCreateOpen(false);
            setIsEditOpen(false);
          }}
        />
      </Modal>

      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Vehicle Assignment"
      >
        <form onSubmit={submitAssignment} className="space-y-4">
          <div className="rounded-lg bg-[var(--surface-soft)] p-3">
            <p className="text-xs font-bold uppercase text-[var(--text-muted)]">
              Vehicle
            </p>
            <p className="font-black text-[var(--text)]">
              {selected?.registrationNumber}
            </p>
          </div>
          <div>
            <label className="form-label">Assigned Driver</label>
            <select
              className="form-input"
              value={driverId}
              onChange={(event) => setDriverId(event.target.value)}
            >
              <option value="">Unassigned</option>
              {assignableDrivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.fullName} · {driver.licenseNumber}
                </option>
              ))}
            </select>
          </div>
          {formError && <div className="form-error">{formError}</div>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-1.5"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              Save Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function VehicleForm({
  form,
  setForm,
  isEdit,
  error,
  saving,
  onSubmit,
  onCancel,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  isEdit: boolean;
  error: string | null;
  saving: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const set = (patch: Partial<typeof EMPTY_FORM>) =>
    setForm((current) => ({ ...current, ...patch }));

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="form-label">Registration Number *</label>
          <input
            className="form-input uppercase"
            value={form.registrationNumber}
            onChange={(event) =>
              set({ registrationNumber: event.target.value })
            }
            disabled={isEdit}
            placeholder="BA 12 PA 3456"
          />
        </div>
        <div>
          <label className="form-label">Vehicle Type *</label>
          <select
            className="form-input capitalize"
            value={form.type}
            onChange={(event) =>
              set({
                type: event.target.value as (typeof VEHICLE_TYPES)[number],
              })
            }
          >
            {VEHICLE_TYPES.map((type) => (
              <option key={type} value={type} className="capitalize">
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="form-label">Make</label>
          <input
            className="form-input"
            value={form.make}
            onChange={(event) => set({ make: event.target.value })}
          />
        </div>
        <div>
          <label className="form-label">Model</label>
          <input
            className="form-input"
            value={form.model}
            onChange={(event) => set({ model: event.target.value })}
          />
        </div>
        <div>
          <label className="form-label">Year</label>
          <input
            type="number"
            min="1900"
            max="2200"
            className="form-input"
            value={form.year}
            onChange={(event) => set({ year: event.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="form-label">Capacity (kg)</label>
          <input
            type="number"
            min="1"
            className="form-input"
            value={form.capacityKg}
            onChange={(event) => set({ capacityKg: event.target.value })}
          />
        </div>
        <div>
          <label className="form-label">Odometer (km)</label>
          <input
            type="number"
            min="0"
            className="form-input"
            value={form.odometerKm}
            onChange={(event) => set({ odometerKm: event.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="form-label">Branch / Hub</label>
          <input
            className="form-input"
            value={form.branch}
            onChange={(event) => set({ branch: event.target.value })}
          />
        </div>
        <div>
          <label className="form-label">Operational Status</label>
          <select
            className="form-input capitalize"
            value={form.status}
            onChange={(event) =>
              set({ status: event.target.value as VehicleStatus })
            }
            disabled={form.status === "assigned"}
          >
            {(["available", "maintenance", "inactive"] as VehicleStatus[]).map(
              (status) => (
                <option key={status} value={status} className="capitalize">
                  {status}
                </option>
              ),
            )}
            {form.status === "assigned" && (
              <option value="assigned">Assigned</option>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          ["Insurance Expiry", "insuranceExpiry"],
          ["Registration Expiry", "registrationExpiry"],
          ["Last Service", "lastServiceAt"],
          ["Next Service", "nextServiceAt"],
        ].map(([label, field]) => (
          <div key={field}>
            <label className="form-label">{label}</label>
            <input
              type="date"
              className="form-input"
              value={form[field as keyof typeof form]}
              onChange={(event) => set({ [field]: event.target.value })}
            />
          </div>
        ))}
      </div>

      {error && <div className="form-error">{error}</div>}
      <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-1.5"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {isEdit ? "Save Changes" : "Create Vehicle"}
        </button>
      </div>
    </form>
  );
}
