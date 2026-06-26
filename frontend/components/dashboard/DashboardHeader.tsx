"use client";

import { Bell, Menu } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function DashboardHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(251,246,236,0.80)] backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4 lg:px-8">
        {/* Left: Hamburger + Greeting */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden p-2 -ml-1.5 rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] transition-colors cursor-pointer"
            onClick={() => window.dispatchEvent(new CustomEvent("toggle-sidebar"))}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] lg:text-sm">Welcome back,</p>
            <h1 className="text-xl font-bold text-[var(--text)] lg:text-2xl">Hello, {user?.fullName || "User"}!</h1>
          </div>
        </div>

        {/* Right: Notification + New Shipment */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative rounded-xl p-2.5 text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] transition-colors cursor-pointer"
            aria-label="Notifications"
            suppressHydrationWarning
          >
            <Bell size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--danger)]" />
          </button>
          <Link href="/shipments" className="btn-primary btn-sm hidden sm:inline-flex">
            + New Shipment
          </Link>
        </div>
      </div>
    </header>
  );
}