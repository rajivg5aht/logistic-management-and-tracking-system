"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Edit2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Ban,
  UserCheck,
  Truck,
  Phone,
  Mail,
  Users,
  Wrench,
  Package,
  Trash2,
} from "lucide-react";
import {
  adminGetDrivers,
  adminGetDriverStats,
  adminCreateDriver,
  adminUpdateDriver,
  adminDeleteDriver,
  EMPLOYMENT_STATUSES,
  type Driver,
  type DriverMeta,
  type AdminDriverStats,
  type AvailabilityStatus,
  type CreateDriverPayload,
  type UpdateDriverPayload,
} from "@/lib/api/driver.api";
import { adminGetVehicles } from "@/lib/api/fleet.api";
import Modal from "@/components/ui/Modal";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { getInitials, getPageNumbers } from "@/lib/ui-helpers";

const AVATAR_STYLES = [
  "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
  "bg-[var(--teal-tint)] text-[var(--teal)]",
  "bg-[rgba(108,99,255,0.12)] text-[#6C63FF]",
  "bg-[rgba(95,127,53,0.12)] text-[var(--success)]",
];

const AVAILABILITY_CONFIG: Record<AvailabilityStatus, { label: string; cls: string }> = {
  available: { label: "Available", cls: "bg-[#DEF3E6] text-[#1E9E4C]" },
  assigned: { label: "Assigned", cls: "bg-[#FBF1DC] text-[#C99A3D]" },
  "on-delivery": { label: "On Delivery", cls: "bg-[#FDECD8] text-[#C77718]" },
  "off-duty": { label: "Off Duty", cls: "bg-[#E9ECF1] text-[#5A6B82]" },
  inactive: { label: "Inactive", cls: "bg-[#FBE4E1] text-[#D0453A]" },
};

// Availability options for the "Status" filter dropdown.
const STATUS_OPTIONS: { value: AvailabilityStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "available", label: "Available" },
  { value: "assigned", label: "Assigned" },
  { value: "on-delivery", label: "On Delivery" },
  { value: "off-duty", label: "Off Duty" },
  { value: "inactive", label: "Inactive" },
];

// Denormalized vehicle detail keyed by driver id, for the assignment column.
type VehicleAssignmentInfo = {
  registrationNumber: string;
  type: string;
  make: string;
  model: string;
};

// A short, human-friendly driver code derived from the real record id.
function driverCode(id: string): string {
  return `LN-DR-${id.slice(-4).toUpperCase()}`;
}

const EMPTY_FORM = {
  fullName: "",
  email: "",
  password: "",
  phoneNumber: "",
  licenseNumber: "",
  branch: "",
  employmentStatus: "full-time" as (typeof EMPLOYMENT_STATUSES)[number],
  availabilityStatus: "available" as AvailabilityStatus,
  status: "active" as "active" | "inactive",
};



