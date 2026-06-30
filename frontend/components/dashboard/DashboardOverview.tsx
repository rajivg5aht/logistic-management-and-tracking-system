"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Plus, Search, Building2, FileText, HelpCircle, Package, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface Shipment {
  id: string;
  name: string;
  status: "in-transit" | "out-for-delivery" | "processing";
  statusText: string;
  from: string;
  to: string;
  progress: number;
  estimate: string;
}

interface Order {
  id: string;
  name: string;
  date: string;
  status: "delivered";
}

export default function DashboardOverview({ user }: { user: any }) {
  const [currentPage, setCurrentPage] = useState(1);

  const shipments: Shipment[] = [
    {
      id: "TRK-8829-XPL",
      name: "Precision Optics Kit",
      status: "in-transit",
      statusText: "In Transit",
      from: "Munich, GER",
      to: "London, UK",
      progress: 75,
      estimate: "Estimated Arrival: Oct 24, 2023",
    },
    {
      id: "TRK-9002-LIT",
      name: "Electronic Components",
      status: "out-for-delivery",
      statusText: "Out for Delivery",
      from: "Shenzhen, CHN",
      to: "San Jose, USA",
      progress: 90,
      estimate: "Status: On Local Courier Vehicle",
    },
    {
      id: "TRK-1142-MED",
      name: "Medical Supplies B-2",
      status: "processing",
      statusText: "Processing",
      from: "Lyon, FRA",
      to: "Austin, USA",
      progress: 25,
      estimate: "Status: Label Created",
    },
  ];

  const orders: Order[] = [
    { id: "#ORD-5541", name: "Office Furniture Set", date: "Oct 18", status: "delivered" },
    { id: "#ORD-5320", name: "Industrial Pump X2", date: "Oct 15", status: "delivered" },
    { id: "#ORD-5119", name: "Bulk Cable Spools", date: "Oct 12", status: "delivered" },
    { id: "#ORD-5001", name: "Server Rack Chassis", date: "Oct 09", status: "delivered" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-transit":
        return { bg: "bg-[#EAF1FC]", text: "text-[#3E80E5]", dot: "bg-[#3E80E5]" };
      case "out-for-delivery":
        return { bg: "bg-[#F3EBF9]", text: "text-[#8B5CF6]", dot: "bg-[#8B5CF6]" };
      case "processing":
        return { bg: "bg-[rgba(181,162,74,0.1)]", text: "text-[#8B7355]", dot: "bg-[#8B7355]" };
      default:
        return { bg: "bg-[var(--surface-muted)]", text: "text-[var(--text-muted)]", dot: "bg-[var(--text-muted)]" };
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--success)] mb-1">
            Good morning, {user?.fullName?.split(" ")[0] || "Alexander"}
          </p>
          <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">
            Your Logistics Overview
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2.5 rounded-xl bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
          <Link
            href="/shipments"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D7A8C] hover:bg-[#15656e] text-white text-sm font-bold transition-colors no-underline"
          >
            <Plus size={16} />
            New Shipment
          </Link>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-white hover:bg-[var(--surface-soft)] text-sm font-semibold text-[var(--text)] transition-all"
        >
          <Search size={18} className="text-[var(--accent)]" />
          Track Package
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-white hover:bg-[var(--surface-soft)] text-sm font-semibold text-[var(--text)] transition-all"
        >
          <Building2 size={18} className="text-[var(--accent)]" />
          Delivery Network
        </button>
        <Link
          href="/billing"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-white hover:bg-[var(--surface-soft)] text-sm font-semibold text-[var(--text)] transition-all no-underline"
        >
          <FileText size={18} className="text-[var(--accent)]" />
          View Invoices
        </Link>
        <button
          type="button"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-white hover:bg-[var(--surface-soft)] text-sm font-semibold text-[var(--text)] transition-all"
        >
          <HelpCircle size={18} className="text-[var(--accent)]" />
          Get Help
        </button>
      </div>

      {/* Active Shipments Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[var(--text)]">
            Active Shipments
          </h2>
          <a
            href="#"
            className="text-sm font-semibold text-[#3E80E5] no-underline hover:underline"
          >
            See all active (4)
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shipments.map((shipment) => {
            const statusColor = getStatusColor(shipment.status);
            return (
              <div
                key={shipment.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {shipment.id}
                  </p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusColor.bg} ${statusColor.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusColor.dot}`} />
                    {shipment.statusText}
                  </span>
                </div>

                {/* Item Name */}
                <h3 className="text-base font-extrabold text-[var(--text)] mb-3">
                  {shipment.name}
                </h3>

                {/* Route */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">From</p>
                    <p className="text-sm font-semibold text-[var(--text)]">{shipment.from}</p>
                  </div>
                  <Package size={16} className="text-[var(--text-muted)]" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">To</p>
                    <p className="text-sm font-semibold text-[var(--text)]">{shipment.to}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[var(--surface-muted)] rounded-full h-2 mb-3">
                  <div
                    className="bg-[var(--accent)] h-2 rounded-full transition-all"
                    style={{ width: `${shipment.progress}%` }}
                  />
                </div>

                {/* Status/Estimate */}
                <p className="text-xs text-[var(--text-muted)] font-medium">
                  {shipment.estimate}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Section - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Live Fleet Tracking (65%) */}
        <div className="lg:col-span-2">
          <div className="bg-[#1a1f2e] rounded-2xl p-6 shadow-lg border border-[#2d3548] relative overflow-hidden">
            <h2 className="text-lg font-extrabold text-white mb-4">
              Live Fleet Tracking
            </h2>
            
            {/* World Map Visualization */}
            <div className="relative h-64 bg-[#0f1419] rounded-xl overflow-hidden">
              {/* Animated Route Lines */}
              <svg className="absolute inset-0 w-full h-full">
                {/* Route 1: Munich to London */}
                <path
                  d="M 150 120 Q 200 80 280 100"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                />
                {/* Route 2: Shenzhen to San Jose */}
                <path
                  d="M 450 180 Q 550 150 650 200"
                  stroke="#10B981"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                />
                {/* Route 3: Lyon to Austin */}
                <path
                  d="M 200 140 Q 350 180 450 220"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                />
                
                {/* Location Pins */}
                <circle cx="150" cy="120" r="4" fill="#3B82F6" />
                <circle cx="280" cy="100" r="4" fill="#3B82F6" />
                <circle cx="450" cy="180" r="4" fill="#10B981" />
                <circle cx="650" cy="200" r="4" fill="#10B981" />
                <circle cx="200" cy="140" r="4" fill="#F59E0B" />
                <circle cx="450" cy="220" r="4" fill="#F59E0B" />
              </svg>

              {/* Legend */}
              <div className="absolute top-4 right-4 flex items-center gap-4 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                  <span className="text-xs font-semibold text-white">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                  <span className="text-xs font-semibold text-white">Alert</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Orders (35%) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
            <div className="p-5 border-b border-[var(--border)]">
              <h2 className="text-lg font-extrabold text-[var(--text)]">
                Recent Orders
              </h2>
            </div>
            
            <div className="divide-y divide-[var(--border)]">
              {orders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-[var(--surface-soft)] transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-extrabold text-[var(--text)]">
                      {order.name}
                    </h3>
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      {order.date}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[var(--text-muted)] font-medium">
                      {order.id}
                    </p>
                    <span className="text-xs font-bold text-[var(--success)]">
                      DELIVERED
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#F3EBF9]">
              <button
                type="button"
                className="w-full py-2.5 rounded-lg text-sm font-bold text-[var(--accent)] hover:bg-[#E8D9F0] transition-colors"
              >
                VIEW ORDER HISTORY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}