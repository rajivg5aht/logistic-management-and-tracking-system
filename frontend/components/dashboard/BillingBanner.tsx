"use client";

import { CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";

export function BillingBanner() {
  return (
    <div className="app-card p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Icon + Text */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <CreditCard size={24} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text)]">Billing & Invoices</h3>
            <p className="mt-0.5 text-sm text-[var(--danger)] font-semibold">2 unpaid invoices</p>
          </div>
        </div>

        {/* Right: Button */}
        <Link
          href="/billing"
          className="btn-secondary inline-flex items-center justify-center gap-2 no-underline"
        >
          View Invoices
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}