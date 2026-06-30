"use client";

import { useState } from "react";
import { Wallet, Plus, Search, Filter, Download, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

interface Invoice {
  id: string;
  description: string;
  date: string;
  amount: string;
  status: "paid" | "processing" | "overdue";
}

export default function PaymentsBilling({ user }: { user: any }) {
  const [currentPage, setCurrentPage] = useState(1);

  const invoices: Invoice[] = [
    {
      id: "#INV-2023-0891",
      description: "Int'l Freight - Tokyo",
      date: "Oct 24, 2023",
      amount: "$2,450.00",
      status: "paid",
    },
    {
      id: "#INV-2023-0888",
      description: "Last-mile Logistics",
      date: "Oct 21, 2023",
      amount: "$120.40",
      status: "paid",
    },
    {
      id: "#INV-2023-0882",
      description: "Express Air Charter",
      date: "Oct 18, 2023",
      amount: "$1,100.00",
      status: "processing",
    },
    {
      id: "#INV-2023-0870",
      description: "Warehouse Storage - Q3",
      date: "Oct 15, 2023",
      amount: "$4,200.00",
      status: "paid",
    },
    {
      id: "#INV-2023-0865",
      description: "Customs Clearance Fees",
      date: "Oct 12, 2023",
      amount: "$310.50",
      status: "overdue",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return {
          bg: "bg-[rgba(95,127,53,0.1)]",
          text: "text-[var(--success)]",
          dot: "bg-[var(--success)]",
        };
      case "processing":
        return {
          bg: "bg-[rgba(181,162,74,0.1)]",
          text: "text-[#8B7355]",
          dot: "bg-[#8B7355]",
        };
      case "overdue":
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
            Payments & Billing
          </h1>
          <p className="text-sm text-[var(--text-muted)] font-medium mt-1">
            Manage your digital wallet, saved methods, and shipment history.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E9C46A] hover:bg-[#C99A3D] text-[#3A2E12] text-sm font-bold transition-colors"
        >
          <Plus size={16} />
          Add Payment Method
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 30% */}
        <div className="lg:col-span-1 space-y-6">
          {/* Digital Wallet Card */}
          <div className="bg-gradient-to-br from-[#E8F4F8] to-[#D4E9F0] rounded-2xl p-6 shadow-sm border border-[#B8D4E3]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Digital Wallet Balance
                </p>
                <p className="text-3xl font-extrabold text-[var(--text)] mt-2">
                  $14,280.50
                </p>
              </div>
              <div className="p-2 bg-white/50 rounded-lg">
                <Wallet size={24} className="text-[var(--accent)]" />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#1D7A8C] hover:bg-[#15656e] text-white text-sm font-bold transition-colors"
              >
                Top Up
              </button>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-white/60 hover:bg-white/80 text-[var(--text)] text-sm font-semibold transition-colors"
              >
                Auto-Refill: ON
              </button>
            </div>
          </div>

          {/* Saved Cards Section */}
          <div>
            <h2 className="text-lg font-extrabold text-[var(--text)] mb-3">
              Saved Cards
            </h2>
            <div className="space-y-3">
              {/* Visa Card */}
              <div className="bg-[#F3EBF9] rounded-xl p-4 border border-[#E0D0F0]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-7 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">VISA</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[var(--accent)] bg-white/60 px-2 py-1 rounded">
                    PRIMARY
                  </span>
                </div>
                <p className="text-sm font-bold text-[var(--text)] mb-2">
                  •••• •••• •••• 4291
                </p>
                <p className="text-xs text-[var(--text-muted)]">Exp. 12/26</p>
              </div>

              {/* Mastercard */}
              <div className="bg-[#F3EBF9] rounded-xl p-4 border border-[#E0D0F0]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-7 bg-red-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">MC</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-bold text-[var(--text)] mb-2">
                  •••• •••• •••• 8832
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--text-muted)]">Exp. 09/25</p>
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#3E80E5] hover:underline"
                  >
                    Set Primary
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Boxes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-[var(--border)] shadow-sm">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Pending
              </p>
              <p className="text-xl font-extrabold text-[var(--text)] mt-1">
                $840.00
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[var(--border)] shadow-sm">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Credit Limit
              </p>
              <p className="text-xl font-extrabold text-[var(--text)] mt-1">
                $50k
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - 70% */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Invoices Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-extrabold text-[var(--text)]">
                  Recent Invoices
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      className="pl-9 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    />
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold text-[var(--text-soft)] hover:bg-[var(--surface-soft)] transition-colors"
                  >
                    <Filter size={16} className="text-[var(--text-muted)]" />
                    Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface)]">
                    <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Invoice ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {invoices.map((invoice) => {
                    const statusColor = getStatusColor(invoice.status);
                    return (
                      <tr key={invoice.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--surface-muted)] rounded-lg">
                              <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[var(--text)]">
                                {invoice.id}
                              </p>
                              <p className="text-xs text-[#3E80E5] font-medium">
                                {invoice.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-[var(--text)]">
                            {invoice.date}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-[var(--text)]">
                            {invoice.amount}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColor.bg} ${statusColor.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusColor.dot}`} />
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            className="p-2 rounded-lg text-[#E9C46A] hover:bg-[rgba(233,196,106,0.1)] transition-colors"
                            aria-label="Download invoice"
                          >
                            <Download size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between">
              <p className="text-sm text-[var(--text-muted)] font-medium">
                Showing 1-5 of 24 invoices
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="min-w-[40px] h-10 rounded-lg bg-[#1D7A8C] text-white text-sm font-semibold"
                >
                  1
                </button>
                <button
                  type="button"
                  className="min-w-[40px] h-10 rounded-lg border border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)] text-sm font-semibold transition-colors"
                >
                  2
                </button>
                <button
                  type="button"
                  className="min-w-[40px] h-10 rounded-lg border border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)] text-sm font-semibold transition-colors"
                >
                  3
                </button>
                <span className="px-2 text-[var(--text-muted)]">...</span>
                <button
                  type="button"
                  className="min-w-[40px] h-10 rounded-lg border border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)] text-sm font-semibold transition-colors"
                >
                  6
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)] transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Support Banner */}
          <div className="bg-gradient-to-r from-[#F5E6D8] to-[#EED9C4] rounded-2xl p-6 shadow-sm border border-[#E5D4B8]">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-[#2C3E50] rounded-lg shrink-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-extrabold text-[var(--text)] mb-2">
                  Need specialized billing assistance?
                </h3>
                <p className="text-sm text-[var(--text-muted)] font-medium mb-3">
                  Our corporate accounts team is available 24/7 to help you optimize your logistics spending and credit lines.
                </p>
                <button
                  type="button"
                  className="text-sm font-bold text-[#3E80E5] hover:underline"
                >
                  Contact Specialist →
                </button>
              </div>
            </div>
          </div>
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