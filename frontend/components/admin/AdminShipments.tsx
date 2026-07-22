"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Search,
  RefreshCw,
  ClipboardList,
  Truck,
  CircleCheckBig,
  XCircle,
  Download,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Camera,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  MapPin,
  Phone,
  Package,
  Boxes,
  Weight,
  Ruler,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Clock,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  adminGetShipments,
  adminGetShipmentStats,
  adminUpdateShipment,
  adminDeleteShipment,
  getShipmentDisplayStatus,
  DRIVER_STAGE_LABELS,
  type Shipment,
  type ShipmentMeta,
  type ShipmentStats,
  type ShipmentStatus,
  type DriverStage,
  type AdminUpdateShipmentPayload,
} from "@/lib/api/shipment.api";
import { adminGetDrivers, type Driver } from "@/lib/api/driver.api";
import Modal from "@/components/ui/Modal";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { getInitials, getPageNumbers } from "@/lib/ui-helpers";
import { useShipmentLiveLocation } from "@/lib/hooks/useShipmentLiveLocation";
import LiveMap from "@/components/tracking/LiveMap";
import { getDistrictCoords } from "@/lib/nepalGeo";

const NAVY = "var(--accent-strong)";
const NAVY_BTN = "var(--accent)";

interface AdminShipmentsProps {
  token: string;
}

const TABS: { label: string; status?: ShipmentStatus }[] = [
  { label: "All Shipments", status: undefined },
  { label: "Pending", status: "pending" },
  { label: "In Transit", status: "in-transit" },
  { label: "Delivered", status: "delivered" },
  { label: "Cancelled", status: "cancelled" },
];

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  pending: "bg-[var(--warning-soft)] text-[var(--warning)]",
  "in-transit": "bg-[var(--info-soft)] text-[var(--info)]",
  delivered: "bg-[var(--success-soft)] text-[var(--success)]",
  cancelled: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

type AdminDeliveryStage = Extract<
  DriverStage,
  "picked-up" | "in-transit" | "out-for-delivery" | "delivered"
>;

