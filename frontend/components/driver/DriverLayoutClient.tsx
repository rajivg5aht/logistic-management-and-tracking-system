"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";
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
  Search,
  MapPin,
  Package,
  Bell,
  Megaphone,
  CircleHelp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth/session";
import { AuthUser } from "@/lib/api/auth.api";
import { getInitials, resolveProfileImage } from "@/lib/ui-helpers";
import {
  getMyAnnouncements,
  type Announcement,
} from "@/lib/api/announcement.api";
import {
  driverGetAssignments,
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
  { label: "Announcements", href: "/driver/announcements", icon: Megaphone },
  { label: "Profile", href: "/driver/profile", icon: UserRoundCog },
];

const AVAILABILITY_META: Record<
  AvailabilityStatus,
  { label: string; dot: string; cls: string }
> = {
  available: { label: "Available", dot: "bg-[var(--success)]", cls: "text-[var(--success)]" },
  assigned: { label: "Assigned", dot: "bg-[var(--accent-hover)]", cls: "text-[var(--accent-hover)]" },
  "on-delivery": { label: "On Delivery", dot: "bg-[var(--warning)]", cls: "text-[var(--warning)]" },
  "off-duty": { label: "Off Duty", dot: "bg-[var(--inactive)]", cls: "text-[var(--inactive)]" },
  inactive: { label: "Inactive", dot: "bg-[var(--danger)]", cls: "text-[var(--danger)]" },
};
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
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityStatus | null>(null);
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [activeDeliveryCount, setActiveDeliveryCount] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [driverSearch, setDriverSearch] = useState("");

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

  const loadActiveDeliveryCount = useCallback(async () => {
    try {
      const assignments = await driverGetAssignments(token, "active");
      setActiveDeliveryCount(assignments.length);
    } catch {
    }
  }, [token]);

  useEffect(() => {
    loadActiveDeliveryCount();
  }, [loadActiveDeliveryCount]);

  useAutoRefresh(loadActiveDeliveryCount, { intervalMs: 15_000 });

  const loadAnnouncements = useCallback(async () => {
    try {
      setAnnouncements(await getMyAnnouncements(token));
    } catch {
      setAnnouncements([]);
    }
  }, [token]);

  useEffect(() => {
    void loadAnnouncements();
  }, [loadAnnouncements]);

  useAutoRefresh(loadAnnouncements, { intervalMs: 15_000 });

  useEffect(() => {
    setIsOpen(false);
    setProfileOpen(false);
    setNotificationOpen(false);
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
      await signOut();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const canToggle = availability === "available" || availability === "off-duty";

  const handleAvailabilityChange = async (next: "available" | "off-duty") => {
    if (!canToggle || toggling || availability === next) return;
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

  const handleDriverSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = driverSearch.trim();
    if (!query) return;
    router.push(`/driver/assignments?search=${encodeURIComponent(query)}`);
  };

  const meta = availability ? AVAILABILITY_META[availability] : null;
  const availabilityPillClass = availability === "available"
    ? "bg-[var(--success-soft)] text-[var(--success)]"
    : availability === "off-duty"
      ? "bg-[var(--surface-soft)] text-[var(--text-soft)]"
      : "bg-[var(--accent-soft)] text-[var(--accent-strong)]";

  const currentNav = NAV_ITEMS.find((item) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const breadcrumbPage = pathname === "/driver/profile" ? "Profile" : currentNav?.label ?? "Dashboard";

  const initials = getInitials(activeUser.fullName, "D");

  const avatarContent =
    profileImageSrc && !profileImageFailed ? (
      <Image
        src={profileImageSrc}
        alt={activeUser.fullName || "Driver"}
        width={40}
        height={40}
        className="h-full w-full object-cover"
        onError={() => setProfileImageFailed(true)}
        unoptimized
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

          <form
            onSubmit={handleDriverSearch}
            className="relative hidden min-w-0 max-w-[290px] flex-1 lg:block"
            role="search"
          >
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={driverSearch}
              onChange={(event) => setDriverSearch(event.target.value)}
              placeholder="Search shipment or route..."
              aria-label="Search shipment or route"
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-10 pr-3 text-xs font-medium text-[var(--text)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
            />
          </form>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {toggleError && (
              <span className="hidden max-w-[220px] truncate text-xs font-medium text-[var(--danger)] sm:inline">
                {toggleError}
              </span>
            )}

            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-2.5 text-xs font-bold transition-colors hover:brightness-95 sm:h-10 sm:px-3 ${availabilityPillClass}`}
              aria-label={`Availability: ${meta?.label ?? "Loading"}. Open availability controls.`}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              title="Open availability controls"
            >
              {toggling ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <span className={`h-2 w-2 rounded-full ${meta?.dot ?? "bg-[var(--text-muted)]"}`} />
              )}
              <span className="hidden whitespace-nowrap xl:inline">
                {availability === "available" ? "On Duty" : meta?.label ?? "Loading"}
              </span>
            </button>

            <Link
              href="/driver/route"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-2.5 text-xs font-bold shadow-sm transition-colors hover:bg-[var(--accent-hover)] sm:h-10 sm:px-3"
              style={{ color: "var(--text-on-accent)" }}
              aria-label="Start GPS tracking"
            >
              <MapPin size={15} aria-hidden="true" />
              <span className="hidden whitespace-nowrap xl:inline">Start GPS</span>
            </Link>

            <Link
              href="/driver/assignments"
              className="hidden h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] sm:inline-flex"
            >
              <Package size={15} aria-hidden="true" />
              <span className="hidden whitespace-nowrap xl:inline">My Deliveries</span>
              {activeDeliveryCount > 0 && (
                <span className="flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent-soft)] px-1 text-[9px] font-black text-[var(--accent-strong)]">
                  {activeDeliveryCount > 9 ? "9+" : activeDeliveryCount}
                </span>
              )}
            </Link>

            <div className="relative hidden sm:block">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setNotificationOpen((open) => !open)}
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)] sm:h-10 sm:w-10"
                aria-label={`${announcements.length} announcement notifications`}
                aria-expanded={notificationOpen}
                aria-haspopup="dialog"
              >
                <Bell size={18} aria-hidden="true" />
                {announcements.length > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[9px] font-black leading-none text-white ring-2 ring-[var(--surface)]">
                    {announcements.length > 9 ? "9+" : announcements.length}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close notifications"
                    className="fixed inset-0 z-30 cursor-default"
                    onClick={() => setNotificationOpen(false)}
                  />
                  <div
                    className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-xl"
                    role="dialog"
                    aria-label="Announcement notifications"
                  >
                    <div className="border-b border-[var(--border)] px-4 py-3">
                      <p className="text-sm font-extrabold text-[var(--text)]">
                        Announcements
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        Official updates from CargoNep
                      </p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {announcements.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                          No announcements yet.
                        </p>
                      ) : (
                        announcements.slice(0, 5).map((announcement) => (
                          <Link
                            key={announcement.id}
                            href="/driver/announcements"
                            onClick={() => setNotificationOpen(false)}
                            className="block border-b border-[var(--border-light)] px-4 py-3 transition-colors last:border-0 hover:bg-[var(--surface-soft)]"
                          >
                            <p className="truncate text-sm font-bold text-[var(--text)]">
                              {announcement.title}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-muted)]">
                              {announcement.message}
                            </p>
                          </Link>
                        ))
                      )}
                    </div>
                    <Link
                      href="/driver/announcements"
                      onClick={() => setNotificationOpen(false)}
                      className="block border-t border-[var(--border)] px-4 py-3 text-center text-xs font-extrabold text-[var(--accent-strong)] hover:bg-[var(--accent-soft)]"
                    >
                      View all announcements
                    </Link>
                  </div>
                </>
              )}
            </div>

            <Link
              href="/contact"
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)] sm:inline-flex sm:h-10 sm:w-10"
              aria-label="Driver help"
              title="Help"
            >
              <CircleHelp size={18} aria-hidden="true" />
            </Link>

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
                      <div className="border-b border-[var(--border)] px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[var(--text)]">Availability</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">Receive new delivery assignments when you are on duty.</p>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-bold ${meta.cls}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                            {meta.label}
                          </span>
                        </div>
                        {canToggle ? (
                          <div className="mt-3">
                            <div className="grid grid-cols-2 rounded-xl bg-[var(--surface-soft)] p-1" role="group" aria-label="Set availability">
                              <button
                                type="button"
                                onClick={() => void handleAvailabilityChange("off-duty")}
                                disabled={toggling || availability === "off-duty"}
                                aria-pressed={availability === "off-duty"}
                                className={`rounded-lg px-3 py-2 text-xs font-bold transition-all disabled:cursor-default ${availability === "off-duty" ? "bg-[var(--text-soft)] text-white shadow-sm" : "text-[var(--text-muted)] hover:bg-[var(--surface)]"}`}
                              >
                                Off
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleAvailabilityChange("available")}
                                disabled={toggling || availability === "available"}
                                aria-pressed={availability === "available"}
                                className={`rounded-lg px-3 py-2 text-xs font-bold transition-all disabled:cursor-default ${availability === "available" ? "bg-[var(--success)] text-white shadow-sm" : "text-[var(--text-muted)] hover:bg-[var(--surface)]"}`}
                              >
                                On
                              </button>
                            </div>
                            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                              {toggling ? <Loader2 size={13} className="animate-spin" /> : null}
                              {toggling ? "Updating availability..." : "Choose On when you are ready for new work."}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-3 rounded-lg bg-[var(--surface-soft)] px-3 py-2 text-xs leading-relaxed text-[var(--text-muted)]">
                            Availability is managed automatically while a delivery is in progress.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)] cursor-pointer"
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
