"use client";

import Image from "next/image";
import {
  Search,
  Bell,
  HelpCircle,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  Phone,
  Flag,
  Weight,
  Ruler,
  ShieldCheck,
} from "lucide-react";

interface JourneyStep {
  id: string;
  time: string;
  title: string;
  description: string;
  state: "done" | "live" | "pending";
}

const journey: JourneyStep[] = [
  {
    id: "processed",
    time: "SEP 12, 09:15 AM",
    title: "Order Processed",
    description: "Warehouse Alpha, Austin TX",
    state: "done",
  },
  {
    id: "departed",
    time: "SEP 12, 02:30 PM",
    title: "Departed Facility",
    description: "Regional Sorting Hub, San Jose",
    state: "done",
  },
  {
    id: "transit",
    time: "IN TRANSIT - LIVE",
    title: "Out for Delivery",
    description: "Estimated arrival at your location in 24 minutes.",
    state: "live",
  },
  {
    id: "delivered",
    time: "PROJECTED: TODAY, 04:30 PM",
    title: "Delivered",
    description: "Final Destination, Residential Area 4",
    state: "pending",
  },
];

const parcelDetails = [
  { id: "weight", label: "Weight", value: "1.2 kg", icon: Weight },
  { id: "dimensions", label: "Dimensions", value: "30 × 20 × 15 cm", icon: Ruler },
  { id: "insurance", label: "Insurance", value: "Standard Plus", icon: ShieldCheck },
];

export default function TrackingPanel() {
  return (
    <div className="space-y-6">
      {/* Top search bar */}
      <div className="flex items-center gap-4">
        <div className="relative mx-auto w-full max-w-xl">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            defaultValue="SL-883-294-001"
            className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-11 pr-28 text-sm font-medium text-[var(--text)] shadow-sm outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(200,162,74,0.18)]"
            placeholder="Enter tracking number"
          />
          <button
            type="button"
            className="absolute right-1.5 top-1/2 flex h-9 -translate-y-1/2 items-center rounded-lg bg-[var(--accent)] px-4 text-sm font-bold text-[var(--text-on-accent)] transition-colors hover:bg-[var(--accent-hover)]"
          >
            Track Now
          </button>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            className="rounded-xl p-2.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
          <button
            type="button"
            className="rounded-xl p-2.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
            aria-label="Help"
          >
            <HelpCircle size={20} />
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Map */}
        <div className="relative h-[520px] overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm lg:col-span-3">
          <Image
            src="/mock_route_map.png"
            alt="Live shipment map"
            fill
            sizes="(max-width: 1024px) 100vw, 640px"
            className="object-cover"
          />

          {/* Route markers */}
          <div className="absolute left-[28%] top-[26%] flex h-9 w-9 items-center justify-center rounded-full bg-[#8B5CF6] text-white shadow-lg ring-4 ring-white/70">
            <Package size={16} />
          </div>
          <div className="absolute right-[16%] top-[40%] flex h-9 w-9 items-center justify-center rounded-full bg-[#8B5CF6] text-white shadow-lg ring-4 ring-white/70">
            <Package size={16} />
          </div>
          <div className="absolute bottom-[26%] right-[34%] flex h-9 w-9 items-center justify-center rounded-full bg-[var(--success)] text-white shadow-lg ring-4 ring-white/70">
            <Truck size={16} />
          </div>

          {/* Floating delivery card */}
          <div className="absolute bottom-4 left-4 w-[260px] rounded-2xl border border-[var(--border)] bg-white/95 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Estimated Delivery
              </p>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                <Clock size={14} />
              </span>
            </div>
            <p className="mt-1 text-2xl font-extrabold text-[var(--text)]">
              Today, 4:30 PM
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-3">
              <div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Current Velocity
                </p>
                <p className="text-sm font-bold text-[var(--text)]">34 mph</p>
              </div>
              <div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Remaining Distance
                </p>
                <p className="text-sm font-bold text-[var(--text)]">12.4 miles</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-white py-2 text-xs font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-soft)]"
              >
                <Flag size={13} />
                Report Issue
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-1.5 rounded-lg bg-[#1D7A8C] py-2 text-xs font-bold text-white transition-colors hover:bg-[#15656e]"
              >
                <Phone size={13} />
                Call Driver
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Shipment Journey */}
          <div className="card p-6">
            <h2 className="text-base font-bold text-[var(--accent-strong)]">
              Shipment Journey
            </h2>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              Order #9923847-BC
            </p>

            <ol className="mt-6 space-y-1">
              {journey.map((step, index) => {
                const isLast = index === journey.length - 1;
                return (
                  <li key={step.id} className="relative flex gap-4">
                    {/* Rail */}
                    <div className="flex flex-col items-center">
                      {step.state === "done" && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1D7A8C] text-white">
                          <CheckCircle2 size={16} />
                        </span>
                      )}
                      {step.state === "live" && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1D7A8C] text-white ring-4 ring-[rgba(29,122,140,0.18)]">
                          <Truck size={14} />
                        </span>
                      )}
                      {step.state === "pending" && (
                        <span className="h-6 w-6 rounded-full border-2 border-[var(--border-strong)] bg-[var(--surface)]" />
                      )}
                      {!isLast && (
                        <span
                          className={`my-1 w-0.5 flex-1 ${
                            step.state === "pending"
                              ? "bg-[var(--border)]"
                              : "bg-[#1D7A8C]"
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                      {step.state === "live" ? (
                        <div className="rounded-xl border-l-4 border-[var(--accent)] bg-[var(--accent-soft)] px-4 py-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-strong)]">
                            {step.time}
                          </p>
                          <p className="mt-0.5 text-sm font-bold text-[var(--text)]">
                            {step.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                            {step.description}
                          </p>
                        </div>
                      ) : (
                        <>
                          <p
                            className={`text-[11px] font-bold uppercase tracking-wider ${
                              step.state === "pending"
                                ? "text-[var(--text-faint)]"
                                : "text-[var(--text-muted)]"
                            }`}
                          >
                            {step.time}
                          </p>
                          <p
                            className={`mt-0.5 text-sm font-bold ${
                              step.state === "pending"
                                ? "text-[var(--text-muted)]"
                                : "text-[var(--text)]"
                            }`}
                          >
                            {step.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                            {step.description}
                          </p>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Parcel Details */}
          <div className="card p-6">
            <h2 className="text-base font-bold text-[var(--text)]">
              Parcel Details
            </h2>
            <dl className="mt-4 space-y-3">
              {parcelDetails.map((detail) => {
                const Icon = detail.icon;
                return (
                  <div
                    key={detail.id}
                    className="flex items-center justify-between"
                  >
                    <dt className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <Icon size={16} className="text-[var(--accent)]" />
                      {detail.label}
                    </dt>
                    <dd className="text-sm font-bold text-[var(--text)]">
                      {detail.value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
