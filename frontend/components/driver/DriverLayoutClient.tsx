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
  ChevronRight,
  ChevronDown,
  UserRoundCog,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthUser } from "@/lib/api/auth.api";
import { API_BASE_URL } from "@/lib/config";
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
  { label: "Fleet", href: "/driver/fleet", icon: Truck },
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
function resolveProfileImage(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (value.startsWith("/")) return `${API_BASE_URL}${value}`;
  return value;
}

export default function DriverLayoutClient({
  children,
  user,
  token,
}: DriverLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authenticatedUser } = useAuth();
  const activeUser = authenticatedUser?.role === "driver" ? authenticatedUser : user;
  const profileImageSrc = resolveProfileImage(activeUser?.profileImage);
  const [profileImageFailed, setProfileImageFailed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityStatus | null>(null);
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  useEffect(() => {
    setProfileImageFailed(false);
  }, [profileImageSrc]);

  const loadMe = useCallback(async () => {
    try {
      const me = await driverGetMe(token);
      setAvailability(me.availabilityStatus ?? "available");
    } catch {
    }
  }, [token]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  useAutoRefresh(loadMe, { intervalMs: 15_000 });

  useEffect(() => {
    setIsOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const saved = localStorage.getItem("driver-sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
    setHydrated(true);
  }, []);

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("driver-sidebar-collapsed", JSON.stringify(next));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

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

  const currentNav = NAV_ITEMS.find((item) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const breadcrumbPage = pathname === "/driver/profile" ? "Profile" : currentNav?.label ?? "Dashboard";

  const initials =
    (activeUser.fullName?.trim() || "Driver")
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "D";

  const avatarContent =
    profileImageSrc && !profileImageFailed ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profileImageSrc}
        alt={activeUser.fullName || "Driver"}
        className="h-full w-full object-cover"
        onError={() => setProfileImageFailed(true)}
      />
    ) : (
      initials
    );

  return (
    <div className="min-h-screen bg-[var(--app-bg)] font-sans antialiased">
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[var(--border)] bg-[var(--surface)] ease-in-out md:translate-x-0 ${
          hydrated ? "transition-all duration-300" : ""
        } ${isOpen ? "translate-x-0" : "-translate-x-full"} ${
          isCollapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <div
          className={`flex h-[72px] items-center border-b border-[var(--border)] ${
            isCollapsed ? "justify-center" : "justify-between px-5"
          }`}
        >
          <Link href="/driver" className={`flex items-center ${isCollapsed ? "gap-0" : "gap-2.5"}`}>
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl shrink-0">
              <Image src="/logo.png" alt="CargoNep" width={36} height={36} className="object-cover" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-extrabold tracking-tight whitespace-nowrap">
                <span className="text-[var(--text)]">Cargo</span>
                <span className="text-[var(--accent)]">Nep</span>
              </span>
            )}
          </Link>
          {!isCollapsed && (
            <>
              <button
                type="button"
                onClick={toggleCollapsed}
                className="hidden rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)] md:flex cursor-pointer"
                aria-label="Collapse sidebar"
                aria-expanded={!isCollapsed}
                suppressHydrationWarning
              >
                <Menu size={18} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-soft)] md:hidden"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </>
          )}
        </div>

        {isCollapsed && (
          <div className="flex justify-center border-b border-[var(--border)] py-4">
            <button
              type="button"
              onClick={toggleCollapsed}
              className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)] cursor-pointer"
              aria-label="Expand sidebar"
              aria-expanded={!isCollapsed}
              suppressHydrationWarning
            >
              <Menu size={20} />
            </button>
          </div>
        )}

        {!isCollapsed && (
          <div className="px-5 pt-5">
            <span className="rounded-md bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--accent-strong)]">
              Driver Portal
            </span>
          </div>
        )}

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
                    className={`group relative flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      isCollapsed ? "justify-center" : "gap-3"
                    } ${
                      active
                        ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={20} className="shrink-0" />
                    {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}

                    {isCollapsed && (
                      <span
                        className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-lg bg-[var(--surface-dark)] px-3 py-1.5 text-sm font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        style={{ boxShadow: "var(--shadow-md)" }}
                      >
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-[var(--border)] p-3">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent-strong)]">
                {avatarContent}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)] cursor-pointer"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl p-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent-strong)]">
                {avatarContent}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--text)]">{activeUser.fullName || "Driver"}</p>
                <p className="truncate text-xs text-[var(--text-muted)]">Driver</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--text)] cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      <div
        className={`ease-in-out ${hydrated ? "transition-all duration-300" : ""} ${
          isCollapsed ? "md:ml-[76px]" : "md:ml-64"
        }`}
      >
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

            <div className="relative">
              <div className="flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] transition-colors hover:bg-[var(--surface-soft)]">
                <Link
                  href="/driver/profile"
                  className="flex items-center rounded-full p-1"
                  aria-label="Open driver profile"
                >
                  <span className="relative flex h-8 w-8">
                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent-strong)]">
                      {avatarContent}
                    </span>
                    {meta && (
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--surface)] ${meta.dot}`}
                      />
                    )}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="rounded-full p-1.5 pr-2 text-[var(--text-muted)]"
                  aria-label="Driver profile menu"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  suppressHydrationWarning
                >
                  <ChevronDown size={15} />
                </button>
              </div>

              {profileOpen && (
                <>
                  <button
                    type="button"
                    aria-hidden
                    tabIndex={-1}
                    className="fixed inset-0 z-30 cursor-default"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div
                    className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1"
                    style={{ boxShadow: "var(--shadow-md)" }}
                    role="menu"
                  >
                    <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--accent-strong)]">
                        {avatarContent}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text)]">
                          {activeUser.fullName || "Driver"}
                        </p>
                        <p className="truncate text-xs text-[var(--text-muted)]">Driver</p>
                      </div>
                    </div>

                    <div className="border-b border-[var(--border)] p-2">
                      <Link
                        href="/driver/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)]"
                        role="menuitem"
                      >
                        <UserRoundCog size={16} />
                        Profile
                      </Link>
                    </div>
                    {meta && (
                      <div className="border-b border-[var(--border)] p-2">
                        {canToggle ? (
                          <button
                            type="button"
                            onClick={handleToggle}
                            disabled={toggling}
                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors hover:bg-[var(--surface-soft)] disabled:opacity-60 cursor-pointer"
                            title="Toggle your availability"
                          >
                            <span className="flex items-center gap-2 text-[var(--text-soft)]">
                              {toggling ? (
                                <Loader2 size={14} className="animate-spin text-[var(--text-muted)]" />
                              ) : (
                                <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                              )}
                              Availability
                            </span>
                            <span className={`text-xs font-bold ${meta.cls}`}>{meta.label}</span>
                          </button>
                        ) : (
                          <div
                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm font-semibold"
                            title="Set automatically while a delivery is in progress"
                          >
                            <span className="flex items-center gap-2 text-[var(--text-soft)]">
                              <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                              Availability
                            </span>
                            <span className={`text-xs font-bold ${meta.cls}`}>{meta.label}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-[#D0453A] transition-colors hover:bg-[#FBE4E1] cursor-pointer"
                        role="menuitem"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]"
          >
            <span>Driver</span>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="text-[var(--text)]">{breadcrumbPage}</span>
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
