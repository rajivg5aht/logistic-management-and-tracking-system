"use client";

import { useState } from "react";
import { Calendar, Filter, Plus, Package, Truck, Container, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

interface Shipment {
  id: string;
  destination: string;
  route: string;
  date: string;
  dateLabel: string;
  status: "delivered" | "in-transit" | "cancelled";
  statusText: string;
  iconType: "package" | "truck" | "container";
}

export default function ShipmentHistory({ user }: { user: any }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 6;

  const shipments: Shipment[] = [
    {
      id: "#LOG-88291-TX",
      destination: "Austin, TX",
      route: "Austin, TX → Chicago, IL",
      date: "Oct 24, 2023",
      dateLabel: "Delivery Date",
      status: "delivered",
      statusText: "Delivered",
      iconType: "package",
    },
    {
      id: "#LOG-91022-CA",
      destination: "San Jose, CA",
      route: "San Jose, CA → Seattle, WA",
      date: "Nov 02, 2023",
      dateLabel: "Est. Arrival",
      status: "in-transit",
      statusText: "In Transit",
      iconType: "truck",
    },
    {
      id: "#LOG-77341-NY",
      destination: "New York, NY",
      route: "New York, NY → Miami, FL",
      date: "Oct 12, 2023",
      dateLabel: "Delivery Date",
      status: "delivered",
      statusText: "Delivered",
      iconType: "container",
    },
    {
      id: "#LOG-66500-GA",
      destination: "Atlanta, GA",
      route: "Atlanta, GA → Dallas, TX",
      date: "Oct 01, 2023",
      dateLabel: "Cancelled Date",
      status: "cancelled",
      statusText: "Cancelled",
      iconType: "package",
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "truck":
        return <Truck size={20} className="text-[var(--accent)]" />;
      case "container":
        return <Container size={20} className="text-[var(--accent)]" />;
      default:
        return <Package size={20} className="text-[var(--accent)]" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return {
          bg: "bg-[rgba(95,127,53,0.1)]",
          text: "text-[var(--success)]",
          dot: "bg-[var(--success)]",
        };
      case "in-transit":
        return {
          bg: "bg-[#EAF1FC]",
          text: "text-[#3E80E5]",
          dot: "bg-[#3E80E5]",
        };
      case "cancelled":
        return {
          bg: "bg-[rgba(181,71,59,0.1)]",
          text: "text-[var(--danger)]",
          dot: "bg-[var(--danger)]",
        };
      default:
        return {
          bg: "bg-[var(--surface-muted)]",
          text: "text-[var(--text-muted)]",
          dot: "bg-[var(--text-muted)]",
        };
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)] tracking-tight">
            Shipment History
          </h1>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1">
            Review and manage your past logistics operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Filter */}
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold text-[var(--text-soft)] hover:bg-[var(--surface-soft)] transition-colors"
          >
            <Calendar size={16} className="text-[var(--text-muted)]" />
            Last 30 Days
          </button>

          {/* Status Filter */}
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold text-[var(--text-soft)] hover:bg-[var(--surface-soft)] transition-colors"
          >
            <Filter size={16} className="text-[var(--text-muted)]" />
            All Statuses
          </button>

          {/* New Shipment Button */}
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1D7A8C] text-white text-sm font-bold hover:bg-[#15656e] transition-colors"
          >
            <Plus size={16} />
            New Shipment
          </button>
        </div>
      </div>

      {/* Shipment List */}
      <div className="space-y-4">
        {shipments.map((shipment) => {
          const statusColor = getStatusColor(shipment.status);
          const isCancelled = shipment.status === "cancelled";

          return (
            <div
              key={shipment.id}
              className="bg-[#FDF6F0] border border-[#F5E6D8] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F3EBF9]">
                  {getIcon(shipment.iconType)}
                </div>

                {/* Shipment Details */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* ID & Destination */}
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Shipment ID
                    </p>
                    <p className="text-sm font-bold text-[var(--text)] mt-0.5">
                      {shipment.id}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {shipment.destination}
                    </p>
                  </div>

                  {/* Route */}
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Destination
                    </p>
                    <p className="text-sm font-semibold text-[var(--text)] mt-0.5">
                      {shipment.route}
                    </p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      {shipment.dateLabel}
                    </p>
                    <p className="text-sm font-semibold text-[var(--text)] mt-0.5">
                      {shipment.date}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Status
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColor.bg} ${statusColor.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusColor.dot}`} />
                        {shipment.statusText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isCancelled}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isCancelled
                        ? "border border-[var(--border)] text-[var(--text-muted)] opacity-50 cursor-not-allowed"
                        : "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-soft)]"
                    }`}
                  >
                    Track
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-[#E9C46A] hover:bg-[#C99A3D] text-[#3A2E12] text-sm font-bold transition-colors"
                  >
                    Reorder
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with Pagination */}
      <div className="flex flex-col items-center gap-4 pt-4 pb-20">
        <p className="text-sm text-[var(--text-muted)] font-medium">
          Showing 1 to 4 of 24 shipments
        </p>

        {/* Pagination */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          {[1, 2, 3, "...", 6].map((page, idx) => (
            <button
              key={idx}
              type="button"
              disabled={page === "..."}
              className={`min-w-[40px] h-10 rounded-lg text-sm font-semibold transition-all ${
                page === currentPage
                  ? "bg-[#1D7A8C] text-white"
                  : page === "..."
                  ? "text-[var(--text-muted)] cursor-default"
                  : "border border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
              }`}
              onClick={() => typeof page === "number" && setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Floating Help Button */}
      <button
        type="button"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#1D7A8C] hover:bg-[#15656e] text-white text-sm font-semibold shadow-lg transition-all hover:scale-105"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <MessageCircle size={18} />
        Need help tracking?
      </button>
    </div>
  );
}