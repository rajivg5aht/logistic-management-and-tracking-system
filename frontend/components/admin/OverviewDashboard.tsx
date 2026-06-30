"use client";

import { useState } from "react";
import {
  DollarSign,
  Truck,
  Timer,
  ClipboardList,
  MoreVertical,
  MapPin,
  Plus,
  Minus
} from "lucide-react";

export default function OverviewDashboard() {
  const [chartMode, setChartMode] = useState<"week" | "month">("month");

  // Mock data for the bar chart
  const barData = [
    { tealHeight: 35, greyHeight: 65, isGold: false },
    { tealHeight: 55, greyHeight: 45, isGold: false },
    { tealHeight: 45, greyHeight: 55, isGold: false },
    { tealHeight: 75, greyHeight: 25, isGold: false },
    { tealHeight: 65, greyHeight: 35, isGold: false },
    { tealHeight: 85, greyHeight: 15, isGold: false },
    { tealHeight: 85, greyHeight: 15, isGold: false }, // Bar 7: Teal column
    { tealHeight: 70, greyHeight: 30, isGold: true }  // Bar 8: Gold column
  ];

  // Drivers list
  const drivers = [
    {
      name: "Marcus Jensen",
      rating: 4.9,
      deliveries: 124,
      status: "Active",
      isActive: true,
      initials: "MJ",
      avatarBg: "bg-[#E5F1F3] text-[#1D7A8C]"
    },
    {
      name: "Sarah Williams",
      rating: 4.8,
      deliveries: 118,
      status: "Active",
      isActive: true,
      initials: "SW",
      avatarBg: "bg-[#F3EBF9] text-[#6C63FF]"
    },
    {
      name: "David Chen",
      rating: 4.7,
      deliveries: 92,
      status: "Idle",
      isActive: false,
      initials: "DC",
      avatarBg: "bg-[#FDF6E2] text-[#D59B28]"
    },
    {
      name: "Elena Rodriguez",
      rating: 4.9,
      deliveries: 142,
      status: "Active",
      isActive: true,
      initials: "ER",
      avatarBg: "bg-[#EAE8EF] text-[#2D2D2D]"
    }
  ];

  // Recent shipments
  const shipments = [
    { id: "#SH-8842", destination: "Chicago, IL", status: "In Transit", statusType: "in-transit", eta: "14:20 PM" },
    { id: "#SH-8841", destination: "Austin, TX", status: "Pending", statusType: "pending", eta: "18:15 PM" },
    { id: "#SH-8840", destination: "Phoenix, AZ", status: "Delivered", statusType: "delivered", eta: "Completed" },
    { id: "#SH-8839", destination: "Denver, CO", status: "In Transit", statusType: "in-transit", eta: "Tomorrow" }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* 4 Stats Cards Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Monthly Revenue */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 transition-all relative overflow-hidden group" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Monthly Revenue
              </span>
              <h3 className="text-xl font-black text-[var(--text)] tracking-tight">
                $428,900
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--danger)] bg-[rgba(181,71,59,0.1)] px-2 py-0.5 rounded-full">
                +12.4%
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <DollarSign size={18} className="stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Active Shipments */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 transition-all relative overflow-hidden group" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Active Shipments
              </span>
              <h3 className="text-xl font-black text-[var(--text)] tracking-tight">
                1,284
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--success)] bg-[rgba(95,127,53,0.1)] px-2 py-0.5 rounded-full">
                +4.2%
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Truck size={18} className="stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Avg. Delivery Time */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 transition-all relative overflow-hidden group" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Avg. Delivery Time
              </span>
              <h3 className="text-xl font-black text-[var(--text)] tracking-tight">
                22.4 hrs
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#3E80E5] bg-[#EAF1FC] px-2 py-0.5 rounded-full">
                -2.1%
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Timer size={18} className="stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Warehouse Capacity */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 transition-all relative overflow-hidden group" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Warehouse Capacity
              </span>
              <h3 className="text-xl font-black text-[var(--text)] tracking-tight">
                84%
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-muted)] bg-[var(--surface-muted)] px-2 py-0.5 rounded-full">
                Stable
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <ClipboardList size={18} className="stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Revenue Chart & Top Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Shipments Chart Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 lg:col-span-2 flex flex-col justify-between" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-[var(--text)]">
                Revenue & Shipments
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                Real-time performance metrics
              </p>
            </div>
            {/* Week / Month Toggle */}
            <div className="flex bg-[var(--surface-muted)] p-1 rounded-xl border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setChartMode("week")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartMode === "week"
                    ? "bg-[var(--surface)] text-[var(--text)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                WEEK
              </button>
              <button
                type="button"
                onClick={() => setChartMode("month")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartMode === "month"
                    ? "bg-[var(--accent)] text-[var(--accent-strong)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                MONTH
              </button>
            </div>
          </div>

          {/* Stylized Bar Chart */}
          <div className="h-64 flex items-end justify-between px-4 pb-2 border-b border-[var(--border)] gap-2 relative">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-[var(--border-light)] pointer-events-none" />
            <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-[var(--border-light)] pointer-events-none" />
            <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-[var(--border-light)] pointer-events-none" />

            {barData.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full max-w-[42px]">
                {/* Column wrapper */}
                <div className="w-full rounded-md overflow-hidden flex flex-col justify-end h-full">
                   {/* Top segment (grey or light gold) */}
                   <div
                     style={{ height: `${bar.greyHeight}%` }}
                     className={`w-full transition-all duration-500 ${
                       bar.isGold ? "bg-[var(--accent-soft)]" : "bg-[var(--surface-muted)]"
                     }`}
                   />
                   {/* Bottom segment (teal or gold) */}
                   <div
                     style={{ height: `${bar.tealHeight}%` }}
                     className={`w-full transition-all duration-500 ${
                       bar.isGold
                         ? "bg-[var(--accent)]"
                         : "bg-[var(--teal)]"
                     }`}
                   />
                </div>
              </div>
            ))}
          </div>

          {/* Month/Week Labels */}
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-bold px-5 pt-3">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
          </div>
        </div>

        {/* Top Drivers Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 flex flex-col justify-between" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-extrabold text-[var(--text)]">
              Top Drivers
            </h3>
            <button type="button" className="text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer">
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Driver List */}
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {drivers.map((driver) => (
              <div key={driver.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${driver.avatarBg}`}>
                    {driver.initials}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-[var(--text)] leading-tight">
                      {driver.name}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-semibold flex items-center gap-1 mt-0.5">
                      <span className="text-[var(--accent)] font-bold">★</span> {driver.rating} • {driver.deliveries} Deliveries
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-extrabold ${
                  driver.isActive ? "text-[var(--teal)]" : "text-[var(--gold-dark)]"
                }`}>
                  {driver.status}
                </span>
              </div>
            ))}
          </div>

          {/* View All button */}
          <button
            type="button"
            className="w-full mt-5 border border-[var(--border)] text-[var(--accent-strong)] font-bold py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--surface-muted)] transition-all cursor-pointer text-sm"
          >
            View All Fleet
          </button>
        </div>
      </div>

      {/* Bottom Row: Recent Shipments & Live Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Shipments Table Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 lg:col-span-2" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-[var(--text)]">
              Recent Shipments
            </h3>
            <button
              type="button"
              className="text-xs font-extrabold text-[var(--accent)] hover:underline cursor-pointer"
            >
              Download CSV
            </button>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="pb-3 font-bold text-[var(--text)] w-24">ID</th>
                  <th className="pb-3 font-bold text-[var(--text-muted)]">DESTINATION</th>
                  <th className="pb-3 font-bold text-[var(--text-muted)] text-center w-32">STATUS</th>
                  <th className="pb-3 font-bold text-[var(--text-muted)] text-right w-24">ETA</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b border-[var(--border-light)] last:border-b-0 hover:bg-[var(--surface-soft)] transition-colors">
                    <td className="py-3.5 font-bold text-[var(--text)]">{shipment.id}</td>
                    <td className="py-3.5 text-[var(--text)] font-medium">{shipment.destination}</td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full ${
                        shipment.statusType === "delivered"
                          ? "bg-[rgba(95,127,53,0.1)] text-[var(--success)]"
                          : shipment.statusType === "pending"
                          ? "bg-[var(--accent-soft)] text-[var(--gold-dark)]"
                          : "bg-[#EAF1FC] text-[#3E80E5]"
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-semibold text-[var(--text)]">{shipment.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet Live Map Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 flex flex-col justify-between relative overflow-hidden group" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-[var(--text)]">
              Fleet Live Map
            </h3>
            {/* Live pulsing updates */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
              </span>
              Live Updates
            </div>
          </div>

          {/* Map Preview Graphic */}
          <div className="relative flex-1 h-48 bg-[var(--surface-dark)] rounded-[var(--radius-md)] overflow-hidden border border-[var(--border)] select-none flex items-center justify-center">
            {/* Grid street layout styled with pure SVG overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="street-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--app-bg)" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#street-grid)" />
              {/* Highlight routes */}
              <path d="M -10 90 Q 120 40 220 130 T 400 80" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="5,5" />
              <path d="M 60 -20 L 150 200" fill="none" stroke="var(--teal)" strokeWidth="1.5" />
            </svg>

            {/* Map markers (pins) absolute positioned */}
            <div className="absolute top-[45%] left-[28%] text-[var(--accent)] animate-bounce duration-1000">
              <MapPin size={22} className="fill-[var(--accent)]/20" />
            </div>
            <div className="absolute top-[25%] left-[65%] text-[var(--teal)]">
              <MapPin size={22} className="fill-[var(--teal)]/20" />
            </div>
            <div className="absolute top-[60%] left-[55%] text-[var(--accent)]">
              <MapPin size={22} className="fill-[var(--accent)]/20" />
            </div>

            {/* Map zoom controls */}
            <div className="absolute top-3 right-3 bg-[var(--surface-dark-2)] rounded-lg border border-[var(--border-dark)] flex flex-col p-0.5" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <button type="button" className="p-1.5 hover:bg-[var(--app-bg)]/10 text-white rounded-md cursor-pointer transition-all">
                <Plus size={14} className="stroke-[2.5]" />
              </button>
              <div className="h-px bg-[var(--border-dark)] mx-1" />
              <button type="button" className="p-1.5 hover:bg-[var(--app-bg)]/10 text-white rounded-md cursor-pointer transition-all">
                <Minus size={14} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Map floating Action button */}
            <button
              type="button"
              className="absolute bottom-3 right-3 h-9 w-9 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-strong)] rounded-[var(--radius-md)] flex items-center justify-center transition-all cursor-pointer group-hover:scale-105"
              aria-label="Add location"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <Plus size={18} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
