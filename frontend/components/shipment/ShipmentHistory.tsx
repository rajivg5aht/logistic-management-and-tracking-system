"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Filter,
  Plus,
  Package,
  Truck,
  Container,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  AlertCircle,
  PackageOpen,
} from "lucide-react";
import { getMyShipments, type Shipment, type ShipmentStatus } from "@/lib/api/shipment.api";
import type { AuthUser } from "@/lib/api/auth.api";

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

function dateLabelFor(status: ShipmentStatus): string {
  if (status === "delivered") return "Delivered On";
  if (status === "cancelled") return "Cancelled On";
  if (status === "in-transit") return "Est. Arrival";
  return "Order Date";
}

function getIcon(s: Shipment) {
  if (s.status === "in-transit") return <Truck size={20} className="text-[var(--accent)]" />;
  if (s.package.parcelType === "pallet") return <Container size={20} className="text-[var(--accent)]" />;
  return <Package size={20} className="text-[var(--accent)]" />;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

const PAGE_SIZE = 5;

export default function ShipmentHistory({ token }: { user?: AuthUser; token: string }) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyShipments(token);
      setShipments(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load your shipments. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold text-[var(--text-soft)] hover:bg-[var(--surface-soft)] transition-colors"
            suppressHydrationWarning
          >
            <Calendar size={16} className="text-[var(--text-muted)]" />
            Last 30 Days
          </button>

          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold text-[var(--text-soft)] hover:bg-[var(--surface-soft)] transition-colors"
            suppressHydrationWarning
          >
            <Filter size={16} className="text-[var(--text-muted)]" />
            All Statuses
          </button>

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
            onClick={fetchHistory}
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
              const route = `${shipment.pickup.city || "—"} → ${shipment.delivery.city || "—"}`;

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
                          {shipment.delivery.city || shipment.delivery.district || "—"}
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
                          {fmtDate(
                            shipment.status === "delivered" || shipment.status === "cancelled"
                              ? shipment.updatedAt
                              : shipment.createdAt,
                          )}
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
                            {meta.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
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
                      <Link
                        href="/shipments"
                        className="px-4 py-2 rounded-lg bg-[#E9C46A] hover:bg-[#C99A3D] text-[#3A2E12] text-sm font-bold transition-colors"
                      >
                        Reorder
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
