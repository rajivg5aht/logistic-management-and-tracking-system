"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Wallet,
  Clock,
  HandCoins,
  Undo2,
  Loader2,
  X,
  Receipt,
} from "lucide-react";
import {
  adminGetPayments,
  adminGetPaymentStats,
  adminSettleCod,
  adminRefundPayment,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  type Payment,
  type PaymentStats,
} from "@/lib/api/payment.api";
import { formatNPR } from "@/lib/pricing";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-[#FBF1DC] text-[#C99A3D]" },
  paid: { label: "Paid", cls: "bg-[#DEF3E6] text-[#1E9E4C]" },
  collected: { label: "Collected", cls: "bg-[#E8F0FB] text-[#2E6FD6]" },
  settled: { label: "Settled", cls: "bg-[#DCF1EE] text-[#1D7A8C]" },
  refunded: { label: "Refunded", cls: "bg-[#FBE4E1] text-[#D0453A]" },
  failed: { label: "Failed", cls: "bg-[#FBE4E1] text-[#D0453A]" },
};

const METHOD_LABEL: Record<string, string> = {
  esewa: "eSewa",
  khalti: "Khalti",
  cod: "COD",
};

const STATUS_FILTERS = ["", ...PAYMENT_STATUSES] as const;
const METHOD_FILTERS = ["", ...PAYMENT_METHODS] as const;

function fmtDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function label(value: string, map: Record<string, string>): string {
  if (value === "") return "All";
  return map[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
}

export default function AdminPayments({ token }: { token: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundFor, setRefundFor] = useState<Payment | null>(null);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const [listRes, statsRes] = await Promise.all([
          adminGetPayments(token, { status, method }),
          adminGetPaymentStats(token),
        ]);
        setPayments(listRes.data);
        setStats(statsRes);
        setError(null);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Failed to load payments");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token, status, method],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useAutoRefresh(() => load(true), { intervalMs: 15_000 });

  const settle = async (id: string) => {
    setSettlingId(id);
    try {
      await adminSettleCod(token, id);
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to settle payment");
    } finally {
      setSettlingId(null);
    }
  };

  const statTiles = [
    {
      label: "Revenue Received",
      value: stats ? formatNPR(stats.revenue) : "-",
      Icon: Wallet,
      tint: "bg-[#DEF3E6] text-[#1E9E4C]",
    },
    {
      label: "Outstanding COD",
      value: stats ? formatNPR(stats.outstandingCod) : "-",
      Icon: Clock,
      tint: "bg-[#FBF1DC] text-[#C99A3D]",
    },
    {
      label: "COD Held by Drivers",
      value: stats ? formatNPR(stats.codHeldByDrivers) : "-",
      Icon: HandCoins,
      tint: "bg-[#E8F0FB] text-[#2E6FD6]",
    },
    {
      label: "Refunds",
      value: stats ? formatNPR(stats.refunds) : "-",
      Icon: Undo2,
      tint: "bg-[#FBE4E1] text-[#D0453A]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--teal)]">
          Finance
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--text)] sm:text-3xl">
          Payments
        </h1>
        <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
          Transaction ledger, COD settlement, and refunds.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statTiles.map((t) => (
          <div
            key={t.label}
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.tint}`}>
              <t.Icon size={19} className="stroke-[2.4]" />
            </div>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {t.label}
            </p>
            <h3 className="mt-0.5 text-xl font-black tracking-tight text-[var(--text)]">
              {loading ? "-" : t.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {METHOD_FILTERS.map((m) => (
            <button
              key={m || "all-method"}
              type="button"
              onClick={() => setMethod(m)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                method === m
                  ? "bg-[var(--teal)] text-white"
                  : "border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
              }`}
            >
              {label(m, METHOD_LABEL)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s || "all-status"}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                status === s
                  ? "bg-[var(--text)] text-[var(--surface)]"
                  : "border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
              }`}
            >
              {s === "" ? "All" : STATUS_META[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[#F3C6BF] bg-[#FBE4E1] px-4 py-3 text-sm font-semibold text-[#D0453A]">
          {error}
        </div>
      )}

      {/* Ledger */}
      <div
        className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {loading ? (
          <div className="divide-y divide-[var(--border)]">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse bg-[var(--surface)]" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--text-muted)]">
              <Receipt size={22} />
            </div>
            <p className="mt-3 text-sm font-medium text-[var(--text-muted)]">
              No payments match these filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {payments.map((p) => {
                  const meta =
                    STATUS_META[p.status] ?? {
                      label: p.status,
                      cls: "bg-[var(--surface-soft)] text-[var(--text-muted)]",
                    };
                  const isRefund = p.type === "refund";
                  const canSettle =
                    p.type === "charge" &&
                    p.method === "cod" &&
                    p.status === "collected";
                  const canRefund = p.type === "charge" && p.status !== "refunded";
                  return (
                    <tr key={p.id} className="hover:bg-[var(--surface-soft)]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {isRefund && (
                            <span className="rounded-full bg-[#FBE4E1] px-2 py-0.5 text-[10px] font-bold uppercase text-[#D0453A]">
                              Refund
                            </span>
                          )}
                          <div>
                            <p className="font-bold text-[var(--text)]">
                              {p.trackingId ? `#${p.trackingId}` : p.reference || "—"}
                            </p>
                            {p.reference && (
                              <p className="text-[11px] text-[var(--text-muted)]">
                                {p.reference}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[var(--text-soft)]">
                        {p.customerName ?? "—"}
                      </td>
                      <td className="px-5 py-3 font-semibold text-[var(--text-soft)]">
                        {METHOD_LABEL[p.method] ?? p.method}
                      </td>
                      <td className="px-5 py-3 font-bold text-[var(--text)]">
                        {isRefund ? "-" : ""}
                        {formatNPR(p.amount)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.cls}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[var(--text-muted)]">
                        {fmtDate(p.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {canSettle && (
                            <button
                              type="button"
                              onClick={() => settle(p.id)}
                              disabled={settlingId === p.id}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--teal)] px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
                            >
                              {settlingId === p.id && (
                                <Loader2 size={12} className="animate-spin" />
                              )}
                              Settle
                            </button>
                          )}
                          {canRefund && (
                            <button
                              type="button"
                              onClick={() => setRefundFor(p)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-bold text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] cursor-pointer"
                            >
                              <Undo2 size={12} /> Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {refundFor && (
        <RefundModal
          token={token}
          payment={refundFor}
          onClose={() => setRefundFor(null)}
          onDone={() => {
            setRefundFor(null);
            load(true);
          }}
        />
      )}
    </div>
  );
}

function RefundModal({
  token,
  payment,
  onClose,
  onDone,
}: {
  token: string;
  payment: Payment;
  onClose: () => void;
  onDone: () => void;
}) {
  const [amount, setAmount] = useState(String(payment.amount));
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setErr("Enter a valid refund amount.");
      return;
    }
    setPending(true);
    setErr(null);
    try {
      await adminRefundPayment(token, {
        shipmentId: payment.shipmentId,
        amount: amt,
        reason: reason.trim() || undefined,
      });
      onDone();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Failed to record refund");
      setPending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-2xl border border-[var(--border)] bg-[var(--surface)] sm:rounded-2xl"
        style={{ boxShadow: "var(--shadow-md)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-[var(--text)]">
            <Undo2 size={18} className="text-[var(--accent)]" />
            Record Refund
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          {err && (
            <div className="rounded-xl border border-[#F3C6BF] bg-[#FBE4E1] px-3.5 py-2.5 text-sm font-semibold text-[#D0453A]">
              {err}
            </div>
          )}
          <p className="text-sm text-[var(--text-muted)]">
            Refund for shipment{" "}
            <span className="font-bold text-[var(--text)]">
              {payment.trackingId ? `#${payment.trackingId}` : payment.shipmentId}
            </span>{" "}
            ({METHOD_LABEL[payment.method] ?? payment.method}).
          </p>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Amount (Rs)
            </label>
            <input
              type="number"
              min={1}
              max={payment.amount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Why is this being refunded?"
              className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-bold text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              {pending && <Loader2 size={15} className="animate-spin" />}
              Record Refund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
