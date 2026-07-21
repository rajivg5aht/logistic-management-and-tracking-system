"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Fuel } from "lucide-react";
import {
  adminGetFuelExpenses,
  adminGetIncidents,
  FUEL_EXPENSE_STATUSES,
  INCIDENT_STATUSES,
  type AdminFuelExpense,
  type AdminIncident,
} from "@/lib/api/fleetReports.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import {
  FuelExpenseRow,
  IncidentRow,
} from "@/components/admin/fleetReportShared";

type Tab = "incidents" | "fuel";

function filterLabel(value: string): string {
  if (value === "") return "All";
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AdminFleetReports({ token }: { token: string }) {
  const [tab, setTab] = useState<Tab>("incidents");
  const [status, setStatus] = useState("");
  const [incidents, setIncidents] = useState<AdminIncident[]>([]);
  const [fuel, setFuel] = useState<AdminFuelExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        if (tab === "incidents") {
          const response = await adminGetIncidents(token, { status });
          setIncidents(response.data);
        } else {
          const response = await adminGetFuelExpenses(token, { status });
          setFuel(response.data);
        }
        setError(null);
      } catch (err) {
        if (!silent) {
          setError(
            err instanceof Error ? err.message : "Failed to load fleet reports",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [status, tab, token],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useAutoRefresh(() => load(true), { intervalMs: 15_000 });

  const switchTab = (next: Tab) => {
    setTab(next);
    setStatus("");
  };

  const filters = tab === "incidents" ? INCIDENT_STATUSES : FUEL_EXPENSE_STATUSES;
  const emptyLabel = tab === "incidents" ? "issue reports" : "fuel expenses";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--accent-strong)]">
          Fleet
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--text)] sm:text-3xl">
          Fleet Reports
        </h1>
        <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
          Review driver issue reports and fuel expenses.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "incidents" as const, label: "Issue Reports", Icon: AlertTriangle },
          { key: "fuel" as const, label: "Fuel Expenses", Icon: Fuel },
        ].map((item) => {
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              suppressHydrationWarning
              onClick={() => switchTab(item.key)}
              className={[
                "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold",
                active
                  ? "bg-[var(--accent)] text-[var(--text-on-accent)]"
                  : "border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)]",
              ].join(" ")}
            >
              <item.Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          suppressHydrationWarning
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
        {filters.map((value) => (
          <button
            key={value}
            type="button"
            suppressHydrationWarning
            onClick={() => setStatus(value)}
            className={[
              "rounded-full px-3.5 py-1.5 text-xs font-bold",
              status === value
                ? "bg-[var(--accent)] text-[var(--text-on-accent)]"
                : "border border-[var(--border)] text-[var(--text-muted)]",
            ].join(" ")}
          >
            {filterLabel(value)}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--surface)]"
            />
          ))}
        </div>
      ) : tab === "incidents" && incidents.length === 0 ? (
        <Empty icon={AlertTriangle} label={emptyLabel} status={status} />
      ) : tab === "fuel" && fuel.length === 0 ? (
        <Empty icon={Fuel} label={emptyLabel} status={status} />
      ) : (
        <ul className="space-y-3">
          {tab === "incidents" &&
            incidents.map((incident) => (
              <IncidentRow
                key={incident.id}
                incident={incident}
                token={token}
                onChanged={() => load(true)}
              />
            ))}
          {tab === "fuel" &&
            fuel.map((expense) => (
              <FuelExpenseRow
                key={expense.id}
                expense={expense}
                token={token}
                onChanged={() => load(true)}
              />
            ))}
        </ul>
      )}
    </div>
  );
}

function Empty({
  icon: Icon,
  label,
  status,
}: {
  icon: typeof AlertTriangle;
  label: string;
  status: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
      <Icon size={24} className="text-[var(--text-muted)]" />
      <p className="mt-3 text-sm font-medium text-[var(--text-muted)]">
        No {label}{status ? " with status " + filterLabel(status) : ""}.
      </p>
    </div>
  );
}
