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
  Warehouse,
  BarChart3,
  Users,
  HelpCircle,
  LogOut,
  Menu
} from "lucide-react";
import { AuthUser } from "@/lib/api/auth.api";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: AuthUser;
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const pathname = usePathname();
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

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutGrid, active: pathname === "/admin" },
    { label: "Live Map", href: "#", icon: Map, active: false },
    { label: "Shipments", href: "/admin/shipments", icon: Package, active: pathname.startsWith("/admin/shipments") },
    { label: "Fleet Management", href: "#", icon: Truck, active: false },
    { label: "Warehouse", href: "#", icon: Warehouse, active: false },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3, active: pathname.startsWith("/admin/analytics") },
    { label: "User Management", href: "/admin/users", icon: Users, active: pathname.startsWith("/admin/users") },
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
        <div className={`flex items-center border-b border-[var(--border)] ${isCollapsed ? 'justify-center h-[88px]' : 'justify-between h-[88px] px-7'}`}>
          <div className={`flex items-center ${isCollapsed ? 'gap-0' : 'gap-2.5'}`}>
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden shrink-0" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <Image src="/logo.png" alt="CargoNep Logo" width={44} height={44} className="object-cover" />
            </div>
            {!isCollapsed && (
              <span className="text-[30px] font-extrabold tracking-tight whitespace-nowrap">
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
                    className={`relative flex items-center rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-200 group ${
                      isCollapsed ? 'justify-center' : 'gap-3.5'
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
                    <Icon size={22} className={`shrink-0 ${item.active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`} />
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
        {/* Scrollable Layout Content */}
        <main className="flex-1 overflow-y-auto px-8 py-8 lg:px-12 xl:px-16">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
