"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  LogOut,
  Menu,
  Search,
  Bell,
  ChevronRight,
  MessageSquareText,
  UserRoundCog,
} from "lucide-react";
import { AuthUser } from "@/lib/api/auth.api";

const ADMIN_BREADCRUMBS: Record<string, string> = {
  "/admin": "Overview",
  "/admin/live-map": "Live Map",
  "/admin/shipments": "Shipments",
  "/admin/drivers": "Driver Management",
  "/admin/fleet": "Fleet Management",
  "/admin/analytics": "Analytics",
  "/admin/users": "User Management",
  "/admin/inquiries": "Inquiries",
};

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: AuthUser;
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const isFleetDetailsPage = pathname.startsWith("/admin/fleet/");
  const breadcrumbPage = ADMIN_BREADCRUMBS[pathname] ?? "Overview";
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Initialize collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("admin-sidebar-collapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
    // Mark hydrated only after the persisted state is applied so the initial
    // correction doesn't animate (otherwise the sidebar visibly snaps shut).
    setHydrated(true);
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("admin-sidebar-collapsed", JSON.stringify(newState));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Sign out failed:", err);
      // Fallback
      router.push("/login");
    }
  };

  const displayName = user?.fullName?.trim() || "Admin User";
  const initials =
    displayName
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AU";

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutGrid, active: pathname === "/admin" },
    { label: "Live Map", href: "/admin/live-map", icon: Map, active: pathname.startsWith("/admin/live-map") },
    { label: "Shipments", href: "/admin/shipments", icon: Package, active: pathname.startsWith("/admin/shipments") },
    { label: "Driver Management", href: "/admin/drivers", icon: UserRoundCog, active: pathname.startsWith("/admin/drivers") },
    { label: "Fleet Management", href: "/admin/fleet", icon: Truck, active: pathname === "/admin/fleet" || (pathname.startsWith("/admin/fleet/") && !pathname.startsWith("/admin/fleet/reports")) },
    { label: "Fleet Reports", href: "/admin/fleet/reports", icon: ClipboardList, active: pathname.startsWith("/admin/fleet/reports") },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3, active: pathname.startsWith("/admin/analytics") },
    { label: "User Management", href: "/admin/users", icon: Users, active: pathname.startsWith("/admin/users") },
    { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquareText, active: pathname.startsWith("/admin/inquiries") },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--app-bg)] font-sans antialiased">
      {/* Sidebar Panel */}
      <aside className={`fixed left-0 top-0 h-screen border-r border-[var(--border)] bg-[var(--surface)] flex flex-col z-40 ease-in-out ${
        hydrated ? "transition-all duration-280" : ""
      } ${
        isCollapsed ? "w-[76px]" : "w-[260px]"
      }`} style={hydrated ? { transitionDuration: '280ms' } : undefined}>
        {/* Brand/Logo Header */}
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
          
          {/* Toggle Button */}
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

        {/* Expand Button (shown when collapsed) */}
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

        {/* Navigation Menu */}
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
                    {/* Active Left Vertical Stripe */}
                    {item.active && !isCollapsed && (
                      <div className="absolute left-0 top-1/4 h-1/2 w-1.5 rounded-r bg-[var(--accent)]" />
                    )}
                    <Icon size={20} className={`shrink-0 ${item.active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`} />
                    {!isCollapsed && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                    
                    {/* Tooltip for collapsed state */}
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

        {/* Sidebar Bottom Footer */}
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

      {/* Main Body Column */}
      <div
        className={`flex-1 flex flex-col min-w-0 ease-in-out ${hydrated ? "transition-all duration-280" : ""}`}
        style={{
          marginLeft: isCollapsed ? '76px' : '260px',
          transitionDuration: hydrated ? '280ms' : '0ms'
        }}
      >
        {/* Top App Bar - height matches the sidebar brand header (72px) so their bottom borders align */}
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)]/95 px-8 backdrop-blur lg:px-12 xl:px-16">
          <div className="relative w-full max-w-md">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              placeholder="Search shipments, IDs, or drivers..."
              className="h-10 w-full rounded-xl border border-[var(--border)] bg-[#F1F3F6] pl-10 pr-4 text-sm font-medium text-[var(--text)] outline-none transition-all placeholder:text-[var(--text-muted)] focus:border-[#123E6B]/40 focus:bg-white"
              suppressHydrationWarning
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] cursor-pointer"
              aria-label="Notifications"
              suppressHydrationWarning
            >
              <Bell size={19} />
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#D0533F] ring-2 ring-[var(--surface)]" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] cursor-pointer"
              aria-label="Help"
              suppressHydrationWarning
            >
              <HelpCircle size={19} />
            </button>

            <div className="ml-1 flex items-center gap-3 border-l border-[var(--border)] pl-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold leading-tight text-[var(--text)]">{displayName}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Senior Admin
                </p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #123E6B, #0C3B67)" }}
              >
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Layout Content */}
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
