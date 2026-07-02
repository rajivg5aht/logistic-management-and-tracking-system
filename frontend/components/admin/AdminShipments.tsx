"use client";

import { useState, useEffect, useCallback } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  adminGetShipments,
  adminGetShipmentStats,
  adminUpdateShipment,
  adminDeleteShipment,
  type Shipment,
  type ShipmentMeta,
  type ShipmentStats,
  type ShipmentStatus,
} from "@/lib/api/shipment.api";
import Modal from "@/components/ui/Modal";

/* Screenshot-matched navy palette (shared app theme is gold/teal) */
const NAVY = "#0C3B67";
const NAVY_BTN = "#123E6B";

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
  pending: "bg-[#FDECD8] text-[#C77718]",
  "in-transit": "bg-[#E4EEFB] text-[#2E6FD6]",
  delivered: "bg-[#DEF3E6] text-[#1E9E4C]",
  cancelled: "bg-[#FBE4E1] text-[#D0453A]",
};

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending: "Pending",
  "in-transit": "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_STYLES: Record<string, string> = {
  cod: "bg-[#EEF1F4] text-[#5A6B82]",
  prepaid: "bg-[#DEF3E6] text-[#1E9E4C]",
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

function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function locLine(city?: string, district?: string): string {
  return [city, district].filter(Boolean).join(", ") || "—";
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
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
  const [selected, setSelected] = useState<Shipment | null>(null);
  const [form, setForm] = useState<{
    status: ShipmentStatus;
    assignedDriver: string;
    paymentStatus: "paid" | "pending";
  }>({ status: "pending", assignedDriver: "", paymentStatus: "pending" });

  const limit = 10;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // `silent` refreshes update the data in place without the loading skeleton or
  // clobbering the table with a transient error (used by auto-refresh polling).
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

  // Initial load + refetch whenever filters/page/search change.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh so new customer orders appear without a manual refresh:
  // poll every 10s and refetch when the admin returns to the tab.
  useEffect(() => {
    const id = setInterval(() => fetchData(true), 10000);
    const onFocus = () => fetchData(true);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchData]);

  const handleTabChange = (idx: number) => {
    setActiveTab(idx);
    setPage(1);
  };

  const handleEditOpen = (s: Shipment) => {
    setSelected(s);
    setForm({
      status: s.status,
      assignedDriver: s.assignedDriver ?? "",
      paymentStatus: s.paymentStatus,
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
      await adminUpdateShipment(token, selected.id, {
        status: form.status,
        assignedDriver: form.assignedDriver.trim() || null,
        paymentStatus: form.paymentStatus,
      });
      setIsEditOpen(false);
      fetchData(true);
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
      STATUS_LABELS[s.status],
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
    { label: "Pending Orders", value: stats?.pending, sub: "Awaiting dispatch", Icon: ClipboardList, tint: "bg-[#E8F0FB] text-[#2E6FD6]" },
    { label: "In Transit", value: stats?.inTransit, sub: "On the way", Icon: Truck, tint: "bg-[#FBF1DC] text-[#C99A3D]" },
    { label: "Delivered", value: stats?.delivered, sub: "Completed", Icon: CircleCheckBig, tint: "bg-[#E6F4EC] text-[#1F9D57]" },
    { label: "Failed / Cancelled", value: stats?.cancelled, sub: "Needs attention", Icon: XCircle, tint: "bg-[#FBE9E5] text-[#D0533F]" },
  ];

  const rangeStart = meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const rangeEnd = meta ? (meta.page - 1) * meta.limit + shipments.length : 0;

  return (
    <div className="space-y-6 font-sans">
      {/* ============ Page title + refresh ============ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color: NAVY }}>
            Shipment Management
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--text-soft)]">
            Manage and monitor logistics flow across all provinces.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchData()}
          disabled={loading}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-60 cursor-pointer self-start sm:self-auto"
          style={{ background: NAVY_BTN, boxShadow: "0 8px 20px rgba(18,62,107,0.22)" }}
          suppressHydrationWarning
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ============ KPI cards ============ */}
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
              <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-[#5A6B82]">
                {card.label}
              </p>
              <h3 className="mt-0.5 text-2xl font-black tracking-tight" style={{ color: NAVY }}>
                {card.value === undefined ? "—" : card.value.toLocaleString()}
              </h3>
            </div>
          );
        })}
      </div>

      {/* ============ Table card ============ */}
      <div
        className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* Tabs + toolbar */}
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((tab, idx) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => handleTabChange(idx)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
                  activeTab === idx
                    ? "text-white"
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
                placeholder="Search tracking, sender, driver…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm outline-none transition-all focus:border-[#123E6B]/40 sm:w-64"
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

        {/* Table */}
        {error ? (
          <div className="border-t border-[var(--border)] p-10 text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBE4E1] text-[#D0453A]">
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
                        className="border-t border-[var(--border-light)] transition-colors hover:bg-[var(--surface-soft)]"
                      >
                        {/* Tracking ID */}
                        <td className="px-5 py-4">
                          <div className="font-bold" style={{ color: NAVY }}>
                            #{s.trackingId}
                          </div>
                          <div className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                            Created {timeAgo(s.createdAt)}
                          </div>
                        </td>
                        {/* Sender */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-[var(--text)]">{s.pickup.fullName || "—"}</div>
                          <div className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                            {locLine(s.pickup.city, s.pickup.district)}
                          </div>
                        </td>
                        {/* Recipient */}
                        <td className="px-5 py-4">
                          <div className="font-semibold text-[var(--text)]">
                            {s.delivery.recipientName || "—"}
                          </div>
                          <div className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                            {locLine(s.delivery.city, s.delivery.district)}
                          </div>
                        </td>
                        {/* Payment */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                              PAYMENT_STYLES[isCod ? "cod" : "prepaid"]
                            }`}
                          >
                            {isCod ? "COD" : "PREPAID"}
                          </span>
                        </td>
                        {/* Amount */}
                        <td className="px-5 py-4">
                          <span
                            className="font-bold"
                            style={{ color: s.status === "cancelled" ? "#D0453A" : "var(--text)" }}
                          >
                            NPR {s.amount.toLocaleString()}
                          </span>
                        </td>
                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[s.status]}`}
                          >
                            {STATUS_LABELS[s.status]}
                          </span>
                        </td>
                        {/* Driver */}
                        <td className="px-5 py-4">
                          {s.assignedDriver ? (
                            <span className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E8F0FB] text-[10px] font-bold text-[#2E6FD6]">
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
                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditOpen(s)}
                              className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[#123E6B] cursor-pointer"
                              title="Update shipment"
                              suppressHydrationWarning
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOpen(s)}
                              className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[#FBE4E1] hover:text-[#D0453A] cursor-pointer"
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

        {/* Footer / pagination */}
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
                    <span key={`e${i}`} className="px-1 text-sm font-semibold text-[var(--text-muted)]">…</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-bold transition-all cursor-pointer ${
                        page === p
                          ? "border-transparent text-white"
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

      {/* ============ EDIT MODAL ============ */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Update Shipment">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && <div className="form-error">{formError}</div>}

          {selected && (
            <div className="rounded-lg bg-[var(--surface-soft)] px-4 py-3 text-sm">
              <span className="font-bold" style={{ color: NAVY }}>#{selected.trackingId}</span>
              <span className="text-[var(--text-muted)]">
                {" "}
                · {selected.pickup.fullName} → {selected.delivery.recipientName}
              </span>
            </div>
          )}

          <div>
            <label className="form-label" htmlFor="ship-status">Status *</label>
            <select
              id="ship-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ShipmentStatus })}
              className="form-input"
            >
              <option value="pending">Pending</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="ship-driver">Assigned Driver</label>
            <input
              type="text"
              id="ship-driver"
              placeholder="e.g. P. Tamang (leave blank for Unassigned)"
              value={form.assignedDriver}
              onChange={(e) => setForm({ ...form, assignedDriver: e.target.value })}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="ship-payment">Payment Status *</label>
            <select
              id="ship-payment"
              value={form.paymentStatus}
              onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as "paid" | "pending" })}
              className="form-input"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
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

      {/* ============ DELETE MODAL ============ */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Shipment">
        <div className="space-y-4">
          {formError && <div className="form-error">{formError}</div>}

          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBE4E1] text-[#D0453A]">
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
              className="flex items-center gap-1.5 rounded-lg bg-[#D0453A] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#b23a30] cursor-pointer disabled:opacity-50"
            >
              {actionLoading && <Loader2 size={16} className="animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
