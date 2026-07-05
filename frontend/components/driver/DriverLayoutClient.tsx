"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  MapPinned,
  LogOut,
  Menu,
  X,
  Loader2,
  Truck,
} from "lucide-react";
import { AuthUser } from "@/lib/api/auth.api";
import {
  driverGetMe,
  driverUpdateAvailability,
  type AvailabilityStatus,
} from "@/lib/api/driver.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";

interface DriverLayoutClientProps {
  children: React.ReactNode;
  user: AuthUser;
  token: string;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/driver", icon: LayoutDashboard, exact: true },
  { label: "My Assignments", href: "/driver/assignments", icon: ClipboardList },
  { label: "Route", href: "/driver/route", icon: MapPinned },
];

const AVAILABILITY_META: Record<
  AvailabilityStatus,
  { label: string; dot: string; cls: string }
> = {
  available: { label: "Available", dot: "bg-[var(--success)]", cls: "text-[var(--success)]" },
  assigned: { label: "Assigned", dot: "bg-[#C99A3D]", cls: "text-[#C99A3D]" },
  "on-delivery": { label: "On Delivery", dot: "bg-[#C77718]", cls: "text-[#C77718]" },
  "off-duty": { label: "Off Duty", dot: "bg-[#5A6B82]", cls: "text-[#5A6B82]" },
  inactive: { label: "Inactive", dot: "bg-[#D0453A]", cls: "text-[#D0453A]" },
};

export default function DriverLayoutClient({
  children,
  user,
  token,
}: DriverLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityStatus | null>(null);
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const loadMe = useCallback(async () => {
    try {
      const me = await driverGetMe(token);
      setAvailability(me.availabilityStatus ?? "available");
    } catch {
      // Non-fatal: header just omits the live availability pill.
    }
  }, [token]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  // Keep availability in step with system-driven changes (e.g. a new assignment
  // flips the driver to "assigned"/"on-delivery").
  useAutoRefresh(loadMe, { intervalMs: 15_000 });

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  // Drivers may only flip between available and off-duty; assigned/on-delivery
  // are system-controlled while a shipment is in progress.
  const canToggle = availability === "available" || availability === "off-duty";

  const handleToggle = async () => {
    if (!canToggle || toggling) return;
    const next = availability === "available" ? "off-duty" : "available";
    setToggling(true);
    setToggleError(null);
    try {
      const updated = await driverUpdateAvailability(token, next);
      setAvailability(updated.availabilityStatus ?? next);
    } catch (err) {
      setToggleError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  const meta = availability ? AVAILABILITY_META[availability] : null;

  return (
    <div className="min-h-screen bg-[var(--app-bg)] font-sans antialiased">
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[72px] items-center justify-between border-b border-[var(--border)] px-5">
          <Link href="/driver" className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl">
              <Image src="/logo.png" alt="CargoNep" width={36} height={36} className="object-cover" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-[var(--text)]">Cargo</span>
              <span className="text-[var(--accent)]">Nep</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-soft)] md:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-5">
          <span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--accent-strong)]">
            Driver Portal
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                    }`}
                  >
                    <Icon size={20} className="shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User + logout */}
        <div className="border-t border-[var(--border)] p-3">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent-strong)]">
              {user.fullName?.charAt(0).toUpperCase() || "D"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text)]">{user.fullName || "Driver"}</p>
              <p className="truncate text-xs text-[var(--text-muted)]">Driver</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="md:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-soft)] md:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="hidden items-center gap-2 text-sm font-semibold text-[var(--text-soft)] sm:flex">
            <Truck size={16} className="text-[var(--accent)]" />
            Driver Console
          </div>

          <div className="ml-auto flex items-center gap-3">
            {toggleError && (
              <span className="hidden max-w-[220px] truncate text-xs font-medium text-[#D0453A] sm:inline">
                {toggleError}
              </span>
            )}

            {meta &&
              (canToggle ? (
                <button
                  type="button"
                  onClick={handleToggle}
                  disabled={toggling}
                  className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-bold transition-colors hover:bg-[var(--surface-soft)] disabled:opacity-60"
                  title="Toggle your availability"
                >
                  {toggling ? (
                    <Loader2 size={13} className="animate-spin text-[var(--text-muted)]" />
                  ) : (
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                  )}
                  <span className={meta.cls}>{meta.label}</span>
                </button>
              ) : (
                <span
                  className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-bold"
                  title="Set automatically while a delivery is in progress"
                >
                  <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                  <span className={meta.cls}>{meta.label}</span>
                </span>
              ))}
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
