"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  LayoutGrid,
  Map,
  Package,
  Truck,
  BarChart3,
  Users,
  HelpCircle,
  ClipboardList,
  Wallet,
  LogOut,
  Menu,
  Search,
  Bell,
  ChevronRight,
  Megaphone,
  UserRoundCog,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthUser } from "@/lib/api/auth.api";
import { getInitials, resolveProfileImage } from "@/lib/ui-helpers";
import { adminGetFleetReportStats } from "@/lib/api/fleetReports.api";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { getSocket } from "@/lib/socket";

const ADMIN_BREADCRUMBS: Record<string, string> = {
  "/admin": "Overview",
  "/admin/profile": "Profile",
  "/admin/live-map": "Live Map",
  "/admin/shipments": "Shipments",
  "/admin/drivers": "Driver Management",
  "/admin/fleet": "Fleet Management",
  "/admin/payments": "Payments",
  "/admin/analytics": "Analytics",
  "/admin/users": "User Management",
  "/admin/inquiries": "Announcements / Inquiries",
};

const ADMIN_SEARCH_TARGETS = [
  { label: "Shipments", description: "tracking ID, customer, or destination", href: "/admin/shipments" },
  { label: "Users", description: "customer or account details", href: "/admin/users" },
  { label: "Drivers", description: "driver name, ID, or vehicle", href: "/admin/drivers" },
  { label: "Fleet", description: "registration, make, or branch", href: "/admin/fleet" },
] as const;

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: AuthUser;
  token: string;
}

