"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
  Receipt,
  Clock,
  Eye,
  Plus,
} from "lucide-react";
import {
  getMyPayments,
  type Payment,
  type PaymentMethod,
} from "@/lib/api/payment.api";
import { formatNPR } from "@/lib/pricing";
import type { AuthUser } from "@/lib/api/auth.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { getPageNumbers } from "@/lib/ui-helpers";

const METHOD_LABEL: Record<PaymentMethod, string> = {
  esewa: "eSewa",
  khalti: "Khalti",
  cod: "Cash on Delivery",
};

const STATUS_META: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: {
    label: "Pending",
    bg: "bg-[rgba(181,162,74,0.1)]",
    text: "text-[var(--warning)]",
    dot: "bg-[var(--warning)]",
  },
  paid: {
    label: "Paid",
    bg: "bg-[rgba(95,127,53,0.1)]",
    text: "text-[var(--success)]",
    dot: "bg-[var(--success)]",
  },
  collected: {
    label: "Collected",
    bg: "bg-[rgba(62,128,229,0.12)]",
    text: "text-[var(--info)]",
    dot: "bg-[var(--info)]",
  },
  settled: {
    label: "Settled",
    bg: "bg-[rgba(121,83,18,0.1)]",
    text: "text-[var(--accent-strong)]",
    dot: "bg-[var(--accent)]",
  },
  refunded: {
    label: "Refunded",
    bg: "bg-[rgba(181,71,59,0.1)]",
    text: "text-[var(--danger)]",
    dot: "bg-[var(--danger)]",
  },
  failed: {
    label: "Failed",
    bg: "bg-[rgba(181,71,59,0.1)]",
    text: "text-[var(--danger)]",
    dot: "bg-[var(--danger)]",
  },
};

const FALLBACK_STATUS = {
  label: "Unknown",
  bg: "bg-[var(--surface-soft)]",
  text: "text-[var(--text-muted)]",
  dot: "bg-[var(--text-muted)]",
};

// Charge statuses that represent money the customer has actually parted with.
const PAID_STATUSES = new Set(["paid", "collected", "settled"]);

const PAGE_SIZE = 6;

