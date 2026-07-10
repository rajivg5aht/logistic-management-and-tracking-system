"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Fuel } from "lucide-react";
import {
  adminGetIncidents,
  adminGetFuelExpenses,
  INCIDENT_STATUSES,
  FUEL_EXPENSE_STATUSES,
  type AdminIncident,
  type AdminFuelExpense,
} from "@/lib/api/fleetReports.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import {
  IncidentRow,
  FuelExpenseRow,
} from "@/components/admin/fleetReportShared";

type Tab = "incidents" | "fuel";

const INCIDENT_FILTERS = ["", ...INCIDENT_STATUSES] as const;
const FUEL_FILTERS = ["", ...FUEL_EXPENSE_STATUSES] as const;

function filterLabel(value: string): string {
  return value === "" ? "All" : value.charAt(0).toUpperCase() + value.slice(1);
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
          const res = await adminGetIncidents(token, { status });
          setIncidents(res.data);
        } else {
          const res = await adminGetFuelExpenses(token, { status });
          setFuel(res.data);
        }
        setError(null);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Failed to load reports");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token, tab, status],
  );

  useEffect(() => {
    void load();
  }, [load]);

  useAutoRefresh(() => load(true), { intervalMs: 15_000 });

  const filters = tab === "incidents" ? INCIDENT_FILTERS : FUEL_FILTERS;
  const items = tab === "incidents" ? incidents : fuel;

  const switchTab = (next: Tab) => {
    setTab(next);
    setStatus("");
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--teal)]">
          Fleet
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--text)] sm:text-3xl">
          Fleet Reports
        </h1>
        <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
          Vehicle issues and fuel expenses submitted by drivers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(
          [
            { key: "incidents", label: "Incidents", Icon: AlertTriangle },
            { key: "fuel", label: "Fuel Expenses", Icon: Fuel },
          ] as const
        ).map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => switchTab(t.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
                active
                  ? "bg-[var(--teal)] text-white"
                  : "border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
              }`}
            >
              <t.Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = status === f;
          return (
            <button
              key={f || "all"}
              type="button"
              onClick={() => setStatus(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                active
                  ? "bg-[var(--text)] text-[var(--surface)]"
                  : "border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
              }`}
            >
              {filterLabel(f)}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-xl border border-[#F3C6BF] bg-[#FBE4E1] px-4 py-3 text-sm font-semibold text-[#D0453A]">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--text-muted)]">
            {tab === "incidents" ? <AlertTriangle size={22} /> : <Fuel size={22} />}
          </div>
          <p className="mt-3 text-sm font-medium text-[var(--text-muted)]">
            No {tab === "incidents" ? "incident reports" : "fuel expenses"}
            {status ? ` with status “${filterLabel(status)}”` : ""}.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tab === "incidents"
            ? incidents.map((inc) => (
                <IncidentRow
                  key={inc.id}
                  incident={inc}
                  token={token}
                  onChanged={() => load(true)}
                />
              ))
            : fuel.map((f) => (
                <FuelExpenseRow
                  key={f.id}
                  expense={f}
                  token={token}
                  onChanged={() => load(true)}
                />
              ))}
        </ul>
      )}
    </div>
  );
}