export default function AdminLayoutClient({ children, user, token }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const isFleetDetailsPage = pathname.startsWith("/admin/fleet/");
  const breadcrumbPage = ADMIN_BREADCRUMBS[pathname] ?? "Overview";
  const router = useRouter();
  const { user: authenticatedUser } = useAuth();
  const activeUser = authenticatedUser?.role === "admin" ? authenticatedUser : user;
  const profileImageSrc = resolveProfileImage(activeUser?.profileImage);
  const [profileImageFailed, setProfileImageFailed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [pendingIncidentCount, setPendingIncidentCount] = useState(0);
  const [globalSearch, setGlobalSearch] = useState("");
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  useEffect(() => {
    setProfileImageFailed(false);
  }, [profileImageSrc]);

  useEffect(() => {
    const savedState = localStorage.getItem("admin-sidebar-collapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
    setHydrated(true);
  }, []);
  const loadFleetNotifications = useCallback(async () => {
    try {
      const stats = await adminGetFleetReportStats(token);
      setPendingIncidentCount(stats.pendingIncidents);
    } catch {
      setPendingIncidentCount(0);
    }
  }, [token]);

  useEffect(() => {
    void loadFleetNotifications();
  }, [loadFleetNotifications]);

  useEffect(() => {
    const socket = getSocket(token);
    const handleIssueReported = () => {
      void loadFleetNotifications();
    };
    socket.on("fleet-issue-reported", handleIssueReported);
    return () => {
      socket.off("fleet-issue-reported", handleIssueReported);
    };
  }, [loadFleetNotifications, token]);
  useAutoRefresh(loadFleetNotifications, { intervalMs: 15_000 });

  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("admin-sidebar-collapsed", JSON.stringify(newState));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const runGlobalSearch = (href: string) => {
    const query = globalSearch.trim();
    if (!query) return;
    router.push(`${href}?search=${encodeURIComponent(query)}`);
    setIsGlobalSearchOpen(false);
  };

  const handleGlobalSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runGlobalSearch("/admin/shipments");
  };

  const displayName = activeUser?.fullName?.trim() || "Admin User";
  const initials = getInitials(displayName, "AU");

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutGrid, active: pathname === "/admin" },
    { label: "Live Map", href: "/admin/live-map", icon: Map, active: pathname.startsWith("/admin/live-map") },
    { label: "Shipments", href: "/admin/shipments", icon: Package, active: pathname.startsWith("/admin/shipments") },
    { label: "Driver Management", href: "/admin/drivers", icon: UserRoundCog, active: pathname.startsWith("/admin/drivers") },
    { label: "Fleet Management", href: "/admin/fleet", icon: Truck, active: pathname === "/admin/fleet" || (pathname.startsWith("/admin/fleet/") && !pathname.startsWith("/admin/fleet/reports")) },
    { label: "Fleet Reports", href: "/admin/fleet/reports", icon: ClipboardList, active: pathname.startsWith("/admin/fleet/reports") },
    { label: "Payments", href: "/admin/payments", icon: Wallet, active: pathname.startsWith("/admin/payments") },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3, active: pathname.startsWith("/admin/analytics") },
    { label: "User Management", href: "/admin/users", icon: Users, active: pathname.startsWith("/admin/users") },
    { label: "Announcements / Inquiries", href: "/admin/inquiries", icon: Megaphone, active: pathname.startsWith("/admin/inquiries") },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--app-bg)] font-sans antialiased">
      <aside className={`fixed left-0 top-0 h-screen border-r border-[var(--border)] bg-[var(--surface)] flex flex-col z-40 ease-in-out ${
        hydrated ? "transition-all duration-280" : ""
      } ${
        isCollapsed ? "w-[76px]" : "w-[260px]"
      }`} style={hydrated ? { transitionDuration: '280ms' } : undefined}>
        <div className={`flex items-center border-b border-[var(--border)] ${isCollapsed ? 'justify-center h-[72px]' : 'justify-between h-[72px] px-5'}`}>
          <div className={`flex items-center ${isCollapsed ? 'gap-0' : 'gap-2.5'}`}>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shrink-0">
              <Image src="/logo.png" alt="CargoNep Logo" width={36} height={36} className="object-cover" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-extrabold tracking-tight whitespace-nowrap">
                <span className="text-[var(--text)]">Cargo</span>
                <span className="text-[var(--accent)]">Nep</span>
              </span>
            )}
          </div>
          
          {!isCollapsed && (
            <button 
              type="button"
              className="hidden lg:flex p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] transition-colors cursor-pointer"
              onClick={toggleCollapsed}
              aria-label="Collapse sidebar"
              aria-expanded={!isCollapsed}
              suppressHydrationWarning
            >
              <Menu size={18} />
            </button>
          )}
        </div>

        {isCollapsed && (
          <div className="flex justify-center py-4 border-b border-[var(--border)]">
            <button 
              type="button"
              className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] transition-colors cursor-pointer"
              onClick={toggleCollapsed}
              aria-label="Expand sidebar"
              aria-expanded={!isCollapsed}
              suppressHydrationWarning
            >
              <Menu size={20} />
            </button>
          </div>
        )}

        <nav className="flex-1 py-6 px-3" id="sidebar-navigation">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`relative flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 group ${
                      isCollapsed ? 'justify-center' : 'gap-3'
                    } ${
                      item.active
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {item.active && !isCollapsed && (
                      <div className="absolute left-0 top-1/4 h-1/2 w-1.5 rounded-r bg-[var(--accent)]" />
                    )}
                    <Icon size={20} className={`shrink-0 ${item.active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`} />
                    {!isCollapsed && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                    
                    {isCollapsed && (
                      <span className="absolute left-full ml-2 px-3 py-1.5 bg-[var(--surface-dark)] text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200" style={{ boxShadow: 'var(--shadow-md)' }}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-[var(--border)] p-3 space-y-1.5">
          {!isCollapsed ? (
            <>
              <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] transition-all"
              >
                <HelpCircle size={20} className="text-[var(--text-muted)] shrink-0" />
                <span className="whitespace-nowrap">Help Center</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] transition-all cursor-pointer text-left"
                suppressHydrationWarning
              >
                <LogOut size={20} className="text-[var(--text-muted)] shrink-0" />
                <span className="whitespace-nowrap">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="#"
                className="flex items-center justify-center rounded-lg px-4 py-3 text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] transition-all"
                title="Help Center"
              >
                <HelpCircle size={20} className="text-[var(--text-muted)]" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center rounded-lg px-4 py-3 text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] transition-all cursor-pointer"
                title="Sign Out"
                suppressHydrationWarning
              >
                <LogOut size={20} className="text-[var(--text-muted)]" />
              </button>
            </>
          )}
        </div>
      </aside>

      <div
        className={`flex-1 flex flex-col min-w-0 ease-in-out ${hydrated ? "transition-all duration-280" : ""}`}
        style={{
          marginLeft: isCollapsed ? '76px' : '260px',
          transitionDuration: hydrated ? '280ms' : '0ms'
        }}
      >
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)]/95 px-8 backdrop-blur lg:px-12 xl:px-16">
          <form
            onSubmit={handleGlobalSearch}
            role="search"
            className="relative hidden min-w-0 flex-1 md:block md:max-w-[560px]"
          >
            <Search
              size={19}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
            />
            <input
              type="search"
              aria-label="Search shipments, customers, drivers, or vehicles"
              placeholder="Search shipments, customers, drivers, vehicles..."
              autoComplete="off"
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              onFocus={() => setIsGlobalSearchOpen(true)}
              onKeyDown={(event) => { if (event.key === "Escape") setIsGlobalSearchOpen(false); }}
              aria-expanded={isGlobalSearchOpen && Boolean(globalSearch.trim())}
              aria-controls="admin-search-destinations"
              className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-12 pr-4 text-sm font-medium text-[var(--text)] shadow-sm outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--border-strong)] focus:ring-2 focus:ring-[var(--accent-soft)]"
              suppressHydrationWarning
            />
            {isGlobalSearchOpen && globalSearch.trim() && (
              <div
                id="admin-search-destinations"
                className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-lg"
              >
                <p className="px-3 pb-2 pt-1 text-[11px] font-semibold text-[var(--text-muted)]">
                  Search &quot;{globalSearch.trim()}&quot; in
                </p>
                {ADMIN_SEARCH_TARGETS.map((target) => (
                  <button
                    key={target.href}
                    type="button"
                    onClick={() => runGlobalSearch(target.href)}
                    className="flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-soft)]"
                  >
                    <span className="text-sm font-bold text-[var(--text)]">{target.label}</span>
                    <span className="mt-0.5 text-xs text-[var(--text-muted)]">{target.description}</span>
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/fleet/reports"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] cursor-pointer"
              aria-label={pendingIncidentCount > 0 ? `${pendingIncidentCount} pending driver issue reports` : "Notifications"}
            >
              <Bell size={19} />
              {pendingIncidentCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--danger)] px-1.5 text-[10px] font-black leading-none text-white ring-2 ring-[var(--surface)]">
                  {pendingIncidentCount > 9 ? "9+" : pendingIncidentCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] cursor-pointer"
              aria-label="Help"
              suppressHydrationWarning
            >
              <HelpCircle size={19} />
            </button>

            <Link
              href="/admin/profile"
              className={`ml-1 flex items-center gap-3 rounded-xl border-l border-[var(--border)] py-1 pl-3 pr-2 transition-colors hover:bg-[var(--surface-soft)] ${
                pathname.startsWith("/admin/profile") ? "bg-[var(--accent-soft)]" : ""
              }`}
              aria-current={pathname.startsWith("/admin/profile") ? "page" : undefined}
              aria-label="Open admin profile"
            >
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold leading-tight text-[var(--text)]">{displayName}</p>
              </div>
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-black text-[var(--text-on-accent)]"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-hover))" }}
              >
                {profileImageSrc && !profileImageFailed ? (
                  <Image
                    src={profileImageSrc}
                    alt={displayName}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                    onError={() => setProfileImageFailed(true)}
                    unoptimized
                  />
                ) : (
                  initials
                )}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-8 py-8 lg:px-12 xl:px-16">
          {!isFleetDetailsPage && (
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]"
            >
              <span>Admin</span>
              <ChevronRight size={12} aria-hidden="true" />
              <span className="text-[var(--text)]">{breadcrumbPage}</span>
            </nav>
          )}
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
