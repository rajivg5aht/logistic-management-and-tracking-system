"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { LayoutDashboard, Mail, MapPinned, User, LogOut, X, Menu, Package, CreditCard, Megaphone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth/session";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const restoreId = window.setTimeout(() => {
      const savedState = localStorage.getItem("sidebar-collapsed");
      if (savedState !== null) setIsCollapsed(JSON.parse(savedState));
    }, 0);
    return () => window.clearTimeout(restoreId);
  }, []);

  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
    window.dispatchEvent(new Event("sidebar-toggle"));
  };

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);

    window.addEventListener("toggle-sidebar", handleToggle);
    window.addEventListener("close-sidebar", handleClose);
    
    const closeId = window.setTimeout(handleClose, 0);

    return () => {
      window.clearTimeout(closeId);
      window.removeEventListener("toggle-sidebar", handleToggle);
      window.removeEventListener("close-sidebar", handleClose);
    };
  }, [pathname]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Shipments", href: "/shipments", icon: Mail },
    { label: "Tracking", href: "/tracking", icon: MapPinned },
    { label: "Shipment History", href: "/shipments/history", icon: Package },
    { label: "Payments", href: "/payments", icon: CreditCard },
    { label: "Announcements / Inquiries", href: "/inquiries", icon: Megaphone },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-35 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed left-0 top-0 h-screen border-r border-[var(--border)] bg-[var(--surface)] flex flex-col z-40 transition-all duration-280 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "w-[76px]" : "w-[260px]"} lg:fixed lg:z-0`}
        style={{ transitionDuration: '280ms' }}
      >
        <div className={`flex items-center border-b border-[var(--border)] ${isCollapsed ? 'justify-center h-[72px]' : 'justify-between h-[72px] px-5'}`}>
          <Link href="/" className={`flex items-center ${isCollapsed ? 'gap-0' : 'gap-2.5'}`}>
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden shrink-0">
              <Image src="/logo.png" alt="CargoNep Logo" width={36} height={36} className="object-cover" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-extrabold tracking-tight whitespace-nowrap">
                <span className="text-[var(--text)]">Cargo</span>
                <span className="text-[var(--accent)]">Nep</span>
              </span>
            )}
          </Link>
          
          {!isCollapsed && (
            <button 
              type="button"
              className="lg:flex hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] transition-colors cursor-pointer"
              onClick={toggleCollapsed}
              aria-label="Collapse sidebar"
              aria-expanded={!isCollapsed}
              suppressHydrationWarning
            >
              <Menu size={18} />
            </button>
          )}

          {!isCollapsed && (
            <button 
              type="button"
              className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
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

        <nav className="flex-1 overflow-y-auto py-6 px-3" id="sidebar-navigation">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`nav-link flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 relative group ${
                      isCollapsed ? 'justify-center' : 'gap-3'
                    } ${
                      isActive
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={20} className="shrink-0" />
                    {!isCollapsed && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                    
                    {isCollapsed && (
                      <span className="absolute left-full ml-2 px-3 py-1.5 bg-[var(--surface-dark)] text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-200 shadow-lg" style={{ boxShadow: 'var(--shadow-md)' }}>
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
          <div className={`flex items-center rounded-xl p-2 hover:bg-[var(--surface-soft)] transition-colors font-sans ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(200,162,74,0.20)] bg-[var(--accent-soft)] text-sm font-bold text-[var(--text)]">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--text)]">{user?.fullName || "User"}</p>
                  <p className="truncate text-xs capitalize text-[var(--text-muted)]">{user?.role || "user"}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                  aria-label="Logout"
                  suppressHydrationWarning
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