export default function AdminDriverManagement({ token }: { token: string }) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [meta, setMeta] = useState<DriverMeta | null>(null);
  const [stats, setStats] = useState<AdminDriverStats | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<AvailabilityStatus | "all">("all");
  const [vehicleFilter, setVehicleFilter] = useState<
    "any" | "assigned" | "unassigned"
  >("any");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Driver | null>(null);
  const [vehicleByDriver, setVehicleByDriver] = useState<
    Record<string, VehicleAssignmentInfo>
  >({});

  const [selected, setSelected] = useState<Driver | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchDrivers = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }
        const availability = filter === "all" ? "" : filter;
        const [res, fleet, driverStats] = await Promise.all([
          adminGetDrivers(token, page, limit, searchQuery, availability),
          adminGetVehicles(token, 1, 200),
          adminGetDriverStats(token),
        ]);
        const vehicleMap: Record<string, VehicleAssignmentInfo> = {};
        for (const vehicle of fleet.data) {
          if (vehicle.assignedDriverId) {
            vehicleMap[vehicle.assignedDriverId] = {
              registrationNumber: vehicle.registrationNumber,
              type: vehicle.type,
              make: vehicle.make,
              model: vehicle.model,
            };
          }
        }
        setDrivers(res.data);
        setMeta(res.meta);
        setStats(driverStats);
        setVehicleByDriver(vehicleMap);
      } catch (err: unknown) {
        if (!silent) {
          setError(
            err instanceof Error ? err.message : "Failed to load drivers.",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token, page, searchQuery, filter],
  );

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Reflect assignment / availability changes made elsewhere without a refresh.
  useAutoRefresh(() => fetchDrivers(true));

  const handleCreateOpen = () => {
    setForm({ ...EMPTY_FORM });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleEditOpen = (driver: Driver) => {
    setSelected(driver);
    setForm({
      fullName: driver.fullName,
      email: driver.email,
      password: "",
      phoneNumber: driver.phoneNumber,
      licenseNumber: driver.licenseNumber || "",
      branch: driver.branch || "",
      employmentStatus: driver.employmentStatus || "full-time",
      availabilityStatus: driver.availabilityStatus || "available",
      status: driver.status || "active",
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (
      !form.fullName ||
      !form.email ||
      !form.password ||
      !form.phoneNumber ||
      !form.licenseNumber
    ) {
      setFormError("Name, email, phone, license and password are required.");
      return;
    }
    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setActionLoading(true);
      const payload: CreateDriverPayload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        licenseNumber: form.licenseNumber,
        branch: form.branch,
        employmentStatus: form.employmentStatus,
        availabilityStatus: form.availabilityStatus,
      };
      await adminCreateDriver(token, payload);
      setIsCreateOpen(false);
      fetchDrivers();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create driver.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setFormError(null);

    if (!form.fullName || !form.email) {
      setFormError("Name and email are required.");
      return;
    }

    try {
      setActionLoading(true);
      const payload: UpdateDriverPayload = {
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        licenseNumber: form.licenseNumber,
        branch: form.branch,
        employmentStatus: form.employmentStatus,
        availabilityStatus: form.availabilityStatus,
        status: form.status,
      };
      if (form.password) {
        if (form.password.length < 6) {
          setFormError("Password must be at least 6 characters long.");
          setActionLoading(false);
          return;
        }
        payload.password = form.password;
      }
      await adminUpdateDriver(token, selected.id, payload);
      setIsEditOpen(false);
      fetchDrivers();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to update driver.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (driver: Driver) => {
    const nextStatus = driver.status === "inactive" ? "active" : "inactive";
    try {
      setActionLoading(true);
      setError(null);
      await adminUpdateDriver(token, driver.id, {
        status: nextStatus,
        // Reflect deactivation in availability too.
        availabilityStatus: nextStatus === "inactive" ? "inactive" : "available",
      });
      fetchDrivers();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update driver status.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      setError(null);
      await adminDeleteDriver(token, deleteTarget.id);
      setDeleteTarget(null);
      fetchDrivers();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to delete driver.",
      );
      setDeleteTarget(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (meta && newPage >= 1 && newPage <= meta.totalPages) {
      setPage(newPage);
    }
  };

  // Client-side "has a vehicle?" filter, applied to the current page.
  const visibleDrivers = drivers.filter((driver) => {
    if (vehicleFilter === "assigned") return !!vehicleByDriver[driver.id];
    if (vehicleFilter === "unassigned") return !vehicleByDriver[driver.id];
    return true;
  });

  const onDeliveryPct =
    stats && stats.total > 0
      ? Math.round((stats.onDelivery / stats.total) * 100)
      : 0;

  const rangeStart = meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const rangeEnd = meta ? (meta.page - 1) * meta.limit + visibleDrivers.length : 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--teal)]">
            Driver Management
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
            Add and manage company drivers. Drivers are internal staff â€” created here, not via public signup.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateOpen}
          className="btn-primary flex items-center gap-1.5 self-start cursor-pointer"
          suppressHydrationWarning
        >
          <Plus size={18} />
          Add Driver
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total drivers */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Total Drivers
            </p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--teal)]">
              <Users size={16} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-[var(--text)]">
            {stats ? stats.total.toLocaleString() : "â€”"}
          </p>
          <p className="mt-3 text-xs font-semibold text-[var(--text-muted)]">
            Company drivers
          </p>
        </div>

        {/* On delivery */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              On Delivery
            </p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DEF3E6] text-[#1E9E4C]">
              <Truck size={16} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-[var(--text)]">
            {stats ? stats.onDelivery.toLocaleString() : "â€”"}
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-full rounded-full bg-[#1E9E4C] transition-all"
              style={{ width: `${onDeliveryPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs font-semibold text-[var(--text-muted)]">
            {onDeliveryPct}% of drivers currently active
          </p>
        </div>

        {/* Off duty / inactive */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Off Duty / Inactive
            </p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FBE4E1] text-[#D0453A]">
              <Wrench size={16} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-[var(--text)]">
            {stats ? (stats.offDuty + stats.inactive).toLocaleString() : "â€”"}
          </p>
          <p className="mt-3 text-xs font-semibold text-[var(--text-muted)]">
            Currently unavailable
          </p>
        </div>

        {/* Available */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-start justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Available
            </p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DEF3E6] text-[#1E9E4C]">
              <UserCheck size={16} />
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-[var(--text)]">
            {stats ? stats.available.toLocaleString() : "â€”"}
          </p>
          <p className="mt-3 text-xs font-semibold text-[var(--text-muted)]">
            Ready to assign
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#F3C6BF] bg-[#FBE4E1] px-4 py-3 text-sm font-semibold text-[#D0453A]">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {/* Toolbar: search + filters */}
        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[var(--text-muted)]">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Filter by name, ID or vehicleâ€¦"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="form-input w-full rounded-full pl-11"
              suppressHydrationWarning
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as AvailabilityStatus | "all");
                setPage(1);
              }}
              className="form-input h-10 w-auto rounded-lg text-sm"
              suppressHydrationWarning
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  Status: {option.label}
                </option>
              ))}
            </select>
            <select
              value={vehicleFilter}
              onChange={(e) =>
                setVehicleFilter(
                  e.target.value as "any" | "assigned" | "unassigned",
                )
              }
              className="form-input h-10 w-auto rounded-lg text-sm"
              suppressHydrationWarning
            >
              <option value="any">Vehicle: Any</option>
              <option value="assigned">Vehicle: Assigned</option>
              <option value="unassigned">Vehicle: Unassigned</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[60rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
                {["Driver Profile", "Status", "Vehicle Assignment", "Deliveries", "Contact", "Actions"].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] ${
                      h === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-[var(--border-light)]">
                    {Array.from({ length: 6 }).map((__, c) => (
                      <td key={c} className="px-5 py-4">
                        <div className="h-4 max-w-28 rounded bg-[var(--border)]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visibleDrivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm font-medium text-[var(--text-muted)]">
                    No drivers found. Click â€œAdd Driverâ€ to create one.
                  </td>
                </tr>
              ) : (
                visibleDrivers.map((driver, index) => {
                  const availability =
                    AVAILABILITY_CONFIG[driver.availabilityStatus] ??
                    AVAILABILITY_CONFIG.available;
                  const vehicle = vehicleByDriver[driver.id];
                  return (
                    <tr
                      key={driver.id}
                      className="border-b border-[var(--border-light)] last:border-b-0 transition-colors hover:bg-[var(--surface-soft)]"
                    >
                      {/* Driver profile */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${AVATAR_STYLES[index % AVATAR_STYLES.length]}`}
                          >
                            {getInitials(driver.fullName)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--text)]">{driver.fullName}</p>
                            <p className="truncate text-xs text-[var(--text-muted)]">
                              ID: {driverCode(driver.id)}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Status (availability) */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${availability.cls}`}>
                          {availability.label}
                        </span>
                      </td>
                      {/* Vehicle assignment */}
                      <td className="px-5 py-4">
                        {vehicle ? (
                          <div className="min-w-0">
                            <p className="font-semibold text-[var(--text)]">
                              <span className="capitalize">{vehicle.type}</span>: {vehicle.registrationNumber}
                            </p>
                            <p className="truncate text-xs text-[var(--text-muted)]">
                              {[vehicle.make, vehicle.model].filter(Boolean).join(" ") || "â€”"}
                            </p>
                          </div>
                        ) : (
                          <span className="italic text-[var(--text-muted)]">Unassigned</span>
                        )}
                      </td>
                      {/* Deliveries */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text)]">
                          <Package size={14} className="text-[var(--text-muted)]" />
                          {(driver.deliveriesCount ?? 0).toLocaleString()}
                        </span>
                      </td>
                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <a
                            href={`tel:${driver.phoneNumber}`}
                            className="flex items-center gap-1.5 text-[var(--text-soft)] hover:text-[var(--teal)]"
                          >
                            <Phone size={13} className="text-[var(--text-muted)]" />
                            {driver.phoneNumber || "â€”"}
                          </a>
                          <a
                            href={`mailto:${driver.email}`}
                            className="flex items-center gap-1.5 truncate text-xs text-[var(--text-muted)] hover:text-[var(--teal)]"
                          >
                            <Mail size={13} />
                            {driver.email}
                          </a>
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditOpen(driver)}
                            className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--teal)] cursor-pointer"
                            aria-label="Edit driver"
                            suppressHydrationWarning
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(driver)}
                            className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--accent-strong)] cursor-pointer"
                            aria-label={driver.status === "inactive" ? "Unblock driver" : "Block driver"}
                            title={driver.status === "inactive" ? "Unblock (allow sign-in)" : "Block (prevent sign-in)"}
                            suppressHydrationWarning
                          >
                            {driver.status === "inactive" ? <UserCheck size={16} /> : <Ban size={16} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(driver)}
                            className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[#FBE4E1] hover:text-[#D0453A] cursor-pointer"
                            aria-label="Delete driver"
                            title="Delete driver permanently"
                            suppressHydrationWarning
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-4 sm:flex-row">
            <p className="text-xs font-medium text-[var(--text-muted)]">
              Showing {rangeStart} to {rangeEnd} of {meta.total.toLocaleString()} entries
            </p>
            {meta.totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {getPageNumbers(page, meta.totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="px-2 text-[var(--text-muted)]">â€¦</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-bold transition-colors cursor-pointer ${
                      p === page
                        ? "bg-[var(--teal)] text-white"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= meta.totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        isOpen={isCreateOpen || isEditOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setIsEditOpen(false);
        }}
        title={isEditOpen ? "Edit Driver" : "Add Driver"}
      >
        <DriverForm
          form={form}
          setForm={setForm}
          isEdit={isEditOpen}
          formError={formError}
          actionLoading={actionLoading}
          onSubmit={isEditOpen ? handleEditSubmit : handleCreateSubmit}
          onCancel={() => {
            setIsCreateOpen(false);
            setIsEditOpen(false);
          }}
        />
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => !actionLoading && setDeleteTarget(null)}
        title="Delete Driver"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-[#F3C6BF] bg-[#FBE4E1] px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#D0453A]" />
            <p className="text-sm font-medium text-[#D0453A]">
              This permanently deletes{" "}
              <span className="font-bold">{deleteTarget?.fullName}</span> and their
              account. This action cannot be undone.
            </p>
          </div>
          <p className="text-sm text-[var(--text-soft)]">
            To temporarily bar sign-in instead, use the block action to keep the
            record.
          </p>
          <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={actionLoading}
              className="btn-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-lg bg-[#D0453A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#b93b31] disabled:opacity-60 cursor-pointer"
            >
              {actionLoading && <Loader2 size={15} className="animate-spin" />}
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

/* â”€â”€ Shared create/edit form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function DriverForm({
  form,
  setForm,
  isEdit,
  formError,
  actionLoading,
  onSubmit,
  onCancel,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  isEdit: boolean;
  formError: string | null;
  actionLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const set = (patch: Partial<typeof EMPTY_FORM>) => setForm((prev) => ({ ...prev, ...patch }));

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="form-label">Full Name *</label>
          <input
            className="form-input"
            value={form.fullName}
            onChange={(e) => set({ fullName: e.target.value })}
            placeholder="e.g. Ram Bahadur"
            suppressHydrationWarning
          />
        </div>
        <div className="space-y-1.5">
          <label className="form-label">Phone Number *</label>
          <input
            className="form-input"
            value={form.phoneNumber}
            onChange={(e) => set({ phoneNumber: e.target.value })}
            placeholder="98XXXXXXXX"
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="form-label">Email *</label>
        <input
          type="email"
          className="form-input"
          value={form.email}
          onChange={(e) => set({ email: e.target.value })}
          placeholder="driver@cargonep.com"
          suppressHydrationWarning
        />
      </div>

      <div className="space-y-1.5">
        <label className="form-label">
          {isEdit ? "New Password (leave blank to keep)" : "Password *"}
        </label>
        <input
          type="password"
          className="form-input"
          value={form.password}
          onChange={(e) => set({ password: e.target.value })}
          placeholder="Minimum 6 characters"
          suppressHydrationWarning
        />
      </div>

      <div className="space-y-1.5">
        <label className="form-label">License Number</label>
        <input
          className="form-input"
          value={form.licenseNumber}
          onChange={(e) => set({ licenseNumber: e.target.value })}
          placeholder="e.g. 03-06-00123456"
          suppressHydrationWarning
        />
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-soft)]">
        Assign vehicles from Fleet Management after saving the driver.
      </div>

      <div className="space-y-1.5">
        <label className="form-label">Employment</label>
        <select
          className="form-input capitalize"
          value={form.employmentStatus}
          onChange={(e) => set({ employmentStatus: e.target.value as typeof form.employmentStatus })}
          suppressHydrationWarning
        >
          {EMPLOYMENT_STATUSES.map((v) => (
            <option key={v} value={v} className="capitalize">
              {v}
            </option>
          ))}
        </select>
      </div>

      {isEdit && (
        <div className="space-y-1.5">
          <label className="form-label">Account Status</label>
          <select
            className="form-input"
            value={form.status}
            onChange={(e) => set({ status: e.target.value as "active" | "inactive" })}
            suppressHydrationWarning
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}

      {formError && (
        <p className="flex items-center gap-2 text-sm font-semibold text-[#D0453A]">
          <AlertCircle size={15} /> {formError}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary cursor-pointer">
          Cancel
        </button>
        <button type="submit" disabled={actionLoading} className="btn-primary flex items-center gap-1.5 cursor-pointer">
          {actionLoading && <Loader2 size={15} className="animate-spin" />}
          {isEdit ? "Save Changes" : "Create Driver"}
        </button>
      </div>
    </form>
  );
}
