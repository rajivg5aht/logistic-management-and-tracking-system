"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  Bike,
  Car,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Gauge,
  Image as ImageIcon,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Truck,
  UserRoundCheck,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import {
  adminAssignVehicle,
  adminCreateVehicle,
  adminDeactivateVehicle,
  adminGetFleetStats,
  adminGetVehicles,
  adminRemoveVehicle,
  adminUpdateVehicle,
  adminUploadVehicleImage,
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
  type VehicleType,
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

const CARD_STATUS: Record<
  VehicleStatus,
  { label: string; badge: string; hero: string; iconColor: string }
> = {
  active: {
    label: "Active",
    badge: "bg-[var(--success-soft)] text-[var(--success)]",
    hero: "from-[#E9F6EE] to-[#CFE9D9]",
    iconColor: "text-[var(--success)]",
  },
  maintenance_required: {
    label: "Maintenance Required",
    badge: "bg-[#FBF1DC] text-[var(--accent-hover)]",
    hero: "from-[#FBF2DE] to-[#F3E2BC]",
    iconColor: "text-[var(--accent-hover)]",
  },
  available: {
    label: "Available",
    badge: "bg-[#EDF1F6] text-[#5A6B82]",
    hero: "from-[#EFF2F7] to-[#DBE2EC]",
    iconColor: "text-[#5A6B82]",
  },
  inactive: {
    label: "Inactive",
    badge: "bg-[var(--danger-soft)] text-[var(--danger)]",
    hero: "from-[#FBE7E3] to-[#F3CEC8]",
    iconColor: "text-[var(--danger)]",
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

const TYPE_ICONS: Record<VehicleType, typeof Truck> = {
  bike: Bike,
  scooter: Bike,
  car: Car,
  van: Truck,
  pickup: Truck,
  truck: Truck,
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function secondaryDetail(vehicle: Vehicle): {
  label: string;
  value: string;
  tone?: string;
} {
  switch (vehicle.status) {
    case "active":
      return { label: "Driver", value: vehicle.assignedDriverName || "Unassigned" };
    case "maintenance_required":
      return {
        label: "Service Due",
        value: vehicle.nextServiceAt
          ? formatDate(vehicle.nextServiceAt)
          : "Not scheduled",
        tone: "text-[var(--accent-hover)]",
      };
    case "inactive":
      return { label: "Status", value: "Retired" };
    default:
      return { label: "Status", value: "Ready" };
  }
}

const FILTERS: Array<{ id: VehicleStatus | "all"; label: string }> = [
  { id: "all", label: "All Vehicles" },
  { id: "available", label: "Available" },
  { id: "active", label: "Active" },
  { id: "maintenance_required", label: "Maintenance Required" },
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
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "remove" | "deactivate";
    vehicle: Vehicle;
  } | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
          (!driver.assignedVehicleId ||
            driver.assignedVehicleId === selected?.id ||
            driver.id === selected?.assignedDriverId),
      ),
    [drivers, selected],
  );

  const openCreate = () => {
    setForm({ ...EMPTY_FORM });
    setImageFile(null);
    setImagePreview(null);
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
    setImageFile(null);
    setImagePreview(vehicle.imageUrl);
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(isEditOpen ? selected?.imageUrl ?? null : null);
    }
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
    status: form.status === "active" ? undefined : form.status,
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
      let vehicleId: string;
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
        vehicleId = selected.id;
      } else {
        const created = await adminCreateVehicle(token, payload);
        vehicleId = created.id;
      }
      if (imageFile) {
        await adminUploadVehicleImage(token, vehicleId, imageFile);
      }
      setIsCreateOpen(false);
      setIsEditOpen(false);
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

  const openConfirm = (type: "remove" | "deactivate", vehicle: Vehicle) => {
    setConfirmError(null);
    setConfirmAction({ type, vehicle });
  };

  const runConfirm = async () => {
    if (!confirmAction) return;
    const { type, vehicle } = confirmAction;
    try {
      setSaving(true);
      setConfirmError(null);
      if (type === "remove") {
        await adminRemoveVehicle(token, vehicle.id);
      } else {
        await adminDeactivateVehicle(token, vehicle.id);
      }
      setConfirmAction(null);
      await loadData(true);
    } catch (err) {
      setConfirmError(
        err instanceof Error ? err.message : `Failed to ${type} vehicle`,
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
              suppressHydrationWarning
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search registration, make, branch..."
              className="form-input w-full pl-9 sm:w-72"
            />
          </div>
          <button
            type="button"
            suppressHydrationWarning
            onClick={openCreate}
            className="btn-primary flex items-center justify-center gap-1.5"
          >
            <Plus size={17} /> Add Vehicle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Total Vehicles
          </p>
          <p className="mt-2 text-3xl font-black text-[var(--text)]">
            {stats ? stats.total : "-"}
          </p>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-full rounded-full bg-[var(--teal)] transition-all"
              style={{
                width: `${
                  stats && stats.total > 0
                    ? Math.round(
                        ((stats.available + stats.active) / stats.total) * 100,
                      )
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Active Units
          </p>
          <p className="mt-2 text-3xl font-black text-[var(--text)]">
            {stats ? stats.active : "-"}
          </p>
          <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[var(--success)]">
            <TrendingUp size={14} /> In active service
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            In Maintenance
          </p>
          <p className="mt-2 text-3xl font-black text-[var(--accent-hover)]">
            {stats ? stats.maintenanceRequired : "-"}
          </p>
          <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[var(--danger)]">
            <AlertTriangle size={14} /> Needs attention
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Inactive
          </p>
          <p className="mt-2 text-3xl font-black text-[var(--text)]">
            {stats ? stats.inactive : "-"}
          </p>
          <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
            <Ban size={14} /> Out of service
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            suppressHydrationWarning
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
        <div className="flex items-center gap-2 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-black tracking-tight text-[var(--text)]">
          Asset Details
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
              >
                <div className="h-36 bg-[var(--surface-muted)]" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-1/2 rounded bg-[var(--surface-muted)]" />
                  <div className="h-3 w-2/3 rounded bg-[var(--surface-muted)]" />
                  <div className="h-9 w-full rounded bg-[var(--surface-muted)]" />
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center text-[var(--text-muted)]">
            No vehicles found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => {
              const cfg = CARD_STATUS[vehicle.status];
              const TypeIcon = TYPE_ICONS[vehicle.type];
              const detail = secondaryDetail(vehicle);
              const canAssign = !["maintenance_required", "inactive"].includes(
                vehicle.status,
              );
              const isAssignPrimary =
                vehicle.status === "available" || vehicle.status === "active";

              return (
                <div
                  key={vehicle.id}
                  className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
                >
                  <div
                    className={`relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br ${cfg.hero}`}
                  >
                    {vehicle.imageUrl ? (
                      <Image
                        src={vehicle.imageUrl}
                        alt={vehicle.registrationNumber}
                        fill
                        sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <TypeIcon
                        size={56}
                        strokeWidth={1.5}
                        className={`${cfg.iconColor} opacity-80`}
                      />
                    )}
                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold ${cfg.badge}`}
                    >
                      {cfg.label}
                    </span>
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-[var(--text)] backdrop-blur">
                      <Gauge size={13} />
                      {vehicle.odometerKm > 0
                        ? `${vehicle.odometerKm.toLocaleString()} km`
                        : "New"}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-base font-black text-[var(--text)]">
                          {vehicle.registrationNumber}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-[var(--text-muted)]">
                          {[vehicle.make, vehicle.model, vehicle.year]
                            .filter(Boolean)
                            .join(" ") || "Details not set"}
                        </p>
                      </div>

                      <div className="relative shrink-0">
                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={() =>
                            setMenuOpenId(
                              menuOpenId === vehicle.id ? null : vehicle.id,
                            )
                          }
                          className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                          aria-label="More actions"
                        >
                          <MoreVertical size={18} />
                        </button>
                        {menuOpenId === vehicle.id && (
                          <>
                            <button
                              type="button"
                              aria-hidden
                              tabIndex={-1}
                              className="fixed inset-0 z-10 cursor-default"
                              onClick={() => setMenuOpenId(null)}
                            />
                            <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-[var(--shadow-md)]">
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuOpenId(null);
                                  openEdit(vehicle);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-soft)]"
                              >
                                <Edit2 size={15} /> Edit Details
                              </button>
                              <button
                                type="button"
                                disabled={!canAssign}
                                onClick={() => {
                                  setMenuOpenId(null);
                                  openAssignment(vehicle);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-soft)] disabled:opacity-40 disabled:hover:bg-transparent"
                              >
                                <UserRoundCheck size={15} /> Assign Driver
                              </button>
                              {vehicle.status !== "inactive" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    openConfirm("deactivate", vehicle);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                                >
                                  <Ban size={15} /> Deactivate
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuOpenId(null);
                                  openConfirm("remove", vehicle);
                                }}
                                className="flex w-full items-center gap-2 border-t border-[var(--border)] px-3 py-2 text-left text-sm font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                              >
                                <Trash2 size={15} /> Remove Vehicle
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          Type
                        </p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-[var(--text)]">
                          {TYPE_LABELS[vehicle.type]}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          {detail.label}
                        </p>
                        <p
                          className={`mt-0.5 truncate text-sm font-semibold ${
                            detail.tone ?? "text-[var(--text)]"
                          }`}
                        >
                          {detail.value}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      {isAssignPrimary && (
                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={() => openAssignment(vehicle)}
                          className="flex-1 rounded-lg bg-[var(--info-soft)] px-3 py-2 text-sm font-bold text-[var(--info)] transition-colors hover:bg-[#d8e6fa]"
                        >
                          {vehicle.status === "available" ? "Assign Driver" : "Reassign"}
                        </button>
                      )}
                      <Link
                        href={`/admin/fleet/${vehicle.id}`}
                        className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-center text-sm font-bold text-[var(--text)] transition-colors hover:bg-[var(--surface-soft)]"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                suppressHydrationWarning
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-[var(--border)] p-2 disabled:opacity-35"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                suppressHydrationWarning
                disabled={page >= meta.totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-[var(--border)] p-2 disabled:opacity-35"
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
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
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
                  {driver.fullName} - {driver.licenseNumber}
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

      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={
          confirmAction?.type === "remove"
            ? "Remove Vehicle"
            : "Deactivate Vehicle"
        }
      >
        {confirmAction && (
          <div className="space-y-4">
            {confirmAction.vehicle.assignedDriverId ? (
              <div className="rounded-xl border border-[#F3E2BC] bg-[#FBF2DE] p-4 text-sm">
                <p className="flex items-center gap-2 font-bold text-[var(--accent-hover)]">
                  <AlertTriangle size={16} /> Action blocked
                </p>
                <p className="mt-2 text-[var(--text-soft)]">
                  <span className="font-bold text-[var(--text)]">
                    {confirmAction.vehicle.registrationNumber}
                  </span>{" "}
                  is currently assigned to{" "}
                  <span className="font-bold text-[var(--text)]">
                    {confirmAction.vehicle.assignedDriverName || "a driver"}
                  </span>
                  . Unassign the driver first before you can{" "}
                  {confirmAction.type === "remove" ? "remove" : "deactivate"} it.
                </p>
              </div>
            ) : confirmAction.type === "remove" ? (
              <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4 text-sm">
                <p className="font-bold text-[var(--danger)]">
                  This permanently deletes the vehicle.
                </p>
                <p className="mt-2 text-[var(--text-soft)]">
                  <span className="font-bold text-[var(--text)]">
                    {confirmAction.vehicle.registrationNumber}
                  </span>{" "}
                  will be permanently removed from the fleet. This action cannot be
                  undone.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-[#F3E2BC] bg-[#FBF2DE] p-4 text-sm">
                <p className="font-bold text-[var(--accent-hover)]">
                  This marks the vehicle as inactive.
                </p>
                <p className="mt-2 text-[var(--text-soft)]">
                  <span className="font-bold text-[var(--text)]">
                    {confirmAction.vehicle.registrationNumber}
                  </span>{" "}
                  will be taken out of service. Historical records are kept and it
                  can be reactivated later.
                </p>
              </div>
            )}

            {confirmError && <div className="form-error">{confirmError}</div>}

            <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !!confirmAction.vehicle.assignedDriverId}
                onClick={() => void runConfirm()}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 ${
                  confirmAction.type === "remove"
                    ? "bg-[var(--danger)]"
                    : "bg-[var(--accent-hover)]"
                }`}
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {confirmAction.type === "remove"
                  ? "Remove Vehicle"
                  : "Deactivate"}
              </button>
            </div>
          </div>
        )}
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
  imagePreview,
  onImageChange,
  onSubmit,
  onCancel,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  isEdit: boolean;
  error: string | null;
  saving: boolean;
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const set = (patch: Partial<typeof EMPTY_FORM>) =>
    setForm((current) => ({ ...current, ...patch }));

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="form-label">Vehicle Photo</label>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Vehicle preview"
                width={112}
                height={80}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <ImageIcon size={22} className="text-[var(--text-muted)]" />
            )}
          </div>
          <div className="min-w-0 space-y-1">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={(event) =>
                onImageChange(event.target.files?.[0] ?? null)
              }
              className="block w-full text-sm text-[var(--text-soft)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--surface-muted)] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[var(--text)] hover:file:bg-[var(--border)]"
            />
            <p className="text-xs text-[var(--text-muted)]">
              JPG, PNG or GIF, up to 5MB.
            </p>
          </div>
        </div>
      </div>

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <div>
        <label className="form-label">Operational Status</label>
        <select
          className="form-input capitalize"
          value={form.status}
          onChange={(event) =>
            set({ status: event.target.value as VehicleStatus })
          }
          disabled={form.status === "active"}
        >
          {(["available", "maintenance_required", "inactive"] as VehicleStatus[]).map(
            (status) => (
              <option key={status} value={status} className="capitalize">
                {status.replaceAll("_", " ")}
              </option>
            ),
          )}
          {form.status === "active" && (
            <option value="active">Active</option>
          )}
        </select>
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
