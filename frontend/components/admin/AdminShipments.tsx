"use client";

import { useState } from "react";
import {
  Search,
  Package,
  TrendingUp,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  SlidersHorizontal,
  ChevronDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  Minus,
} from "lucide-react";

type ShipmentStatus = "in-transit" | "pending" | "exception" | "delivered";

interface ShipmentRow {
  id: string;
  customer: string;
  account: string;
  destination: string;
  status: ShipmentStatus;
  statusLabel: string;
  location: string;
  eta: string;
  etaSub?: string;
}

const STAT_CARDS = [
  {
    label: "Total Shipments",
    value: "1,284",
    delta: "+12%",
    deltaTone: "success" as const,
    icon: Package,
  },
  {
    label: "In Transit",
    value: "412",
    delta: null,
    icon: TrendingUp,
  },
  {
    label: "Pending Dispatch",
    value: "89",
    delta: null,
    icon: ClipboardList,
  },
  {
    label: "Delayed",
    value: "24",
    delta: null,
    icon: AlertTriangle,
    alert: true,
  },
  {
    label: "Completed",
    value: "759",
    delta: null,
    icon: CheckCircle2,
    done: true,
  },
];

const SHIPMENTS: ShipmentRow[] = [
  {
    id: "SHP-920381",
    customer: "Global Dynamics Inc.",
    account: "44921",
    destination: "Munich, DE",
    status: "in-transit",
    statusLabel: "In Transit",
    location: "Frankfurt Hub (FRA)",
    eta: "Oct 24,",
    etaSub: "14:00",
  },
  {
    id: "SHP-920442",
    customer: "NexGen Robotics",
    account: "33812",
    destination: "Tokyo, JP",
    status: "pending",
    statusLabel: "Pending",
    location: "San Jose WH",
    eta: "Oct 28,",
    etaSub: "09:30",
  },
  {
    id: "SHP-919223",
    customer: "Stellar Logistics",
    account: "12005",
    destination: "Chicago, US",
    status: "exception",
    statusLabel: "Exception",
    location: "Denver Rail Yard",
    eta: "Delayed",
    etaSub: "(TBD)",
  },
  {
    id: "SHP-918804",
    customer: "Artemis Healthcare",
    account: "99420",
    destination: "London, UK",
    status: "delivered",
    statusLabel: "Delivered",
    location: "Heathrow Terminal 4",
    eta: "Delivered",
    etaSub: "Oct 22",
  },
];

const STATUS_STYLES: Record<ShipmentStatus, string> = {
  "in-transit": "bg-[var(--teal-tint)] text-[var(--teal)]",
  pending: "bg-[var(--accent-soft)] text-[var(--gold-dark)]",
  exception: "bg-[rgba(181,71,59,0.1)] text-[var(--danger)]",
  delivered: "bg-[rgba(95,127,53,0.1)] text-[var(--success)]",
};

