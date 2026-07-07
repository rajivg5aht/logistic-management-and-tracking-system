"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  Search,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  AlertCircle,
  FileText,
  Receipt,
  Clock,
  Eye,
  Plus,
} from "lucide-react";
import {
  getMyShipments,
  type Shipment,
  type ServiceType,
  type PaymentMethod,
} from "@/lib/api/shipment.api";
import { formatNPR } from "@/lib/pricing";
import type { AuthUser } from "@/lib/api/auth.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

// An invoice is derived directly from a confirmed shipment — the data model has
// no separate invoice entity, so each shipment the customer books *is* an invoice.
type InvoiceStatus = "paid" | "due" | "cancelled";

interface Invoice {
  id: string;
  invoiceId: string;
  trackingId: string;
  description: string;
  date: string;
  rawDate: string;
  amount: number;
  status: InvoiceStatus;
}

const SERVICE_LABEL: Record<ServiceType, string> = {
  standard: "Standard Delivery",
  express: "Priority Express",
  overnight: "Premium Overnight",
};

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  esewa: "eSewa",
  khalti: "Khalti",
  cod: "Cash on Delivery",
};

const STATUS_META: Record<
  InvoiceStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  paid: {
    label: "Paid",
    bg: "bg-[rgba(95,127,53,0.1)]",
    text: "text-[var(--success)]",
    dot: "bg-[var(--success)]",
  },
  due: {
    label: "Due (COD)",
    bg: "bg-[rgba(181,162,74,0.1)]",
    text: "text-[#8B7355]",
    dot: "bg-[#8B7355]",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-[rgba(181,71,59,0.1)]",
    text: "text-[var(--danger)]",
    dot: "bg-[var(--danger)]",
  },
};

const PAGE_SIZE = 6;

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function invoiceStatusOf(s: Shipment): InvoiceStatus {
  if (s.status === "cancelled") return "cancelled";
  return s.paymentStatus === "paid" ? "paid" : "due";
}