function fmtDate(s: string): string {
  return new Date(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusMetaOf(payment: Payment) {
  return STATUS_META[payment.status] ?? { ...FALLBACK_STATUS, label: payment.status };
}

function methodLabelOf(payment: Payment): string {
  return METHOD_LABEL[payment.method as PaymentMethod] ?? payment.method;
}

export default function CustomerPayments({
  token,
}: {
  user?: AuthUser;
  token: string;
}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPayments = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }
        const data = await getMyPayments(token);
        setPayments(data);
        if (silent) setError(null);
      } catch (err) {
        if (!silent) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load your payment history. Please try again.",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useAutoRefresh(() => fetchPayments(true));

  const { totalPaid, codDue, thisMonth, methodBreakdown } = useMemo(() => {
    const now = new Date();
    let paid = 0;
    let due = 0;
    let month = 0;
    const methods = new Map<string, { count: number; amount: number }>();

    for (const p of payments) {
      if (p.type === "refund") {
        paid -= p.amount;
        continue;
      }

      if (PAID_STATUSES.has(p.status)) {
        paid += p.amount;
        const d = new Date(p.createdAt);
        if (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth() === now.getMonth()
        ) {
          month += p.amount;
        }
      } else if (p.method === "cod" && p.status === "pending") {
        due += p.amount;
      }

      if (p.status !== "failed") {
        const entry = methods.get(p.method) ?? { count: 0, amount: 0 };
        entry.count += 1;
        entry.amount += p.amount;
        methods.set(p.method, entry);
      }
    }

    return {
      totalPaid: paid,
      codDue: due,
      thisMonth: month,
      methodBreakdown: Array.from(methods.entries()).map(([method, v]) => ({
        method,
        label: METHOD_LABEL[method as PaymentMethod] ?? method,
        ...v,
      })),
    };
  }, [payments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((p) =>
      [
        p.trackingId ?? "",
        p.reference,
        methodLabelOf(p),
        statusMetaOf(p).label,
        p.type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [payments, search]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)] tracking-tight">
            Payments
          </h1>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1">
            Your payment history across all shipments — COD collections, digital
            payments, and refunds.
          </p>
        </div>
        <Link
          href="/shipments"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--text-on-accent)] text-sm font-bold transition-colors no-underline"
        >
          <Plus size={16} />
          New Shipment
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-[var(--accent-soft)] to-[var(--accent-soft)] rounded-2xl p-6 shadow-sm border border-[var(--accent-soft)]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Total Paid
                </p>
                <p className="text-3xl font-extrabold text-[var(--text)] mt-2">
                  {loading ? "-" : formatNPR(totalPaid)}
                </p>
              </div>
              <div className="p-2 bg-white/50 rounded-lg">
                <Wallet size={24} className="text-[var(--accent)]" />
              </div>
            </div>
            <p className="text-xs font-medium text-[var(--text-muted)]">
              Across {loading ? "-" : payments.length}{" "}
              {payments.length === 1 ? "payment" : "payments"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-[var(--border)] shadow-sm">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-[var(--warning)]" />
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  COD Due
                </p>
              </div>
              <p className="text-xl font-extrabold text-[var(--text)] mt-1">
                {loading ? "-" : formatNPR(codDue)}
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
                {loading ? "-" : formatNPR(thisMonth)}
              </p>
            </div>
          </div>

          {!loading && methodBreakdown.length > 0 && (
            <div>
              <h2 className="text-lg font-extrabold text-[var(--text)] mb-3">
                Payment Methods
              </h2>
              <div className="space-y-3">
                {methodBreakdown.map(({ method, label, count, amount }) => (
                  <div
                    key={method}
                    className="bg-[var(--accent-soft)] rounded-xl p-4 border border-[var(--border-strong)]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-[var(--text)]">
                        {label}
                      </p>
                      <span className="text-xs font-bold text-[var(--accent)] bg-white/60 px-2 py-1 rounded">
                        {count} {count === 1 ? "payment" : "payments"}
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

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-extrabold text-[var(--text)]">
                  Payment History
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
                    placeholder="Search payments..."
                    className="pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    suppressHydrationWarning
                  />
                </div>
              </div>
            </div>

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
                  onClick={() => fetchPayments()}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-soft)] transition-colors cursor-pointer"
                  suppressHydrationWarning
                >
                  Retry
                </button>
              </div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)]">
                  <FileText size={30} className="text-[var(--accent)]" />
                </div>
                <h3 className="text-lg font-extrabold text-[var(--text)]">
                  No payments yet
                </h3>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-[var(--text-muted)]">
                  Once you book a shipment, its payment record will appear here.
                </p>
                <Link
                  href="/shipments"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-[var(--accent-strong)] transition-colors hover:bg-[var(--accent-hover)] no-underline"
                >
                  <Plus size={16} />
                  Book a Shipment
                </Link>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-sm font-semibold text-[var(--text)]">
                  No payments match &ldquo;{search}&rdquo;.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                        <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Payment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          Method
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
                      {pageItems.map((payment) => {
                        const statusColor = statusMetaOf(payment);
                        const isRefund = payment.type === "refund";
                        return (
                          <tr
                            key={payment.id}
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
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-[var(--text)]">
                                      {payment.trackingId
                                        ? `#${payment.trackingId}`
                                        : payment.reference || "Payment"}
                                    </p>
                                    {isRefund && (
                                      <span className="rounded-full bg-[rgba(181,71,59,0.1)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--danger)]">
                                        Refund
                                      </span>
                                    )}
                                  </div>
                                  {payment.reference && payment.trackingId && (
                                    <p className="text-xs text-[var(--info)] font-medium">
                                      {payment.reference}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-[var(--text)]">
                                {fmtDate(payment.createdAt)}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-[var(--text-soft)]">
                                {methodLabelOf(payment)}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-[var(--text)]">
                                {isRefund ? "-" : ""}
                                {formatNPR(payment.amount)}
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
                              {payment.trackingId ? (
                                <Link
                                  href={`/tracking?trackingId=${encodeURIComponent(payment.trackingId)}`}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-soft)] transition-colors no-underline"
                                  aria-label={`Track shipment ${payment.trackingId}`}
                                >
                                  <Eye size={14} />
                                  View
                                </Link>
                              ) : (
                                <span className="text-xs font-semibold text-[var(--text-muted)]">
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-[var(--text-muted)] font-medium">
                    Showing {rangeStart}-{rangeEnd} of {filtered.length}{" "}
                    {filtered.length === 1 ? "payment" : "payments"}
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
                              ? "bg-[var(--accent)] text-[var(--text-on-accent)]"
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

          <div className="bg-gradient-to-r from-[var(--border)] to-[var(--gold-tint)] rounded-2xl p-6 shadow-sm border border-[var(--border-strong)]">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-[var(--text)] rounded-lg shrink-0 flex items-center justify-center">
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
                  Need help with a payment?
                </h3>
                <p className="text-sm text-[var(--text-muted)] font-medium mb-3">
                  Our support team can help with COD settlements, refunds, and
                  payment queries on your shipments.
                </p>
                <Link
                  href="/inquiries"
                  className="text-sm font-bold text-[var(--info)] hover:underline no-underline"
                >
                  Contact Support {"->"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