export default function AdminShipments() {
  const [page, setPage] = useState(1);
  const totalPages = 129;

  return (
    <div className="space-y-6 font-sans">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="page-kicker">Operations</span>
          <h1 className="page-title mt-1">Shipments</h1>
          <p className="page-subtitle">Monitor every shipment moving across the network in real time.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`relative overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--surface)] p-5 ${
                card.alert
                  ? "border-[var(--border)] border-l-4 border-l-[var(--danger)]"
                  : "border-[var(--border)]"
              }`}
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {card.label}
                </span>
                <Icon
                  size={18}
                  className={`shrink-0 stroke-[2.5] ${
                    card.alert
                      ? "text-[var(--danger)]"
                      : card.done
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-muted)]"
                  }`}
                />
              </div>
              <div className="mt-3 flex items-end gap-2">
                <h3 className="text-2xl font-black leading-none tracking-tight text-[var(--text)]">
                  {card.value}
                </h3>
                {card.delta && (
                  <span className="mb-0.5 rounded-full bg-[rgba(95,127,53,0.1)] px-2 py-0.5 text-xs font-bold text-[var(--success)]">
                    {card.delta}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter / search bar */}
      <div className="card flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-muted)]">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by Shipment ID, Customer, or Destination..."
            className="form-input pl-10"
            suppressHydrationWarning
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-secondary btn-sm cursor-pointer" suppressHydrationWarning>
            Status: All
            <ChevronDown size={15} className="text-[var(--text-muted)]" />
          </button>
          <button type="button" className="btn-secondary btn-sm cursor-pointer" suppressHydrationWarning>
            Carrier: All
            <ChevronDown size={15} className="text-[var(--text-muted)]" />
          </button>
          <button type="button" className="btn-secondary btn-sm cursor-pointer" suppressHydrationWarning>
            <Calendar size={16} className="text-[var(--text-muted)]" />
            Date Range
          </button>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-soft)] transition-colors hover:bg-[var(--app-bg-soft)] cursor-pointer"
            aria-label="More filters"
            suppressHydrationWarning
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Shipments table */}
      <div className="card overflow-hidden">
        <div className="table-wrap rounded-none border-none shadow-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Customer</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Location</th>
                <th>Est. Delivery</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {SHIPMENTS.map((row) => (
                <tr key={row.id}>
                  <td className="font-bold text-[var(--teal)]">{row.id}</td>
                  <td>
                    <div className="font-bold text-[var(--text)]">{row.customer}</div>
                    <div className="text-xs font-medium text-[var(--text-muted)]">
                      Acct: {row.account}
                    </div>
                  </td>
                  <td className="text-sm font-medium text-[var(--text-soft)]">
                    {row.destination}
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${STATUS_STYLES[row.status]}`}
                    >
                      {row.statusLabel}
                    </span>
                  </td>
                  <td className="text-sm font-medium text-[var(--text-soft)]">
                    {row.location}
                  </td>
                  <td>
                    <div
                      className={`text-sm font-semibold ${
                        row.status === "exception" ? "text-[var(--danger)]" : "text-[var(--text)]"
                      }`}
                    >
                      {row.eta}
                    </div>
                    {row.etaSub && (
                      <div className="text-xs font-medium text-[var(--text-muted)]">
                        {row.etaSub}
                      </div>
                    )}
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)] cursor-pointer"
                      aria-label="Row actions"
                      suppressHydrationWarning
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] p-4 sm:flex-row sm:px-6">
          <p className="text-sm text-[var(--text-muted)]">
            Showing <span className="font-semibold text-[var(--text)]">1</span> to{" "}
            <span className="font-semibold text-[var(--text)]">10</span> of{" "}
            <span className="font-semibold text-[var(--text)]">1,284</span> results
          </p>
          <nav className="inline-flex items-center gap-1" aria-label="Pagination">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              aria-label="Previous page"
              suppressHydrationWarning
            >
              <ChevronLeft size={16} />
            </button>
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPage(num)}
                className={`min-w-9 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all cursor-pointer ${
                  page === num
                    ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--text-on-accent)]"
                    : "border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
                }`}
                suppressHydrationWarning
              >
                {num}
              </button>
            ))}
            <span className="px-1 text-sm font-semibold text-[var(--text-muted)]">…</span>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              className={`min-w-9 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-all cursor-pointer ${
                page === totalPages
                  ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--text-on-accent)]"
                  : "border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
              }`}
              suppressHydrationWarning
            >
              {totalPages}
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-[var(--border)] p-2 text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              aria-label="Next page"
              suppressHydrationWarning
            >
              <ChevronRight size={16} />
            </button>
          </nav>
        </div>
      </div>

      {/* Bottom row: live network map + recent alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Live network overview */}
        <div
          className="relative col-span-1 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-dark)] lg:col-span-2"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-dark-2)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
            Live Network Overview
          </div>

          {/* Stylized map */}
          <div className="relative h-72 w-full select-none">
            <svg className="absolute inset-0 h-full w-full opacity-35" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="net-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--app-bg)" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#net-grid)" />
              <path d="M -10 120 Q 180 40 360 160 T 720 100" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="6,6" />
              <path d="M 80 -20 L 220 280" fill="none" stroke="var(--teal)" strokeWidth="1.5" />
              <path d="M 420 -20 Q 500 120 640 240" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeDasharray="4,4" />
            </svg>

            <div className="absolute left-[22%] top-[42%] text-[var(--accent)]">
              <MapPin size={24} className="fill-[var(--accent)]/20" />
            </div>
            <div className="absolute left-[58%] top-[28%] text-[var(--teal)]">
              <MapPin size={24} className="fill-[var(--teal)]/20" />
            </div>
            <div className="absolute left-[74%] top-[58%] text-[var(--accent)]">
              <MapPin size={24} className="fill-[var(--accent)]/20" />
            </div>

            {/* Zoom controls */}
            <div
              className="absolute right-3 top-3 flex flex-col rounded-lg border border-[var(--border-dark)] bg-[var(--surface-dark-2)] p-0.5"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <button type="button" className="rounded-md p-1.5 text-white transition-all hover:bg-white/10 cursor-pointer" suppressHydrationWarning>
                <Plus size={14} className="stroke-[2.5]" />
              </button>
              <div className="mx-1 h-px bg-[var(--border-dark)]" />
              <button type="button" className="rounded-md p-1.5 text-white transition-all hover:bg-white/10 cursor-pointer" suppressHydrationWarning>
                <Minus size={14} className="stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent alerts */}
        <div
          className="col-span-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          <h3 className="mb-4 text-lg font-extrabold text-[var(--text)]">Recent Alerts</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--danger)]" />
              <div>
                <p className="text-sm font-bold text-[var(--text)]">
                  Weather Alert: Atlantic Crossing
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--text-soft)]">
                  Storm front expected to delay vessels SHP-919 and SHP-882 by 12–18 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
