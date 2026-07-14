"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ClipboardCheck,
  FileText,
  Loader2,
  LogOut,
  MapPin,
  Truck,
  Wrench,
} from "lucide-react";
import type { AuthUser } from "@/lib/api/auth.api";
import {
  maintenanceGetWorkOrders,
  maintenanceUpdateWorkOrder,
  type MaintenanceWorkOrderUpdatePayload,
} from "@/lib/api/maintenance.api";
import {
  MAINTENANCE_WORK_ORDER_STATUSES,
  type MaintenanceWorkOrder,
} from "@/lib/api/fleetReports.api";
import { formatNPR } from "@/lib/pricing";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  assigned: { label: "Assigned", cls: "bg-[#E8F0FB] text-[#2E6FD6]" },
  in_repair: { label: "In repair", cls: "bg-[#FBF0DA] text-[#C08A2D]" },
  awaiting_verification: {
    label: "Awaiting verification",
    cls: "bg-[#FCE8D8] text-[#C06A2D]",
  },
  closed: { label: "Closed", cls: "bg-[#E6F4EC] text-[#1F9D57]" },
  cancelled: { label: "Cancelled", cls: "bg-[#FBE9E5] text-[#D0533F]" },
};

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function MaintenanceWorkOrders({
  token,
  user,
}: {
  token: string;
  user: AuthUser;
}) {
  const router = useRouter();
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const response = await maintenanceGetWorkOrders(token, { status });
        setWorkOrders(response.data);
        setError(null);
      } catch (err) {
        if (!silent) {
          setError(
            err instanceof Error ? err.message : "Failed to load work orders",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [status, token],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useAutoRefresh(() => load(true), { intervalMs: 15_000 });

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-4 py-5 font-sans sm:px-6 lg:px-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--teal-tint)] text-[var(--teal)]">
            <Wrench size={21} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--teal)]">
              Maintenance
            </p>
            <h1 className="truncate text-xl font-black text-[var(--text)]">
              Work Orders
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-semibold text-[var(--text-soft)] sm:block">
            {user.fullName}
          </span>
          <button
            type="button"
            onClick={logout}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl py-7">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatus("")}
            className={[
              "rounded-full px-3.5 py-1.5 text-xs font-bold",
              status === ""
                ? "bg-[var(--text)] text-[var(--surface)]"
                : "border border-[var(--border)] text-[var(--text-muted)]",
            ].join(" ")}
          >
            All
          </button>
          {MAINTENANCE_WORK_ORDER_STATUSES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={[
                "rounded-full px-3.5 py-1.5 text-xs font-bold",
                status === value
                  ? "bg-[var(--teal)] text-white"
                  : "border border-[var(--border)] text-[var(--text-muted)]",
              ].join(" ")}
            >
              {STATUS_META[value]?.label ?? value}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-5 rounded-lg border border-[#F3C6BF] bg-[#FBE4E1] px-4 py-3 text-sm font-semibold text-[#D0453A]">
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-5 space-y-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--surface)]"
              />
            ))}
          </div>
        ) : workOrders.length === 0 ? (
          <div className="mt-5 flex min-h-64 flex-col items-center justify-center border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
            <ClipboardCheck size={30} className="text-[var(--text-muted)]" />
            <p className="mt-3 text-sm font-semibold text-[var(--text-muted)]">
              No work orders in this view.
            </p>
          </div>
        ) : (
          <ul className="mt-5 space-y-4">
            {workOrders.map((workOrder) => (
              <MaintenanceWorkOrderCard
                key={workOrder.id}
                token={token}
                workOrder={workOrder}
                onChanged={() => load(true)}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

function MaintenanceWorkOrderCard({
  token,
  workOrder,
  onChanged,
}: {
  token: string;
  workOrder: MaintenanceWorkOrder;
  onChanged: () => void;
}) {
  const [diagnosis, setDiagnosis] = useState(workOrder.diagnosis);
  const [repairNotes, setRepairNotes] = useState(workOrder.repairNotes);
  const [partsUsed, setPartsUsed] = useState(workOrder.partsUsed);
  const [partsCost, setPartsCost] = useState(String(workOrder.partsCost || ""));
  const [laborCost, setLaborCost] = useState(String(workOrder.laborCost || ""));
  const [activityNote, setActivityNote] = useState("");
  const [invoice, setInvoice] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (status?: "in_repair" | "awaiting_verification") => {
    const payload: MaintenanceWorkOrderUpdatePayload = {
      diagnosis,
      repairNotes,
      partsUsed,
      partsCost: partsCost === "" ? 0 : Number(partsCost),
      laborCost: laborCost === "" ? 0 : Number(laborCost),
      activityNote,
      invoice,
    };
    if (status) payload.status = status;

    setPending(true);
    setError(null);
    try {
      await maintenanceUpdateWorkOrder(token, workOrder.id, payload);
      setActivityNote("");
      setInvoice(null);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update work order");
    } finally {
      setPending(false);
    }
  };

  const statusMeta = STATUS_META[workOrder.status] ?? {
    label: workOrder.status,
    cls: "bg-[var(--surface-soft)] text-[var(--text-muted)]",
  };
  const active =
    workOrder.status === "assigned" || workOrder.status === "in_repair";

  return (
    <li className="border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FCE8D8] text-[#C06A2D]">
          <Wrench size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-black capitalize text-[var(--text)]">
              {workOrder.incidentCategory} issue
            </h2>
            <span className={["rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase", statusMeta.cls].join(" ")}>
              {statusMeta.label}
            </span>
            <span className="rounded-full bg-[var(--surface-soft)] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[var(--text-muted)]">
              {workOrder.priority}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--text-soft)]">
            {workOrder.incidentDescription}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1">
              <Truck size={13} />
              {workOrder.vehicleRegistration ?? "Vehicle"}
            </span>
            {workOrder.incidentLocation && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} />
                {workOrder.incidentLocation}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar size={13} />
              Target {formatDate(workOrder.expectedCompletionAt)}
            </span>
          </div>
        </div>
      </div>

      {workOrder.adminNote && (
        <p className="mt-4 border-l-2 border-[var(--teal)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-medium text-[var(--text-soft)]">
          Admin note: {workOrder.adminNote}
        </p>
      )}

      {active ? (
        <div className="mt-5 grid gap-3 border-t border-[var(--border)] pt-5 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">
              Diagnosis
            </span>
            <textarea
              value={diagnosis}
              onChange={(event) => setDiagnosis(event.target.value)}
              rows={2}
              className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--teal)]"
            />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">
              Repair notes
            </span>
            <textarea
              value={repairNotes}
              onChange={(event) => setRepairNotes(event.target.value)}
              rows={3}
              className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--teal)]"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">
              Parts used
            </span>
            <input
              value={partsUsed}
              onChange={(event) => setPartsUsed(event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--teal)]"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">
              Work note
            </span>
            <input
              value={activityNote}
              onChange={(event) => setActivityNote(event.target.value)}
              placeholder="What changed?"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--teal)]"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">
              Parts cost
            </span>
            <input
              type="number"
              min="0"
              value={partsCost}
              onChange={(event) => setPartsCost(event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--teal)]"
            />
          </label>
          <label>
            <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">
              Labour cost
            </span>
            <input
              type="number"
              min="0"
              value={laborCost}
              onChange={(event) => setLaborCost(event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--teal)]"
            />
          </label>
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-bold text-[var(--text-muted)]">
              Invoice or repair receipt
            </span>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(event) => setInvoice(event.target.files?.[0] ?? null)}
              className="block w-full text-xs text-[var(--text-muted)]"
            />
          </label>
          <div className="md:col-span-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => save()}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-bold text-[var(--text-soft)] disabled:opacity-60"
            >
              {pending ? <Loader2 size={14} className="animate-spin" /> : "Save update"}
            </button>
            {workOrder.status === "assigned" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => save("in_repair")}
                className="rounded-lg bg-[var(--teal)] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
              >
                Start repair
              </button>
            )}
            {workOrder.status === "in_repair" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => save("awaiting_verification")}
                className="rounded-lg bg-[var(--teal)] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
              >
                Submit for verification
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <p><span className="font-bold">Diagnosis:</span> {workOrder.diagnosis || "-"}</p>
          <p><span className="font-bold">Repair notes:</span> {workOrder.repairNotes || "-"}</p>
          <p><span className="font-bold">Parts:</span> {workOrder.partsUsed || "-"}</p>
          <p><span className="font-bold">Cost:</span> {formatNPR(workOrder.totalCost)}</p>
        </div>
      )}

      {error && <p className="mt-3 text-xs font-semibold text-[#D0453A]">{error}</p>}
    </li>
  );
}