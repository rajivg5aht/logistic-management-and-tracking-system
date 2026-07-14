"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPinned,
  ArrowLeft,
  Route as RouteIcon,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Undo2,
  User as UserIcon,
  MapPin,
  Package,
} from "lucide-react";
import { driverGetAssignments } from "@/lib/api/driver.api";
import type { DriverStage, Shipment } from "@/lib/api/shipment.api";
import { formatNPR } from "@/lib/pricing";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import {
  ActiveAssignmentCard,
  MAIN_PATH,
  STAGE_LABEL,
  fmtAddress,
} from "@/components/driver/shared";

export default function DriverRoute({ token }: { token: string }) {
  const [active, setActive] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const res = await driverGetAssignments(token, "active");
        setActive(res[0] ?? null);
        setError(null);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Failed to load route");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    load();
  }, [load]);

  useAutoRefresh(() => load(true), { intervalMs: 15_000 });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/driver"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)]"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={17} />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text)]">Route</h1>
          <p className="text-sm font-medium text-[var(--text-muted)]">
            Your active delivery route and status updates.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[#F3C6BF] bg-[#FBE4E1] px-4 py-3 text-sm font-semibold text-[#D0453A]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-[28rem] animate-pulse rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] lg:col-span-2" />
          <div className="h-[28rem] animate-pulse rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]" />
        </div>
      ) : active ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ActiveAssignmentCard
              key={active.id}
              shipment={active}
              token={token}
              withMap
              showStepper={false}
              onChanged={(updated) => {
                setActive(
                  updated.status === "pending" || updated.status === "in-transit"
                    ? updated
                    : null,
                );
                void load(true);
              }}
            />
          </div>

          <div className="space-y-6">
            <DeliveryMilestones shipment={active} />
            <DeliveryDetails shipment={active} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center">
          <MapPinned size={28} className="text-[var(--text-muted)]" />
          <h3 className="mt-4 text-base font-bold text-[var(--text)]">No route to show</h3>
          <p className="mt-1 max-w-xs text-sm text-[var(--text-muted)]">
            You have no active delivery. Once dispatch assigns you a shipment, its route appears here.
          </p>
        </div>
      )}
    </div>
  );
}

type MilestoneStatus = "done" | "active" | "pending" | "failed" | "returned";
type MilestoneRow = {
  key: string;
  label: string;
  status: MilestoneStatus;
  at: string | null;
  note?: string;
};

function formatStamp(at?: string | null): string | null {
  if (!at) return null;
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DeliveryMilestones({ shipment }: { shipment: Shipment }) {
  const current = shipment.driverStage ?? "assigned";
  const isFail = current === "failed" || current === "returned";

  const byStage = new Map<DriverStage, { at: string; note?: string }>();
  for (const e of shipment.timeline ?? []) {
    byStage.set(e.stage, { at: e.at, note: e.note });
  }

  let rows: MilestoneRow[];
  if (isFail) {
    rows = MAIN_PATH.filter((s) => byStage.has(s)).map((s) => ({
      key: s,
      label: STAGE_LABEL[s],
      status: "done",
      at: byStage.get(s)!.at,
      note: byStage.get(s)!.note,
    }));
    const term = byStage.get(current);
    rows.push({
      key: current,
      label: STAGE_LABEL[current],
      status: current === "failed" ? "failed" : "returned",
      at: term?.at ?? null,
      note: term?.note,
    });
  } else {
    const currentIndex = MAIN_PATH.indexOf(current);
    rows = MAIN_PATH.map((s, i) => {
      const entry = byStage.get(s);
      return {
        key: s,
        label: STAGE_LABEL[s],
        status: i < currentIndex ? "done" : i === currentIndex ? "active" : "pending",
        at: entry?.at ?? (s === "assigned" ? shipment.createdAt : null),
        note: entry?.note,
      };
    });
  }

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center gap-2">
        <RouteIcon size={17} className="text-[var(--teal)]" />
        <h3 className="text-sm font-black text-[var(--text)]">Delivery Milestones</h3>
      </div>

      <ol className="mt-4">
        {rows.map((row, i) => {
          const last = i === rows.length - 1;
          return (
            <li key={row.key} className="relative flex gap-3.5">
              <div className="flex flex-col items-center">
                <MilestoneIcon status={row.status} />
                {!last && (
                  <span
                    className={`min-h-9 w-0.5 flex-1 ${
                      row.status === "done" ? "bg-[#1E9E4C]" : "bg-[var(--border)]"
                    }`}
                  />
                )}
              </div>
              <div className={last ? "" : "pb-6"}>
                <p
                  className={`text-sm font-bold ${
                    row.status === "pending"
                      ? "text-[var(--text-muted)]"
                      : "text-[var(--text)]"
                  }`}
                >
                  {row.label}
                </p>
                <MilestoneSubtitle row={row} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function MilestoneIcon({ status }: { status: MilestoneStatus }) {
  if (status === "done") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E9E4C] text-white">
        <CheckCircle2 size={15} />
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--accent)] bg-[var(--accent-soft)]">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FBE4E1] text-[#D0453A]">
        <AlertTriangle size={14} />
      </span>
    );
  }
  if (status === "returned") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--text-soft)]">
        <Undo2 size={14} />
      </span>
    );
  }
  return (
    <span className="h-7 w-7 rounded-full border-2 border-[var(--border)] bg-[var(--surface)]" />
  );
}

