"use client";

import { useState } from "react";
import {
  PlusCircle,
  ClipboardList,
  Truck,
  CircleCheckBig,
  XCircle,
  Filter,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* Screenshot-matched navy palette (shared app theme is gold/teal) */
const NAVY = "#0C3B67"; // headings + tracking ids
const NAVY_BTN = "#123E6B"; // primary action button

const STAT_CARDS = [
  {
    label: "Pending Orders",
    value: "142",
    delta: "+12% vs last week",
    up: true,
    Icon: ClipboardList,
    tint: "bg-[#E8F0FB] text-[#2E6FD6]",
  },
  {
    label: "In Transit",
    value: "389",
    delta: "+5% vs yesterday",
    up: true,
    Icon: Truck,
    tint: "bg-[#FBF1DC] text-[#C99A3D]",
  },
  {
    label: "Delivered Today",
    value: "1,054",
    delta: "98% Success Rate",
    up: true,
    Icon: CircleCheckBig,
    tint: "bg-[#E6F4EC] text-[#1F9D57]",
  },
  {
    label: "Failed / Cancelled",
    value: "18",
    delta: "-2% vs average",
    up: false,
    Icon: XCircle,
    tint: "bg-[#FBE9E5] text-[#D0533F]",
  },
];

const TABS = ["All Shipments", "Pending", "In Transit", "Delivered", "Cancelled"];

const PAYMENT_STYLES: Record<string, string> = {
  cod: "bg-[#EEF1F4] text-[#5A6B82]",
  prepaid: "bg-[#DEF3E6] text-[#1E9E4C]",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#FDECD8] text-[#C77718]",
  "in-transit": "bg-[#E4EEFB] text-[#2E6FD6]",
  delivered: "bg-[#DEF3E6] text-[#1E9E4C]",
  cancelled: "bg-[#FBE4E1] text-[#D0453A]",
};

interface ShipmentRow {
  id: string;
  created: string;
  sender: string;
  senderLoc: string;
  recipient: string;
  recipientLoc: string;
  payment: string;
  paymentTone: "cod" | "prepaid";
  amount: string;
  amountDanger?: boolean;
  status: string;
  statusTone: "pending" | "in-transit" | "delivered" | "cancelled";
  driver: string;
  driverInitials: string | null;
  driverTint: string | null;
}

const SHIPMENTS: ShipmentRow[] = [
  {
    id: "#LN-882910",
    created: "Created 2m ago",
    sender: "Kathmandu Tech Hub",
    senderLoc: "Balaju, KTM",
    recipient: "Sita Shrestha",
    recipientLoc: "Pokhara-17, Kaski",
    payment: "COD",
    paymentTone: "cod",
    amount: "NPR 4,500",
    status: "Pending",
    statusTone: "pending",
    driver: "Unassigned",
    driverInitials: null,
    driverTint: null,
  },
  {
    id: "#LN-882894",
    created: "Created 45m ago",
    sender: "Everest Gears Ltd",
    senderLoc: "Lalitpur Metro",
    recipient: "Nabin Gurung",
    recipientLoc: "Butwal-03, Rupandehi",
    payment: "PREPAID",
    paymentTone: "prepaid",
    amount: "NPR 12,800",
    status: "In Transit",
    statusTone: "in-transit",
    driver: "P. Tamang",
    driverInitials: "PT",
    driverTint: "bg-[#E8F0FB] text-[#2E6FD6]",
  },
  {
    id: "#LN-882855",
    created: "Created 2h ago",
    sender: "Organic Tea Co.",
    senderLoc: "Ilam, Koshi",
    recipient: "Binaya Thapa",
    recipientLoc: "Dhangadhi-01",
    payment: "PREPAID",
    paymentTone: "prepaid",
    amount: "NPR 1,200",
    status: "Delivered",
    statusTone: "delivered",
    driver: "A. Basnet",
    driverInitials: "AB",
    driverTint: "bg-[#E5F1F3] text-[#1D7A8C]",
  },
  {
    id: "#LN-882830",
    created: "Created 5h ago",
    sender: "Fashion Zone",
    senderLoc: "New Road, KTM",
    recipient: "Kiran Poudel",
    recipientLoc: "Bharatpur, Chitwan",
    payment: "COD",
    paymentTone: "cod",
    amount: "NPR 6,100",
    amountDanger: true,
    status: "Cancelled",
    statusTone: "cancelled",
    driver: "None",
    driverInitials: null,
    driverTint: null,
  },
];

export default function AdminShipments() {
  const [activeTab, setActiveTab] = useState("All Shipments");
  const [page, setPage] = useState(1);
  const totalPages = 250;

  return (
    <div className="space-y-6 font-sans">
      {/* ============ Page title + primary action ============ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color: NAVY }}>
            Shipment Management
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--text-soft)]">
            Manage and monitor logistics flow across all provinces.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-bold text-white transition-all hover:brightness-110 cursor-pointer self-start sm:self-auto"
          style={{ background: NAVY_BTN, boxShadow: "0 8px 20px rgba(18,62,107,0.22)" }}
          suppressHydrationWarning
        >
          <PlusCircle size={17} className="stroke-[2.4]" />
          Create Shipment
        </button>
      </div>

      {/* ============ KPI cards ============ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.Icon;
          return (
            <div
              key={card.label}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
              style={{ boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.tint}`}>
                  <Icon size={19} className="stroke-[2.4]" />
                </div>
                <span
                  className={`text-xs font-bold ${
                    card.up ? "text-[#17A34A]" : "text-[#E0533F]"
                  }`}
                >
                  {card.delta}
                </span>
              </div>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-[#5A6B82]">
                {card.label}
              </p>
              <h3 className="mt-0.5 text-2xl font-black tracking-tight" style={{ color: NAVY }}>
                {card.value}
              </h3>
            </div>
          );
        })}
      </div>

      {/* ============ Table card ============ */}
      <div
        className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]"
        style={{ boxShadow: "var(--shadow-sm)" }}
      >
        {/* Tabs + toolbar */}
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
                  activeTab === tab
                    ? "text-white"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                }`}
                style={activeTab === tab ? { backgroundColor: NAVY_BTN } : undefined}
                suppressHydrationWarning
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-secondary btn-sm cursor-pointer" suppressHydrationWarning>
              <Filter size={15} />
              More Filters
            </button>
            <button type="button" className="btn-secondary btn-sm cursor-pointer" suppressHydrationWarning>
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border-t border-[var(--border)]">
          <table className="w-full min-w-[64rem] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[var(--surface-soft)]">
                {["Tracking ID", "Sender", "Recipient", "Payment", "Amount", "Status", "Driver", ""].map(
                  (h, i) => (
                    <th
                      key={h || "actions"}
                      className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] ${
                        i === 7 ? "text-right" : ""
                      }`}
                    >
                      {i === 7 ? "Actions" : h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {SHIPMENTS.map((s) => (
                <tr
                  key={s.id}
                  className="border-t border-[var(--border-light)] transition-colors hover:bg-[var(--surface-soft)]"
                >
                  {/* Tracking ID */}
                  <td className="px-5 py-4">
                    <div className="font-bold" style={{ color: NAVY }}>
                      {s.id}
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">{s.created}</div>
                  </td>
                  {/* Sender */}
                  <td className="px-5 py-4">
                    <div className="font-bold text-[var(--text)]">{s.sender}</div>
                    <div className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">{s.senderLoc}</div>
                  </td>
                  {/* Recipient */}
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[var(--text)]">{s.recipient}</div>
                    <div className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">
                      {s.recipientLoc}
                    </div>
                  </td>
                  {/* Payment */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${PAYMENT_STYLES[s.paymentTone]}`}
                    >
                      {s.payment}
                    </span>
                  </td>
                  {/* Amount */}
                  <td className="px-5 py-4">
                    <span
                      className="font-bold"
                      style={{ color: s.amountDanger ? "#D0453A" : "var(--text)" }}
                    >
                      {s.amount}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[s.statusTone]}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  {/* Driver */}
                  <td className="px-5 py-4">
                    {s.driverInitials ? (
                      <span className="flex items-center gap-2">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${s.driverTint}`}
                        >
                          {s.driverInitials}
                        </span>
                        <span className="font-semibold text-[var(--text)]">{s.driver}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-[var(--text-muted)]">
                        <span className="h-7 w-7 rounded-full bg-[var(--surface-muted)]" />
                        <span className="font-medium italic">{s.driver}</span>
                      </span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)] cursor-pointer"
                      aria-label={`Actions for ${s.id}`}
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
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] p-4 sm:flex-row sm:px-5">
          <p className="text-sm text-[var(--text-muted)]">
            Showing <span className="font-bold text-[var(--text)]">1</span> to{" "}
            <span className="font-bold text-[var(--text)]">10</span> of{" "}
            <span className="font-bold text-[var(--text)]">2,492</span> entries
          </p>
          <nav className="inline-flex items-center gap-1.5" aria-label="Pagination">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
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
                className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-bold transition-all cursor-pointer ${
                  page === num
                    ? "border-transparent text-white"
                    : "border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
                }`}
                style={page === num ? { backgroundColor: NAVY_BTN } : undefined}
                suppressHydrationWarning
              >
                {num}
              </button>
            ))}
            <span className="px-1 text-sm font-semibold text-[var(--text-muted)]">…</span>
            <button
              type="button"
              onClick={() => setPage(totalPages)}
              className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-bold transition-all cursor-pointer ${
                page === totalPages
                  ? "border-transparent text-white"
                  : "border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
              }`}
              style={page === totalPages ? { backgroundColor: NAVY_BTN } : undefined}
              suppressHydrationWarning
            >
              {totalPages}
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              aria-label="Next page"
              suppressHydrationWarning
            >
              <ChevronRight size={16} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
