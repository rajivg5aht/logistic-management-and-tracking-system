"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Package,
  Truck,
  Container,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  AlertCircle,
  PackageOpen,
  Edit2,
  Ban,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  getMyShipments,
  cancelMyShipment,
  deleteMyShipment,
  deleteMyShipmentHistory,
  getShipmentDisplayStatus,
  type Shipment,
  type ShipmentStatus,
  type ServiceType,
} from "@/lib/api/shipment.api";
import type { AuthUser } from "@/lib/api/auth.api";
import Modal from "@/components/ui/Modal";
import EditShipmentModal from "@/components/shipment/EditShipmentModal";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { getPageNumbers } from "@/lib/ui-helpers";

const STATUS_META: Record<ShipmentStatus, { text: string; bg: string; color: string; dot: string }> = {
  pending: {
    text: "Pending",
    bg: "bg-[rgba(233,196,106,0.16)]",
    color: "text-[#C99A3D]",
    dot: "bg-[#C99A3D]",
  },
  "in-transit": {
    text: "In Transit",
    bg: "bg-[#EAF1FC]",
    color: "text-[#3E80E5]",
    dot: "bg-[#3E80E5]",
  },
  delivered: {
    text: "Delivered",
    bg: "bg-[rgba(95,127,53,0.1)]",
    color: "text-[var(--success)]",
    dot: "bg-[var(--success)]",
  },
  cancelled: {
    text: "Cancelled",
    bg: "bg-[rgba(181,71,59,0.1)]",
    color: "text-[var(--danger)]",
    dot: "bg-[var(--danger)]",
  },
};

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Display-only delivery-time budget per service, used to derive an honest
// "Est. Arrival" for in-transit shipments (the data model has no ETA field).
const SERVICE_SLA_DAYS: Record<ServiceType, number> = {
  standard: 5,
  express: 2,
  overnight: 1,
};

function estimatedArrival(createdAt: string, service: ServiceType): string {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + SERVICE_SLA_DAYS[service]);
  return fmtDate(d.toISOString());
}

function dateLabelFor(status: ShipmentStatus): string {
  if (status === "delivered") return "Delivered On";
  if (status === "cancelled") return "Cancelled On";
  if (status === "in-transit") return "Est. Arrival";
  return "Order Date";
}

// Keeps the displayed value consistent with dateLabelFor's label.
function displayDate(s: Shipment): string {
  if (s.status === "delivered") return fmtDate(s.deliveredAt ?? s.updatedAt);
  if (s.status === "cancelled") return fmtDate(s.updatedAt);
  if (s.status === "in-transit") return estimatedArrival(s.createdAt, s.service);
  return fmtDate(s.createdAt); // pending â†’ Order Date
}

function getIcon(s: Shipment) {
  if (s.status === "in-transit") return <Truck size={20} className="text-[var(--accent)]" />;
  if (s.package.parcelType === "pallet") return <Container size={20} className="text-[var(--accent)]" />;
  return <Package size={20} className="text-[var(--accent)]" />;
}


const PAGE_SIZE = 5;