function MilestoneSubtitle({ row }: { row: MilestoneRow }) {
  const stamp = formatStamp(row.at);
  if (row.status === "pending") {
    return (
      <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
        Pending completion
      </p>
    );
  }
  if (row.status === "active") {
    return (
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {stamp && (
          <span className="flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)]">
            <Clock size={12} />
            {stamp}
          </span>
        )}
        <span className="inline-flex rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[var(--accent-strong)]">
          Action required
        </span>
      </div>
    );
  }
  return (
    <div className="mt-0.5 space-y-0.5">
      {stamp && (
        <p className="flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)]">
          <Clock size={12} />
          {stamp}
        </p>
      )}
      {row.note && <p className="text-xs text-[var(--text-muted)]">{row.note}</p>}
    </div>
  );
}

function serviceLabel(service: string): string {
  return service.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function DeliveryDetails({ shipment }: { shipment: Shipment }) {
  const isCod = shipment.paymentMethod === "cod";
  const d = shipment.package.dimensions;
  const dimStr = [d.length, d.width, d.height].filter(Boolean).join(" × ");
  const parcelBits = [
    `${shipment.package.parcelType}`,
    shipment.package.weight ? `${shipment.package.weight} kg` : null,
    `${shipment.package.quantity} pkg`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center gap-2">
        <ClipboardList size={17} className="text-[var(--teal)]" />
        <h3 className="text-sm font-black text-[var(--text)]">Delivery Details</h3>
      </div>

      <div className="mt-4 space-y-4">
        <DetailBlock icon={<UserIcon size={15} />} label="Recipient">
          <p className="text-sm font-bold text-[var(--text)]">
            {shipment.delivery.recipientName || "—"}
          </p>
          {shipment.delivery.phoneNumber && (
            <p className="text-xs font-medium text-[var(--text-muted)]">
              {shipment.delivery.phoneNumber}
            </p>
          )}
        </DetailBlock>

        <DetailBlock icon={<MapPin size={15} />} label="Deliver To">
          <p className="text-sm font-semibold text-[var(--text)]">
            {fmtAddress(shipment.delivery)}
          </p>
        </DetailBlock>

        <DetailBlock icon={<MapPin size={15} />} label="Pickup From">
          <p className="text-sm font-semibold text-[var(--text)]">
            {fmtAddress(shipment.pickup)}
          </p>
        </DetailBlock>

        <DetailBlock icon={<Package size={15} />} label="Parcel">
          <p className="text-sm font-bold capitalize text-[var(--text)]">{parcelBits}</p>
          {dimStr && (
            <p className="text-xs font-medium text-[var(--text-muted)]">{dimStr} cm</p>
          )}
        </DetailBlock>

        <div className="space-y-2 border-t border-[var(--border)] pt-3">
          <DetailRow label="Service" value={serviceLabel(shipment.service)} />
          <DetailRow label="Payment" value={isCod ? "Cash on Delivery" : "Prepaid"} />
          <DetailRow label="Amount" value={formatNPR(shipment.amount)} />
          <DetailRow label="Tracking ID" value={`#${shipment.trackingId}`} />
        </div>

        {(shipment.insurance ||
          shipment.specialHandling ||
          shipment.package.parcelType === "fragile") && (
          <div className="flex flex-wrap gap-2">
            {shipment.package.parcelType === "fragile" && (
              <DetailBadge className="bg-[#FBE4E1] text-[#D0453A]">Fragile</DetailBadge>
            )}
            {shipment.insurance && (
              <DetailBadge className="bg-[#DEF3E6] text-[#1E9E4C]">Insured</DetailBadge>
            )}
            {shipment.specialHandling && (
              <DetailBadge className="bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                Special Handling
              </DetailBadge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailBlock({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 shrink-0 text-[var(--teal)]">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-bold text-[var(--text)]">{value}</span>
    </div>
  );
}

function DetailBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}
