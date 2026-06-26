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
        <div className="bg-white border border-[#E5E2EB] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#8C8896]">
                Monthly Revenue
              </span>
              <h3 className="text-2xl font-black text-[#1E1B24] tracking-tight">
                $428,900
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#E25C5C] bg-[#FDEAEA] px-2 py-0.5 rounded-full">
                +12.4%
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF6E2] text-[#E9C46A] shadow-inner">
                <DollarSign size={18} className="stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Active Shipments */}
        <div className="bg-white border border-[#E5E2EB] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#8C8896]">
                Active Shipments
              </span>
              <h3 className="text-2xl font-black text-[#1E1B24] tracking-tight">
                1,284
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#35978F] bg-[#EAF7F6] px-2 py-0.5 rounded-full">
                +4.2%
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF6E2] text-[#E9C46A] shadow-inner">
                <Truck size={18} className="stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Avg. Delivery Time */}
        <div className="bg-white border border-[#E5E2EB] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#8C8896]">
                Avg. Delivery Time
              </span>
              <h3 className="text-2xl font-black text-[#1E1B24] tracking-tight">
                22.4 hrs
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#3E80E5] bg-[#EAF1FC] px-2 py-0.5 rounded-full">
                -2.1%
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF6E2] text-[#E9C46A] shadow-inner">
                <Timer size={18} className="stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Warehouse Capacity */}
        <div className="bg-white border border-[#E5E2EB] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#8C8896]">
                Warehouse Capacity
              </span>
              <h3 className="text-2xl font-black text-[#1E1B24] tracking-tight">
                84%
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8C8896] bg-[#F5F3F7] px-2 py-0.5 rounded-full">
                Stable
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF6E2] text-[#E9C46A] shadow-inner">
                <ClipboardList size={18} className="stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Revenue Chart & Top Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Shipments Chart Card */}
        <div className="bg-white border border-[#E5E2EB] rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-[#1E1B24]">
                Revenue & Shipments
              </h3>
              <p className="text-xs text-[#8C8896] font-medium mt-0.5">
                Real-time performance metrics
              </p>
            </div>
            {/* Week / Month Toggle */}
            <div className="flex bg-[#F5F3F7] p-1 rounded-xl border border-[#E5E2EB]">
              <button
                type="button"
                onClick={() => setChartMode("week")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartMode === "week"
                    ? "bg-white text-[#1E1B24] shadow-sm"
                    : "text-[#8C8896] hover:text-[#1E1B24]"
                }`}
              >
                WEEK
              </button>
              <button
                type="button"
                onClick={() => setChartMode("month")}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  chartMode === "month"
                    ? "bg-[#E9C46A] text-[#3A2E12] shadow-sm"
                    : "text-[#8C8896] hover:text-[#1E1B24]"
                }`}
              >
                MONTH
              </button>
            </div>
          </div>

          {/* Stylized Bar Chart */}
          <div className="h-64 flex items-end justify-between px-4 pb-2 border-b border-[#E5E2EB] gap-2 relative">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-[#FAF9F6] pointer-events-none" />
            <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-[#FAF9F6] pointer-events-none" />
            <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-[#FAF9F6] pointer-events-none" />

            {barData.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full max-w-[42px]">
                {/* Column wrapper */}
                <div className="w-full rounded-md overflow-hidden flex flex-col justify-end h-full">
                  {/* Top segment (grey or light gold) */}
                  <div
                    style={{ height: `${bar.greyHeight}%` }}
                    className={`w-full transition-all duration-500 ${
                      bar.isGold ? "bg-[#FDF6E2]" : "bg-[#DCE2E6]/50"
                    }`}
                  />
                  {/* Bottom segment (teal or gold) */}
                  <div
                    style={{ height: `${bar.tealHeight}%` }}
                    className={`w-full transition-all duration-500 ${
                      bar.isGold
                        ? "bg-[#E9C46A] shadow-[inset_0_-4px_0_rgba(0,0,0,0.08)]"
                        : "bg-[#1D7A8C] shadow-[inset_0_-4px_0_rgba(0,0,0,0.08)]"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Month/Week Labels */}
          <div className="flex items-center justify-between text-xs text-[#8C8896] font-bold px-5 pt-3">
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
        <div className="bg-white border border-[#E5E2EB] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-extrabold text-[#1E1B24]">
              Top Drivers
            </h3>
            <button type="button" className="text-[#8C8896] hover:text-[#1E1B24] cursor-pointer">
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Driver List */}
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {drivers.map((driver) => (
              <div key={driver.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${driver.avatarBg}`}>
                    {driver.initials}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-[#1E1B24] leading-tight">
                      {driver.name}
                    </span>
                    <span className="text-xs text-[#8C8896] font-semibold flex items-center gap-1 mt-0.5">
                      <span className="text-[#E9C46A] font-bold">★</span> {driver.rating} • {driver.deliveries} Deliveries
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-extrabold ${
                  driver.isActive ? "text-[#1D7A8C]" : "text-[#D59B28]"
                }`}>
                  {driver.status}
                </span>
              </div>
            ))}
          </div>

          {/* View All button */}
          <button
            type="button"
            className="w-full mt-5 border border-[#E5E2EB] text-[#4F378B] font-bold py-2.5 rounded-xl hover:bg-[#F5F3F7] transition-all cursor-pointer text-sm"
          >
            View All Fleet
          </button>
        </div>
      </div>

      {/* Bottom Row: Recent Shipments & Live Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Shipments Table Card */}
        <div className="bg-white border border-[#E5E2EB] rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-[#1E1B24]">
              Recent Shipments
            </h3>
            <button
              type="button"
              className="text-xs font-extrabold text-[#6C63FF] hover:underline cursor-pointer"
            >
              Download CSV
            </button>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#E5E2EB]">
                  <th className="pb-3 font-bold text-[#1E1B24] w-24">ID</th>
                  <th className="pb-3 font-bold text-[#8C8896]">DESTINATION</th>
                  <th className="pb-3 font-bold text-[#8C8896] text-center w-32">STATUS</th>
                  <th className="pb-3 font-bold text-[#8C8896] text-right w-24">ETA</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b border-[#F5F3F7] last:border-b-0 hover:bg-[#FAF9F6]/50 transition-colors">
                    <td className="py-3.5 font-bold text-[#1E1B24]">{shipment.id}</td>
                    <td className="py-3.5 text-[#1E1B24] font-medium">{shipment.destination}</td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full ${
                        shipment.statusType === "delivered"
                          ? "bg-[#EAF7F6] text-[#35978F]"
                          : shipment.statusType === "pending"
                          ? "bg-[#FDF6E2] text-[#D59B28]"
                          : "bg-[#EAF1FC] text-[#3E80E5]"
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-semibold text-[#1E1B24]">{shipment.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fleet Live Map Card */}
        <div className="bg-white border border-[#E5E2EB] rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-extrabold text-[#1E1B24]">
              Fleet Live Map
            </h3>
            {/* Live pulsing updates */}
            <div className="flex items-center gap-1.5 text-xs text-[#8C8896] font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9C46A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E9C46A]"></span>
              </span>
              Live Updates
            </div>
          </div>

          {/* Map Preview Graphic */}
          <div className="relative flex-1 h-48 bg-[#18161D] rounded-xl overflow-hidden border border-[#E5E2EB] select-none flex items-center justify-center">
            {/* Grid street layout styled with pure SVG overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="street-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FAF9F6" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#street-grid)" />
              {/* Highlight routes */}
              <path d="M -10 90 Q 120 40 220 130 T 400 80" fill="none" stroke="#E9C46A" strokeWidth="2" strokeDasharray="5,5" />
              <path d="M 60 -20 L 150 200" fill="none" stroke="#1D7A8C" strokeWidth="1.5" />
            </svg>

            {/* Map markers (pins) absolute positioned */}
            <div className="absolute top-[45%] left-[28%] text-[#E9C46A] animate-bounce duration-1000">
              <MapPin size={22} className="fill-[#E9C46A]/20" />
            </div>
            <div className="absolute top-[25%] left-[65%] text-[#1D7A8C]">
              <MapPin size={22} className="fill-[#1D7A8C]/20" />
            </div>
            <div className="absolute top-[60%] left-[55%] text-[#E9C46A]">
              <MapPin size={22} className="fill-[#E9C46A]/20" />
            </div>

            {/* Map zoom controls */}
            <div className="absolute top-3 right-3 bg-[#242129] rounded-lg border border-[#E5E2EB]/10 flex flex-col p-0.5 shadow-md">
              <button type="button" className="p-1.5 hover:bg-[#FAF9F6]/10 text-white rounded-md cursor-pointer transition-all">
                <Plus size={14} className="stroke-[2.5]" />
              </button>
              <div className="h-px bg-[#E5E2EB]/10 mx-1" />
              <button type="button" className="p-1.5 hover:bg-[#FAF9F6]/10 text-white rounded-md cursor-pointer transition-all">
                <Minus size={14} className="stroke-[2.5]" />
              </button>
            </div>

            {/* Map floating Action button */}
            <button
              type="button"
              className="absolute bottom-3 right-3 h-9 w-9 bg-[#E9C46A] hover:bg-[#C99A3D] text-[#3A2E12] rounded-lg flex items-center justify-center shadow-lg transition-all cursor-pointer group-hover:scale-105"
              aria-label="Add location"
            >
              <Plus size={18} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