export default function ShipmentHistory({ token }: { user?: AuthUser; token: string }) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Customer lifecycle actions (edit / cancel / delete).
  const [editing, setEditing] = useState<Shipment | null>(null);
  const [cancelling, setCancelling] = useState<Shipment | null>(null);
  const [deleting, setDeleting] = useState<Shipment | null>(null);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // `silent` refreshes update the list in place without the loading skeleton or
  // clobbering it with a transient error (used by the auto-refresh polling).
  const fetchHistory = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }
        const data = await getMyShipments(token);
        setShipments(data);
        if (silent) setError(null);
      } catch (err) {
        if (!silent) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load your shipments. Please try again.",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Reflect admin changes (e.g. a shipment marked "delivered" or cancelled)
  // without a manual page refresh.
  useAutoRefresh(() => fetchHistory(true));

  const handleCancelConfirm = async () => {
    if (!cancelling) return;
    try {
      setActionLoading(true);
      setActionError(null);
      await cancelMyShipment(token, cancelling.id);
      setCancelling(null);
      await fetchHistory();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to cancel shipment.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleting) return;
    try {
      setActionLoading(true);
      setActionError(null);
      await deleteMyShipment(token, deleting.id);
      setDeleting(null);
      await fetchHistory();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete shipment.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearHistoryConfirm = async () => {
    try {
      setActionLoading(true);
      setActionError(null);
      await deleteMyShipmentHistory(token);
      setClearingHistory(false);
      setCurrentPage(1);
      await fetchHistory();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to clear shipment history.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Delivered/cancelled shipments are the only ones the customer may clear.
  const historyCount = shipments.filter(
    (s) => s.status === "delivered" || s.status === "cancelled",
  ).length;

  const totalPages = Math.max(1, Math.ceil(shipments.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = shipments.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = shipments.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = (safePage - 1) * PAGE_SIZE + pageItems.length;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)] tracking-tight">
            Shipment History
          </h1>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1">
            Review and manage your past logistics operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {historyCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setActionError(null);
                setClearingHistory(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--danger)] text-sm font-bold hover:bg-[rgba(181,71,59,0.08)] hover:border-[var(--danger)]/40 transition-colors cursor-pointer"
              title="Delete all delivered and cancelled shipments"
              suppressHydrationWarning
            >
              <Trash2 size={16} />
              Clear History
            </button>
          )}
          <Link
            href="/shipments"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1D7A8C] text-white text-sm font-bold hover:bg-[#15656e] transition-colors"
          >
            <Plus size={16} />
            New Shipment
          </Link>
        </div>
      </div>

      {/* States */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-[#F5E6D8] bg-[#FDF6F0] p-5"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-[#F3EBF9]" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded bg-[#F0E3D5]" />
                  <div className="h-3 w-1/2 rounded bg-[#F0E3D5]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-[#F5E6D8] bg-[#FDF6F0] p-10 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(181,71,59,0.1)] text-[var(--danger)]">
            <AlertCircle size={24} />
          </div>
          <p className="text-sm font-semibold text-[var(--text)]">{error}</p>
          <button
            type="button"
            onClick={() => fetchHistory()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-soft)] transition-colors cursor-pointer"
            suppressHydrationWarning
          >
            Retry
          </button>
        </div>
      ) : shipments.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border border-[#F5E6D8] bg-[#FDF6F0] p-12 text-center">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3EBF9]">
            <PackageOpen size={30} className="text-[var(--accent)]" />
          </div>
          <h3 className="text-lg font-extrabold text-[var(--text)]">No shipments yet</h3>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-[var(--text-muted)]">
            Once you book and pay for a shipment, it will show up here so you can track and manage it.
          </p>
          <Link
            href="/shipments"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#E9C46A] px-5 py-2.5 text-sm font-bold text-[#3A2E12] transition-colors hover:bg-[#C99A3D]"
          >
            <Plus size={16} />
            Book Your First Shipment
          </Link>
        </div>
      ) : (
        <>
          {/* Shipment List */}
          <div className="space-y-4">
            {pageItems.map((shipment) => {
              const meta = STATUS_META[shipment.status];
              const isCancelled = shipment.status === "cancelled";
              const route = `${shipment.pickup.city || "â€”"} â†’ ${shipment.delivery.city || "â€”"}`;

              return (
                <div
                  key={shipment.id}
                  className="bg-[#FDF6F0] border border-[#F5E6D8] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F3EBF9]">
                      {getIcon(shipment)}
                    </div>

                    {/* Shipment Details */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* ID & Destination */}
                      <div>
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Shipment ID
                        </p>
                        <p className="text-sm font-bold text-[var(--text)] mt-0.5">
                          #{shipment.trackingId}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {shipment.delivery.city || shipment.delivery.district || "â€”"}
                        </p>
                      </div>

                      {/* Route */}
                      <div>
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Route
                        </p>
                        <p className="text-sm font-semibold text-[var(--text)] mt-0.5">
                          {route}
                        </p>
                      </div>

                      {/* Date */}
                      <div>
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          {dateLabelFor(shipment.status)}
                        </p>
                        <p className="text-sm font-semibold text-[var(--text)] mt-0.5">
                          {displayDate(shipment)}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Status
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${meta.bg} ${meta.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {getShipmentDisplayStatus(shipment)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {shipment.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditing(shipment)}
                            className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-muted)] transition-colors hover:border-[#1D7A8C]/40 hover:bg-[#F4FAFA] hover:text-[#1D7A8C] cursor-pointer"
                            title="Edit shipment"
                            suppressHydrationWarning
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancelling(shipment)}
                            className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-muted)] transition-colors hover:border-[var(--danger)]/40 hover:bg-[rgba(181,71,59,0.08)] hover:text-[var(--danger)] cursor-pointer"
                            title="Cancel shipment"
                            suppressHydrationWarning
                          >
                            <Ban size={16} />
                          </button>
                        </>
                      )}
                      {shipment.status === "cancelled" && (
                        <button
                          type="button"
                          onClick={() => setDeleting(shipment)}
                          className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-muted)] transition-colors hover:border-[var(--danger)]/40 hover:bg-[rgba(181,71,59,0.08)] hover:text-[var(--danger)] cursor-pointer"
                          title="Delete shipment"
                          suppressHydrationWarning
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <Link
                        href="/tracking"
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          isCancelled
                            ? "border border-[var(--border)] text-[var(--text-muted)] opacity-50 pointer-events-none"
                            : "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-soft)]"
                        }`}
                        aria-disabled={isCancelled}
                      >
                        Track
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer with Pagination */}
          <div className="flex flex-col items-center gap-4 pt-4 pb-20">
            <p className="text-sm text-[var(--text-muted)] font-medium">
              Showing {rangeStart} to {rangeEnd} of {shipments.length}{" "}
              {shipments.length === 1 ? "shipment" : "shipments"}
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  suppressHydrationWarning
                >
                  <ChevronLeft size={18} />
                </button>

                {getPageNumbers(safePage, totalPages).map((page, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={page === "..."}
                    className={`min-w-[40px] h-10 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      page === safePage
                        ? "bg-[#1D7A8C] text-white"
                        : page === "..."
                        ? "text-[var(--text-muted)] cursor-default"
                        : "border border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
                    }`}
                    onClick={() => typeof page === "number" && setCurrentPage(page)}
                    suppressHydrationWarning
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  suppressHydrationWarning
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit modal (pending shipments only) */}
      <EditShipmentModal
        isOpen={editing !== null}
        shipment={editing}
        token={token}
        onClose={() => setEditing(null)}
        onUpdated={fetchHistory}
      />

      {/* Cancel confirmation */}
      <Modal
        isOpen={cancelling !== null}
        onClose={() => {
          setCancelling(null);
          setActionError(null);
        }}
        title="Cancel Shipment"
      >
        <div className="space-y-4">
          {actionError && <div className="form-error">{actionError}</div>}

          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(181,71,59,0.1)] text-[var(--danger)]">
              <Ban size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">
                Cancel shipment #{cancelling?.trackingId}?
              </p>
              <p className="mt-1 text-sm text-[var(--text-soft)]">
                It will be marked as cancelled and will no longer be dispatched.
                You can permanently delete it afterwards.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-3">
            <button
              type="button"
              onClick={() => {
                setCancelling(null);
                setActionError(null);
              }}
              className="btn-secondary btn-sm cursor-pointer"
            >
              Keep Shipment
            </button>
            <button
              type="button"
              onClick={handleCancelConfirm}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--danger)] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
            >
              {actionLoading && <Loader2 size={16} className="animate-spin" />}
              Cancel Shipment
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation (cancelled shipments only) */}
      <Modal
        isOpen={deleting !== null}
        onClose={() => {
          setDeleting(null);
          setActionError(null);
        }}
        title="Delete Shipment"
      >
        <div className="space-y-4">
          {actionError && <div className="form-error">{actionError}</div>}

          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(181,71,59,0.1)] text-[var(--danger)]">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">
                Permanently delete this shipment?
              </p>
              <p className="mt-1 text-sm text-[var(--text-soft)]">
                Shipment{" "}
                <span className="font-bold text-[var(--text)]">
                  #{deleting?.trackingId}
                </span>{" "}
                will be removed from your history. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-3">
            <button
              type="button"
              onClick={() => {
                setDeleting(null);
                setActionError(null);
              }}
              className="btn-secondary btn-sm cursor-pointer"
            >
              Keep
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--danger)] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
            >
              {actionLoading && <Loader2 size={16} className="animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Clear-all-history confirmation */}
      <Modal
        isOpen={clearingHistory}
        onClose={() => {
          setClearingHistory(false);
          setActionError(null);
        }}
        title="Clear Shipment History"
      >
        <div className="space-y-4">
          {actionError && <div className="form-error">{actionError}</div>}

          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(181,71,59,0.1)] text-[var(--danger)]">
              <Trash2 size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">
                Delete all shipment history?
              </p>
              <p className="mt-1 text-sm text-[var(--text-soft)]">
                This permanently removes your{" "}
                <span className="font-bold text-[var(--text)]">
                  {historyCount}
                </span>{" "}
                delivered and cancelled{" "}
                {historyCount === 1 ? "shipment" : "shipments"} from your
                history. Active shipments (pending or in transit) are kept. This
                action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-3">
            <button
              type="button"
              onClick={() => {
                setClearingHistory(false);
                setActionError(null);
              }}
              className="btn-secondary btn-sm cursor-pointer"
            >
              Keep History
            </button>
            <button
              type="button"
              onClick={handleClearHistoryConfirm}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--danger)] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
            >
              {actionLoading && <Loader2 size={16} className="animate-spin" />}
              Delete All
            </button>
          </div>
        </div>
      </Modal>

      {/* Floating Help Button */}
      <button
        type="button"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1D7A8C] hover:bg-[#15656e] text-white text-sm font-semibold shadow-lg transition-all hover:scale-105"
        style={{ boxShadow: 'var(--shadow-md)' }}
        suppressHydrationWarning
      >
        <MessageCircle size={18} />
        Need help tracking?
      </button>
    </div>
  );
}