function toInvoice(s: Shipment): Invoice {
  const destination =
    s.delivery.city || s.delivery.district || s.delivery.recipientName || "—";
  return {
    id: s.id,
    invoiceId: `#INV-${s.trackingId}`,
    trackingId: s.trackingId,
    description: `${SERVICE_LABEL[s.service]} → ${destination}`,
    date: fmtDate(s.createdAt),
    rawDate: s.createdAt,
    amount: s.amount,
    status: invoiceStatusOf(s),
  };
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

export default function PaymentsBilling({
  token,
}: {
  user?: AuthUser;
  token: string;
}) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // `silent` refreshes update invoices in place without the loading skeleton or
  // a transient error (used by the auto-refresh polling).
  const fetchBilling = useCallback(
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
              : "Failed to load your billing history. Please try again.",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  // Reflect admin changes (e.g. a COD invoice marked "paid" or a cancellation)
  // without a manual page refresh.
  useAutoRefresh(() => fetchBilling(true));

  // Derive invoices (newest first) and financial aggregates from real shipments.
  const { invoices, totalPaid, codDue, thisMonth, methodBreakdown } = useMemo(() => {
    const list = shipments
      .map(toInvoice)
      .sort((a, b) => +new Date(b.rawDate) - +new Date(a.rawDate));

    const now = new Date();
    let paid = 0;
    let due = 0;
    let month = 0;
    const methods = new Map<PaymentMethod, { count: number; amount: number }>();

    for (const s of shipments) {
      const status = invoiceStatusOf(s);
      if (status === "paid") {
        paid += s.amount;
        const d = new Date(s.createdAt);
        if (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        ) {
          month += s.amount;
        }
      } else if (status === "due") {
        due += s.amount;
      }

      if (status !== "cancelled") {
        const entry = methods.get(s.paymentMethod) ?? { count: 0, amount: 0 };
        entry.count += 1;
        entry.amount += s.amount;
        methods.set(s.paymentMethod, entry);
      }
    }

    return {
      invoices: list,
      totalPaid: paid,
      codDue: due,
      thisMonth: month,
      methodBreakdown: Array.from(methods.entries()).map(([method, v]) => ({
        method,
        ...v,
      })),
    };
  }, [shipments]);

  // Client-side search over the derived invoices.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) =>
      [inv.invoiceId, inv.trackingId, inv.description, STATUS_META[inv.status].label]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [invoices, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = (safePage - 1) * PAGE_SIZE + pageItems.length;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)] tracking-tight">
            Payments & Billing
          </h1>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1">
            Invoices and payment history from your confirmed shipments.
          </p>
        </div>
        <Link
          href="/shipments"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1D7A8C] hover:bg-[#15656e] text-white text-sm font-bold transition-colors no-underline"
        >
          <Plus size={16} />
          New Shipment
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Total Paid Card */}
          <div className="bg-gradient-to-br from-[#E8F4F8] to-[#D4E9F0] rounded-2xl p-6 shadow-sm border border-[#B8D4E3]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Total Paid
                </p>
                <p className="text-3xl font-extrabold text-[var(--text)] mt-2">
                  {loading ? "—" : formatNPR(totalPaid)}
                </p>
              </div>
              <div className="p-2 bg-white/50 rounded-lg">
                <Wallet size={24} className="text-[var(--accent)]" />
              </div>
            </div>
            <p className="text-xs font-medium text-[var(--text-muted)]">
              Across {loading ? "—" : invoices.length}{" "}
              {invoices.length === 1 ? "invoice" : "invoices"}
            </p>
          </div>

          {/* Stat Boxes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-[var(--border)] shadow-sm">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#8B7355]" />
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  COD Due
                </p>
              </div>
              <p className="text-xl font-extrabold text-[var(--text)] mt-1">
                {loading ? "—" : formatNPR(codDue)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[var(--border)] shadow-sm">
              <div className="flex items-center gap-1.5">
                <Receipt size={13} className="text-[var(--accent)]" />
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  This Month
                </p>
              </div>
              <p className="text-xl font-extrabold text-[var(--text)] mt-1">
                {loading ? "—" : formatNPR(thisMonth)}
              </p>
            </div>
          </div>

          {/* Payment Methods (derived from real shipments) */}
          {!loading && methodBreakdown.length > 0 && (
            <div>
              <h2 className="text-lg font-extrabold text-[var(--text)] mb-3">
                Payment Methods
              </h2>
              <div className="space-y-3">
                {methodBreakdown.map(({ method, count, amount }) => (
                  <div
                    key={method}
                    className="bg-[#F3EBF9] rounded-xl p-4 border border-[#E0D0F0]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-[var(--text)]">
                        {PAYMENT_LABEL[method]}
                      </p>
                      <span className="text-xs font-bold text-[var(--accent)] bg-white/60 px-2 py-1 rounded">
                        {count} {count === 1 ? "order" : "orders"}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatNPR(amount)} total
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Invoices */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-extrabold text-[var(--text)]">
                  Recent Invoices
                </h2>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search invoices..."
                    className="pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    suppressHydrationWarning
                  />
                </div>
              </div>
            </div>

            {/* Content states */}
            {loading ? (
              <div className="divide-y divide-[var(--border)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-4 animate-pulse">
                    <div className="h-9 w-9 rounded-lg bg-[var(--surface-muted)]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-1/3 rounded bg-[var(--surface-muted)]" />
                      <div className="h-3 w-1/2 rounded bg-[var(--surface-muted)]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-10 text-center">
                <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(181,71,59,0.1)] text-[var(--danger)]">
                  <AlertCircle size={24} />
                </div>
                <p className="text-sm font-semibold text-[var(--text)]">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchBilling()}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-soft)] transition-colors cursor-pointer"
                  suppressHydrationWarning
                >
                  Retry
                </button>
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F3EBF9]">
                  <FileText size={30} className="text-[var(--accent)]" />
                </div>
                <h3 className="text-lg font-extrabold text-[var(--text)]">
                  No invoices yet
                </h3>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-[var(--text-muted)]">
                  Once you confirm and pay for a shipment, its invoice will appear
                  here.
                </p>
                <Link
                  href="/shipments"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#E9C46A] px-5 py-2.5 text-sm font-bold text-[#3A2E12] transition-colors hover:bg-[#C99A3D] no-underline"
                >
                  <Plus size={16} />
                  Book a Shipment
                </Link>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm font-semibold text-[var(--text)]">
                  No invoices match &ldquo;{search}&rdquo;.
                </p>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                        <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Invoice ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {pageItems.map((invoice) => {
                        const statusColor = STATUS_META[invoice.status];
                        return (
                          <tr
                            key={invoice.id}
                            className="hover:bg-[var(--surface-soft)] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--surface-muted)] rounded-lg">
                                  <FileText
                                    size={16}
                                    className="text-[var(--text-muted)]"
                                  />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-[var(--text)]">
                                    {invoice.invoiceId}
                                  </p>
                                  <p className="text-xs text-[#3E80E5] font-medium">
                                    {invoice.description}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-[var(--text)]">
                                {invoice.date}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-[var(--text)]">
                                {formatNPR(invoice.amount)}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColor.bg} ${statusColor.text}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${statusColor.dot}`}
                                />
                                {statusColor.label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link
                                href={`/tracking?trackingId=${encodeURIComponent(invoice.trackingId)}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-soft)] transition-colors no-underline"
                                aria-label={`Track shipment ${invoice.trackingId}`}
                              >
                                <Eye size={14} />
                                View
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-[var(--text-muted)] font-medium">
                    Showing {rangeStart}-{rangeEnd} of {filtered.length}{" "}
                    {filtered.length === 1 ? "invoice" : "invoices"}
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
                          onClick={() =>
                            typeof page === "number" && setCurrentPage(page)
                          }
                          className={`min-w-[40px] h-10 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                            page === safePage
                              ? "bg-[#1D7A8C] text-white"
                              : page === "..."
                              ? "text-[var(--text-muted)] cursor-default"
                              : "border border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
                          }`}
                          suppressHydrationWarning
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
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
          </div>

          {/* Support Banner */}
          <div className="bg-gradient-to-r from-[#F5E6D8] to-[#EED9C4] rounded-2xl p-6 shadow-sm border border-[#E5D4B8]">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-[#2C3E50] rounded-lg shrink-0 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-[var(--text)] mb-2">
                  Need specialized billing assistance?
                </h3>
                <p className="text-sm text-[var(--text-muted)] font-medium mb-3">
                  Our support team can help with COD settlements, refunds, and
                  invoice queries on your shipments.
                </p>
                <Link
                  href="/inquiries"
                  className="text-sm font-bold text-[#3E80E5] hover:underline no-underline"
                >
                  Contact Support →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <button
        type="button"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1D7A8C] hover:bg-[#15656e] text-white text-sm font-semibold shadow-lg transition-all hover:scale-105"
        style={{ boxShadow: "var(--shadow-md)" }}
        suppressHydrationWarning
      >
        <MessageCircle size={18} />
        Need help tracking?
      </button>
    </div>
  );
}
