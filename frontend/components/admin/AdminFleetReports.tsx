"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Fuel, Loader2, Wrench } from "lucide-react";
import {
  adminCreateWorkOrder,
  adminGetFuelExpenses,
  adminGetIncidents,
  adminGetWorkOrders,
  FUEL_EXPENSE_STATUSES,
  INCIDENT_STATUSES,
  MAINTENANCE_WORK_ORDER_STATUSES,
  type AdminFuelExpense,
  type AdminIncident,
  type MaintenanceWorkOrder,
} from "@/lib/api/fleetReports.api";
import { adminGetUsers } from "@/lib/api/admin.api";
import type { AuthUser } from "@/lib/api/auth.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import {
  FuelExpenseRow,
  IncidentRow,
} from "@/components/admin/fleetReportShared";
import AdminWorkOrderRow from "@/components/admin/MaintenanceWorkOrderRow";
import Modal from "@/components/ui/Modal";

type Tab = "incidents" | "workOrders" | "fuel";

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
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>([]);
  const [fuel, setFuel] = useState<AdminFuelExpense[]>([]);
  const [maintenanceUsers, setMaintenanceUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<AdminIncident | null>(
    null,
  );
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [maintenanceUserId, setMaintenanceUserId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [priority, setPriority] = useState("medium");
  const [expectedCompletionAt, setExpectedCompletionAt] = useState("");
  const [vehicleOutOfService, setVehicleOutOfService] = useState(true);
  const [adminNote, setAdminNote] = useState("");

  const load = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        if (tab === "incidents") {
          const response = await adminGetIncidents(token, { status });
          setIncidents(response.data);
        } else if (tab === "workOrders") {
          const response = await adminGetWorkOrders(token, { status });
          setWorkOrders(response.data);
        } else {
          const response = await adminGetFuelExpenses(token, { status });
          setFuel(response.data);
        }
        setError(null);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Failed to load fleet reports");
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

  useEffect(() => {
    const loadMaintenanceUsers = async () => {
      try {
        const response = await adminGetUsers(
          token,
          1,
          200,
          "",
          "maintenance",
        );
        setMaintenanceUsers(response.data);
      } catch {
        setMaintenanceUsers([]);
      }
    };
    void loadMaintenanceUsers();
  }, [token]);

  useAutoRefresh(() => load(true), { intervalMs: 15_000 });

  const openWorkOrder = (incident: AdminIncident) => {
    setSelectedIncident(incident);
    setMaintenanceUserId("");
    setVendorName("");
    setPriority(
      incident.severity === "critical" || incident.severity === "high"
        ? "high"
        : "medium",
    );
    setExpectedCompletionAt("");
    setVehicleOutOfService(true);
    setAdminNote("");
    setCreateError(null);
  };

  const closeWorkOrderModal = () => {
    if (creating) return;
    setSelectedIncident(null);
  };

  const createWorkOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedIncident) return;
    if (!maintenanceUserId && !vendorName.trim()) {
      setCreateError("Assign a maintenance user or enter an external workshop.");
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      await adminCreateWorkOrder(token, selectedIncident.id, {
        maintenanceUserId: maintenanceUserId || null,
        vendorName: vendorName.trim(),
        priority:
          priority === "low" ||
          priority === "medium" ||
          priority === "high" ||
          priority === "critical"
            ? priority
            : "medium",
        expectedCompletionAt,
        vehicleOutOfService,
        adminNote: adminNote.trim(),
      });
      setSelectedIncident(null);
      await load(true);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create work order",
      );
    } finally {
      setCreating(false);
    }
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    setStatus("");
  };

  const filters =
    tab === "incidents"
      ? INCIDENT_STATUSES
      : tab === "workOrders"
        ? MAINTENANCE_WORK_ORDER_STATUSES
        : FUEL_EXPENSE_STATUSES;
  const emptyLabel =
    tab === "incidents"
      ? "incident reports"
      : tab === "workOrders"
        ? "maintenance work orders"
        : "fuel expenses";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--teal)]">
          Fleet
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--text)] sm:text-3xl">
          Fleet Reports
        </h1>
        <p className="mt-1 text-sm font-medium text-[var(--text-muted)]">
          Review driver reports, assign maintenance, and verify completed repairs.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "incidents" as const, label: "Incidents", Icon: AlertTriangle },
          { key: "workOrders" as const, label: "Maintenance", Icon: Wrench },
          { key: "fuel" as const, label: "Fuel Expenses", Icon: Fuel },
        ].map((item) => {
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => switchTab(item.key)}
              className={[
                "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold",
                active
                  ? "bg-[var(--teal)] text-white"
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
            onClick={() => setStatus(value)}
            className={[
              "rounded-full px-3.5 py-1.5 text-xs font-bold",
              status === value
                ? "bg-[var(--teal)] text-white"
                : "border border-[var(--border)] text-[var(--text-muted)]",
            ].join(" ")}
          >
            {filterLabel(value)}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-[#F3C6BF] bg-[#FBE4E1] px-4 py-3 text-sm font-semibold text-[#D0453A]">
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
      ) : tab === "workOrders" && workOrders.length === 0 ? (
        <Empty icon={Wrench} label={emptyLabel} status={status} />
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
                onCreateWorkOrder={openWorkOrder}
              />
            ))}
          {tab === "workOrders" &&
            workOrders.map((workOrder) => (
              <AdminWorkOrderRow
                key={workOrder.id}
                token={token}
                workOrder={workOrder}
                maintenanceUsers={maintenanceUsers}
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

      <Modal
        isOpen={Boolean(selectedIncident)}
        onClose={closeWorkOrderModal}
        title="Create Maintenance Work Order"
      >
        <form onSubmit={createWorkOrder} className="space-y-4">
          {selectedIncident && (
            <div className="border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-3 text-sm">
              <p className="font-bold capitalize text-[var(--text)]">
                {selectedIncident.category} issue - {selectedIncident.vehicleRegistration ?? "Vehicle"}
              </p>
              <p className="mt-1 text-[var(--text-muted)]">
                {selectedIncident.description}
              </p>
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[var(--text-muted)]">
              Maintenance user
            </span>
            <select
              value={maintenanceUserId}
              onChange={(event) => setMaintenanceUserId(event.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--teal)]"
            >
              <option value="">External workshop</option>
              {maintenanceUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[var(--text-muted)]">
              External workshop
            </span>
            <input
              value={vendorName}
              disabled={Boolean(maintenanceUserId)}
              onChange={(event) => setVendorName(event.target.value)}
              placeholder="Workshop or vendor name"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--teal)] disabled:opacity-50"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-xs font-bold text-[var(--text-muted)]">
                Priority
              </span>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--teal)]"
              >
                {["low", "medium", "high", "critical"].map((value) => (
                  <option key={value} value={value}>
                    {filterLabel(value)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-bold text-[var(--text-muted)]">
                Expected completion
              </span>
              <input
                type="date"
                value={expectedCompletionAt}
                onChange={(event) => setExpectedCompletionAt(event.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--teal)]"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[var(--text-muted)]">
              Admin note
            </span>
            <textarea
              value={adminNote}
              onChange={(event) => setAdminNote(event.target.value)}
              rows={3}
              className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-medium text-[var(--text)] outline-none focus:border-[var(--teal)]"
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-soft)]">
            <input
              type="checkbox"
              checked={vehicleOutOfService}
              onChange={(event) => setVehicleOutOfService(event.target.checked)}
            />
            Vehicle is unavailable while this work is open
          </label>

          {createError && (
            <p className="text-sm font-semibold text-[#D0453A]">{createError}</p>
          )}

          <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={closeWorkOrderModal}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-bold text-[var(--text-soft)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--teal)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {creating && <Loader2 size={15} className="animate-spin" />}
              Create work order
            </button>
          </div>
        </form>
      </Modal>
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