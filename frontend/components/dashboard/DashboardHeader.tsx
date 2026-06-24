"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(251,246,236,0.80)] backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4 lg:px-8">
        {/* Left: Greeting */}
        <div>
          <p className="text-sm font-medium text-[var(--text-muted)]">Welcome back,</p>
          <h1 className="text-2xl font-bold text-[var(--text)] lg:text-3xl">Hello, Kushal!</h1>
        </div>

        {/* Right: Notification + New Shipment */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative rounded-xl p-2.5 text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--danger)]" />
          </button>
          <Link href="/shipments/new" className="btn-primary btn-sm hidden sm:inline-flex">
            + New Shipment
          </Link>
        </div>
      </div>
    </header>
  );
}