const ADMIN_DELIVERY_STAGE_OPTIONS: {
  value: AdminDeliveryStage;
  label: string;
}[] = [
  { value: "picked-up", label: "Picked Up" },
  { value: "in-transit", label: "In Transit" },
  { value: "out-for-delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
];

function editableDeliveryStage(
  shipment: Shipment,
): AdminDeliveryStage | "" {
  if (
    shipment.driverStage === "picked-up" ||
    shipment.driverStage === "in-transit" ||
    shipment.driverStage === "out-for-delivery" ||
    shipment.driverStage === "delivered"
  ) {
    return shipment.driverStage;
  }
  return shipment.status === "delivered" ? "delivered" : "";
}

const PAYMENT_STYLES: Record<string, string> = {
  cod: "bg-[var(--inactive-soft)] text-[var(--inactive)]",
  prepaid: "bg-[var(--success-soft)] text-[var(--success)]",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function locLine(city?: string, district?: string): string {
  return [city, district].filter(Boolean).join(", ") || "-";
}

export default function AdminShipments({ token }: AdminShipmentsProps) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [meta, setMeta] = useState<ShipmentMeta | null>(null);
  const [stats, setStats] = useState<ShipmentStats | null>(null);

  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [detail, setDetail] = useState<Shipment | null>(null);
  const [selected, setSelected] = useState<Shipment | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [form, setForm] = useState<{
    driverStage: AdminDeliveryStage | "";
    assignedDriverId: string;
  }>({ driverStage: "", assignedDriverId: "" });

  const limit = 10;

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchData = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }
        const status = TABS[activeTab].status;
        const [list, statResult] = await Promise.all([
          adminGetShipments(token, page, limit, searchQuery, status),
          adminGetShipmentStats(token),
        ]);
        setShipments(list.data);
        setMeta(list.meta);
        setStats(statResult);
      } catch (err) {
        if (!silent) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load shipments. Please check your connection.",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token, page, searchQuery, activeTab],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useAutoRefresh(() => fetchData(true), { intervalMs: 10_000 });

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await adminGetDrivers(token, 1, 200);
      setDrivers(res.data);
    } catch {
    }
  }, [token]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleTabChange = (idx: number) => {
    setActiveTab(idx);
    setPage(1);
  };

  const handleEditOpen = (s: Shipment) => {
    setSelected(s);
    setForm({
      driverStage: editableDeliveryStage(s),
      assignedDriverId: s.assignedDriverId ?? "",
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleDeleteOpen = (s: Shipment) => {
    setSelected(s);
    setFormError(null);
    setIsDeleteOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      setActionLoading(true);
      setFormError(null);
      if (form.driverStage && !form.assignedDriverId) {
        setFormError("Assign a driver before setting a delivery status.");
        return;
      }
      const payload: AdminUpdateShipmentPayload = {
        assignedDriverId: form.assignedDriverId || null,
      };
      if (form.driverStage) payload.driverStage = form.driverStage;
      await adminUpdateShipment(token, selected.id, payload);
      setIsEditOpen(false);
      fetchData(true);
      fetchDrivers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update shipment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selected) return;
    try {
      setActionLoading(true);
      setFormError(null);
      await adminDeleteShipment(token, selected.id);
      setIsDeleteOpen(false);
      if (shipments.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchData(true);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete shipment.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = () => {
    const header = [
      "Tracking ID",
      "Sender",
      "Sender Location",
      "Recipient",
      "Recipient Location",
      "Payment",
      "Amount",
      "Status",
      "Driver",
      "Created",
    ];
    const rows = shipments.map((s) => [
      s.trackingId,
      s.pickup.fullName ?? "",
      locLine(s.pickup.city, s.pickup.district),
      s.delivery.recipientName ?? "",
      locLine(s.delivery.city, s.delivery.district),
      s.paymentMethod === "cod" ? "COD" : "PREPAID",
      s.amount,
      getShipmentDisplayStatus(s),
      s.assignedDriver ?? "Unassigned",
      new Date(s.createdAt).toISOString(),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shipments-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { label: "Pending Orders", value: stats?.pending, sub: "Awaiting dispatch", Icon: ClipboardList, tint: "bg-[var(--info-soft)] text-[var(--info)]" },
    { label: "In Transit", value: stats?.inTransit, sub: "On the way", Icon: Truck, tint: "bg-[var(--gold-tint)] text-[var(--accent-hover)]" },
    { label: "Delivered", value: stats?.delivered, sub: "Completed", Icon: CircleCheckBig, tint: "bg-[var(--success-soft)] text-[var(--success)]" },
    { label: "Failed / Cancelled", value: stats?.cancelled, sub: "Needs attention", Icon: XCircle, tint: "bg-[var(--danger-soft)] text-[var(--danger)]" },
  ];

  const rangeStart = meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const rangeEnd = meta ? (meta.page - 1) * meta.limit + shipments.length : 0;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color: NAVY }}>
            Shipment Management
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--text-soft)]">
            Manage and monitor logistics flow across all provinces.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.Icon;
          return (
            <div
              key={card.label}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.tint}`}>
                  <Icon size={19} className="stroke-[2.4]" />
                </div>
                <span className="text-xs font-semibold text-[var(--text-muted)]">{card.sub}</span>
              </div>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-[var(--inactive)]">
                {card.label}
              </p>
              <h3 className="mt-0.5 text-2xl font-black tracking-tight" style={{ color: NAVY }}>
                {card.value === undefined ? "-" : card.value.toLocaleString()}
              </h3>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((tab, idx) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => handleTabChange(idx)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
                  activeTab === idx
                    ? "text-[var(--text-on-accent)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                }`}
                style={activeTab === idx ? { backgroundColor: NAVY_BTN } : undefined}
                suppressHydrationWarning
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search tracking, sender, driver..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm outline-none transition-all focus:border-[var(--accent)] sm:w-64"
                suppressHydrationWarning
              />
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={shipments.length === 0}
              className="btn-secondary btn-sm cursor-pointer disabled:opacity-50"
              suppressHydrationWarning
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </div>

        {error ? (
          <div className="border-t border-[var(--border)] p-10 text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--danger-soft)] text-[var(--danger)]">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-semibold text-[var(--text)]">{error}</p>
            <button
              type="button"
              onClick={() => fetchData()}
              className="btn-secondary btn-sm mt-4 inline-flex items-center gap-2 cursor-pointer"
              suppressHydrationWarning
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-[var(--border)]">
            <table className="w-full min-w-[64rem] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[var(--surface-soft)]">
                  {["Tracking ID", "Sender", "Recipient", "Payment", "Amount", "Status", "Driver", "Actions"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] ${
                          i === 7 ? "text-right" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse border-t border-[var(--border-light)]">
                      {Array.from({ length: 8 }).map((__, c) => (
                        <td key={c} className="px-5 py-4">
                          <div className="h-4 w-full max-w-[120px] rounded bg-[var(--border)]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : shipments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center font-medium text-[var(--text-muted)]">
                      No shipments found. Customer orders will appear here once placed.
                    </td>
                  </tr>
                ) : (
                  shipments.map((s) => {
                    const isCod = s.paymentMethod === "cod";
                    return (
                      <tr
                        key={s.id}
                        onClick={() => setDetail(s)}
                        className="cursor-pointer border-t border-[var(--border-light)] transition-colors hover:bg-[var(--surface-soft)]"
                      >
                        <td className="px-5 py-4">
                          <div className="font-bold" style={{ color: NAVY }}>
                            #{s.trackingId}
                          </div>
                          <div className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                            Created {timeAgo(s.createdAt)}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-[var(--text)]">{s.pickup.fullName || "-"}</div>
                          <div className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                            {locLine(s.pickup.city, s.pickup.district)}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-[var(--text)]">
                            {s.delivery.recipientName || "-"}
                          </div>
                          <div className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                            {locLine(s.delivery.city, s.delivery.district)}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                              PAYMENT_STYLES[isCod ? "cod" : "prepaid"]
                            }`}
                          >
                            {isCod ? "COD" : "PREPAID"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="font-bold"
                            style={{ color: s.status === "cancelled" ? "var(--danger)" : "var(--text)" }}
                          >
                            NPR {s.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[s.status]}`}
                          >
                            {getShipmentDisplayStatus(s)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {s.assignedDriver ? (
                            <span className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--info-soft)] text-[10px] font-bold text-[var(--info)]">
                                {getInitials(s.assignedDriver)}
                              </span>
                              <span className="font-semibold text-[var(--text)]">{s.assignedDriver}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-[var(--text-muted)]">
                              <span className="h-7 w-7 rounded-full bg-[var(--surface-muted)]" />
                              <span className="font-medium italic">Unassigned</span>
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetail(s);
                              }}
                              className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--accent-strong)] cursor-pointer"
                              title="View details"
                              suppressHydrationWarning
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditOpen(s);
                              }}
                              className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--accent-strong)] cursor-pointer"
                              title="Update shipment"
                              suppressHydrationWarning
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOpen(s);
                              }}
                              className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] cursor-pointer"
                              title="Delete shipment"
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
        )}

        {meta && !error && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] p-4 sm:flex-row sm:px-5">
            <p className="text-sm text-[var(--text-muted)]">
              {meta.total > 0 ? (
                <>
                  Showing <span className="font-bold text-[var(--text)]">{rangeStart}</span> to{" "}
                  <span className="font-bold text-[var(--text)]">{rangeEnd}</span> of{" "}
                  <span className="font-bold text-[var(--text)]">{meta.total.toLocaleString()}</span> entries
                </>
              ) : (
                "No entries to show"
              )}
            </p>

            {meta.totalPages > 1 && (
              <nav className="inline-flex items-center gap-1.5" aria-label="Pagination">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  aria-label="Previous page"
                  suppressHydrationWarning
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageNumbers(page, meta.totalPages).map((p, i) =>
                  p === "..." ? (
                    <span key={`e${i}`} className="px-1 text-sm font-semibold text-[var(--text-muted)]">...</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-bold transition-all cursor-pointer ${
                        page === p
                          ? "border-transparent text-[var(--text-on-accent)]"
                          : "border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
                      }`}
                      style={page === p ? { backgroundColor: NAVY_BTN } : undefined}
                      suppressHydrationWarning
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  aria-label="Next page"
                  suppressHydrationWarning
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Shipment">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && <div className="form-error">{formError}</div>}

          {selected && (
            <div className="rounded-lg bg-[var(--surface-soft)] px-4 py-3 text-sm">
              <span className="font-bold" style={{ color: NAVY }}>#{selected.trackingId}</span>
              <span className="text-[var(--text-muted)]">
                {" "}
                - {selected.pickup.fullName} to {selected.delivery.recipientName}
              </span>
            </div>
          )}

          <div>
            <label className="form-label" htmlFor="ship-status">Delivery Status</label>
            <select
              id="ship-status"
              value={form.driverStage}
              onChange={(e) =>
                setForm({
                  ...form,
                  driverStage: e.target.value as AdminDeliveryStage | "",
                })
              }
              className="form-input"
            >
              <option value="">Assigned - awaiting pickup</option>
              {ADMIN_DELIVERY_STAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Leave as &ldquo;Awaiting pickup&rdquo; - drivers update this as they
              progress. Change it only to manually override.
            </p>
          </div>

          <div>
            <label className="form-label" htmlFor="ship-driver">Assigned Driver</label>
            <select
              id="ship-driver"
              value={form.assignedDriverId}
              onChange={(e) => setForm({ ...form, assignedDriverId: e.target.value })}
              className="form-input"
              suppressHydrationWarning
            >
              <option value="">Unassigned</option>
              {drivers.map((d) => (
                <option
                  key={d.id}
                  value={d.id}
                  disabled={
                    d.status === "inactive" ||
                    (d.availabilityStatus !== "available" &&
                      d.id !== form.assignedDriverId)
                  }
                >
                  {d.fullName}
                  {d.assignedVehicleId ? " - vehicle assigned" : ""}
                  {d.availabilityStatus && d.availabilityStatus !== "available"
                    ? ` (${d.availabilityStatus.replace("-", " ")})`
                    : ""}
                </option>
              ))}
            </select>
            {drivers.length === 0 && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                No drivers yet - add them in Driver Management.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="btn-secondary btn-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {actionLoading && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Shipment">
        <div className="space-y-4">
          {formError && <div className="form-error">{formError}</div>}

          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--danger-soft)] text-[var(--danger)]">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">
                Are you sure you want to delete this shipment?
              </p>
              <p className="mt-1 text-sm text-[var(--text-soft)]">
                This action cannot be undone. Shipment{" "}
                <span className="font-bold text-[var(--text)]">#{selected?.trackingId}</span> will be
                permanently removed.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-3">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="btn-secondary btn-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteSubmit}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--danger)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--danger)] cursor-pointer disabled:opacity-50"
            >
              {actionLoading && <Loader2 size={16} className="animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <ShipmentDetailDrawer
        token={token}
        shipment={detail}
        onClose={() => setDetail(null)}
        onEdit={(s) => {
          setDetail(null);
          handleEditOpen(s);
        }}
      />
    </div>
  );
}

const SERVICE_LABELS: Record<string, string> = {
  standard: "Standard",
  express: "Express",
  overnight: "Overnight",
};

const PARCEL_LABELS: Record<string, string> = {
  standard: "Standard",
  fragile: "Fragile",
  pallet: "Pallet",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  esewa: "eSewa",
  khalti: "Khalti",
};

function fmtDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function addressLine(a: Shipment["pickup"]): string {
  return (
    [a.streetAddress, a.city, a.district].filter(Boolean).join(", ") || "-"
  );
}

function dimsLabel(d: Shipment["package"]["dimensions"]): string {
  return d.length && d.width && d.height
    ? `${d.length} x ${d.width} x ${d.height} cm`
    : "-";
}

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        <span className="text-[var(--accent-strong)]">{icon}</span>
        {title}
      </h3>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        {children}
      </div>
    </section>
  );
}

function DetailTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
      <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-1 break-words font-bold text-[var(--text)]">{value}</p>
    </div>
  );
}

function ShipmentDetailDrawer({
  token,
  shipment,
  onClose,
  onEdit,
}: {
  token: string;
  shipment: Shipment | null;
  onClose: () => void;
  onEdit: (s: Shipment) => void;
}) {
  useEffect(() => {
    if (!shipment) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [shipment, onClose]);

  const { location: liveLocation } = useShipmentLiveLocation(
    token,
    shipment?.id,
    Boolean(shipment?.assignedDriverId && shipment.status !== "cancelled"),
  );

  return (
    <AnimatePresence>
      {shipment && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[var(--surface)] shadow-2xl"
          >
            <div
              className="relative shrink-0 px-6 pb-5 pt-6 text-white"
              style={{
                background: `linear-gradient(135deg, ${NAVY} 0%, var(--surface-dark-2) 100%)`,
              }}
            >
              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white cursor-pointer"
                aria-label="Close details"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/70">
                <Package size={14} /> Shipment Details
              </div>
              <h2 className="mt-2 text-2xl font-black">#{shipment.trackingId}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
                  {getShipmentDisplayStatus(shipment)}
                </span>
                <span className="text-xs text-white/70">
                  Created {fmtDateTime(shipment.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <DetailSection icon={<MapPin size={14} />} title="Route">
                <div className="relative pl-6">
                  <span className="absolute bottom-3 left-[6px] top-3 w-px bg-[var(--border)]" />
                  <div className="relative pb-5">
                    <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-[var(--accent)] ring-4 ring-[var(--accent)]/15" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Pickup - Sender
                    </p>
                    <p className="mt-0.5 font-bold text-[var(--text)]">
                      {shipment.pickup.fullName || "-"}
                    </p>
                    <p className="text-sm text-[var(--text-soft)]">
                      {addressLine(shipment.pickup)}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <Phone size={12} /> {shipment.pickup.phoneNumber || "-"}
                    </p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-[var(--accent-hover)] ring-4 ring-[var(--accent-hover)]/15" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Delivery - Recipient
                    </p>
                    <p className="mt-0.5 font-bold text-[var(--text)]">
                      {shipment.delivery.recipientName || "-"}
                    </p>
                    <p className="text-sm text-[var(--text-soft)]">
                      {addressLine(shipment.delivery)}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <Phone size={12} /> {shipment.delivery.phoneNumber || "-"}
                    </p>
                  </div>
                </div>
              </DetailSection>

              <DetailSection icon={<Package size={14} />} title="Parcel Information">
                <div className="grid grid-cols-2 gap-3">
                  <DetailTile
                    icon={<Boxes size={13} />}
                    label="Type"
                    value={PARCEL_LABELS[shipment.package.parcelType] ?? shipment.package.parcelType}
                  />
                  <DetailTile
                    icon={<Weight size={13} />}
                    label="Weight"
                    value={shipment.package.weight ? `${shipment.package.weight} kg` : "-"}
                  />
                  <DetailTile
                    icon={<Boxes size={13} />}
                    label="Quantity"
                    value={shipment.package.quantity}
                  />
                  <DetailTile
                    icon={<Ruler size={13} />}
                    label="Dimensions"
                    value={dimsLabel(shipment.package.dimensions)}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--info-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--info)]">
                    <Truck size={12} /> {SERVICE_LABELS[shipment.service] ?? shipment.service}
                  </span>
                  {shipment.insurance && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--success-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--success)]">
                      <ShieldCheck size={12} /> Insured
                    </span>
                  )}
                  {shipment.specialHandling && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--gold-tint)] px-2.5 py-1 text-[11px] font-bold text-[var(--accent-hover)]">
                      <Sparkles size={12} /> Special handling
                    </span>
                  )}
                </div>
              </DetailSection>

              <DetailSection icon={<CreditCard size={14} />} title="Payment">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Amount
                    </p>
                    <p className="text-2xl font-black" style={{ color: NAVY }}>
                      NPR {shipment.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        PAYMENT_STYLES[shipment.paymentMethod === "cod" ? "cod" : "prepaid"]
                      }`}
                    >
                      {PAYMENT_METHOD_LABELS[shipment.paymentMethod] ?? shipment.paymentMethod}
                    </span>
                  </div>
                </div>
              </DetailSection>

              <DetailSection icon={<Truck size={14} />} title="Assignment">
                {shipment.assignedDriver ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--info-soft)] text-[11px] font-bold text-[var(--info)]">
                        {getInitials(shipment.assignedDriver)}
                      </span>
                      <div>
                        <p className="font-bold text-[var(--text)]">
                          {shipment.assignedDriver}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {shipment.assignedVehicle
                            ? `Vehicle - ${shipment.assignedVehicle}`
                            : "No vehicle linked"}
                        </p>
                      </div>
                    </div>
                    {shipment.driverStage && (
                      <span className="inline-flex rounded-full bg-[var(--info-soft)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--info)]">
                        {DRIVER_STAGE_LABELS[shipment.driverStage] ?? shipment.driverStage}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="flex items-center gap-2 text-sm italic text-[var(--text-muted)]">
                    <User size={15} /> No driver assigned yet.
                  </p>
                )}
              </DetailSection>

              {shipment.assignedDriverId && (
                <DetailSection icon={<MapPin size={14} />} title="Live Location">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-muted)]">
                      {liveLocation
                        ? "Driver is sharing live location"
                        : "Driver location not available"}
                    </span>
                    {liveLocation && (
                      <span
                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold text-white"
                        style={{ backgroundColor: "#E9C46A" }}
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                        </span>
                        Live
                      </span>
                    )}
                  </div>
                  <LiveMap
                    location={liveLocation}
                    delivery={getDistrictCoords(shipment.delivery.district ?? "")}
                    height={220}
                    accent="#E9C46A"
                    waitingLabel="Waiting for driver location..."
                  />
                </DetailSection>
              )}

              <DetailSection icon={<Camera size={14} />} title="Proof of Delivery">
                {shipment.proofOfDelivery ? (
                  <div className="space-y-3">
                    {shipment.proofOfDelivery.photoUrl && (
                      <Image
                        src={shipment.proofOfDelivery.photoUrl}
                        alt="Proof of delivery"
                        width={1200}
                        height={600}
                        className="h-44 w-full rounded-xl border border-[var(--border)] object-cover"
                        unoptimized
                      />
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <DetailTile
                        icon={<User size={13} />}
                        label="Received By"
                        value={shipment.proofOfDelivery.recipientName || "-"}
                      />
                      <DetailTile
                        icon={<Clock size={13} />}
                        label="Confirmed"
                        value={
                          shipment.proofOfDelivery.confirmedAt
                            ? fmtDateTime(shipment.proofOfDelivery.confirmedAt)
                            : "-"
                        }
                      />
                    </div>
                    {shipment.proofOfDelivery.notes && (
                      <p className="rounded-xl bg-[var(--surface-soft)] p-3 text-sm font-medium text-[var(--text-soft)]">
                        {shipment.proofOfDelivery.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm italic text-[var(--text-muted)]">
                    No proof of delivery recorded yet.
                  </p>
                )}
              </DetailSection>

              <DetailSection icon={<Clock size={14} />} title="Journey">
                {shipment.timeline.length === 0 ? (
                  <p className="text-sm italic text-[var(--text-muted)]">
                    No journey updates yet.
                  </p>
                ) : (
                  <ol className="relative space-y-4 pl-6">
                    <span className="absolute bottom-2 left-[6px] top-2 w-px bg-[var(--border)]" />
                    {[...shipment.timeline].reverse().map((entry, i) => (
                      <li key={i} className="relative">
                        <span
                          className={`absolute -left-6 top-0.5 h-3.5 w-3.5 rounded-full ring-4 ${
                            i === 0
                              ? "bg-[var(--success)] ring-[var(--success)]/15"
                              : "bg-[var(--text-muted)] ring-[var(--text-muted)]/10"
                          }`}
                        />
                        <p className="text-sm font-bold text-[var(--text)]">
                          {DRIVER_STAGE_LABELS[entry.stage] ?? entry.stage}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {fmtDateTime(entry.at)}
                        </p>
                        {entry.note && (
                          <p className="mt-0.5 text-xs text-[var(--text-soft)]">
                            {entry.note}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </DetailSection>
            </div>

            <div className="flex shrink-0 items-center gap-3 border-t border-[var(--border)] p-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary btn-sm flex-1 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => onEdit(shipment)}
                className="btn-primary btn-sm flex flex-1 items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit2 size={15} /> Edit Shipment
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
