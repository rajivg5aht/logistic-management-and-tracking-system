"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
  Search,
  Bell,
  Settings,
  Box,
  ChevronDown
} from "lucide-react";
import { AuthUser } from "@/lib/api/auth.api";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: AuthUser;
}

export default function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");

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
    { label: "Shipments", href: "#", icon: Package, active: false },
    { label: "Fleet Management", href: "#", icon: Truck, active: false },
    { label: "Warehouse", href: "#", icon: Warehouse, active: false },
    { label: "Analytics", href: "#", icon: BarChart3, active: false },
    { label: "User Management", href: "/admin/users", icon: Users, active: pathname.startsWith("/admin/users") },
  ];

  return (
    <div className="flex min-h-screen bg-[#FAF9F6] font-sans antialiased">
      {/* Sidebar Panel */}
      <aside className="w-[260px] border-r border-[#E5E2EB] bg-[#F5F3F7] flex flex-col shrink-0">
        {/* Brand/Logo Header */}
        <div className="flex h-20 items-center gap-3 px-6 border-b border-[#E5E2EB]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E9C46A] text-[#3A2E12] shadow-sm">
            <Box size={22} className="fill-[#3A2E12]/10" />
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-extrabold tracking-tight text-[#1E1B24]">
              Logistics Portal
            </span>
            <span className="text-[11px] font-bold text-[#8C8896] uppercase tracking-wider">
              Admin Console
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  item.active
                    ? "bg-[#6C63FF]/10 text-[#6C63FF] shadow-sm"
                    : "text-[#7C788A] hover:bg-[#EAE8EF] hover:text-[#1E1B24]"
                }`}
              >
                {/* Active Left Vertical Stripe */}
                {item.active && (
                  <div className="absolute left-0 top-1/4 h-1/2 w-1.5 rounded-r bg-[#6C63FF]" />
                )}
                <Icon size={20} className={item.active ? "text-[#6C63FF]" : "text-[#8C8896]"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Bottom Footer */}
        <div className="border-t border-[#E5E2EB] p-3 space-y-1">
          <Link
            href="#"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-[#7C788A] hover:bg-[#EAE8EF] hover:text-[#1E1B24] transition-all"
          >
            <HelpCircle size={20} className="text-[#8C8896]" />
            Help Center
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-[#7C788A] hover:bg-[#EAE8EF] hover:text-[#1E1B24] transition-all cursor-pointer text-left"
          >
            <LogOut size={20} className="text-[#8C8896]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Body Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#E5E2EB] bg-white px-8 shadow-sm">
          {/* Top Nav Left Brand & Links */}
          <div className="flex items-center gap-8">
            <h2 className="text-xl font-extrabold text-[#4F378B] tracking-tight mr-4">
              Smart Logistics
            </h2>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/admin"
                className={`text-sm font-bold pb-2 transition-all relative ${
                  pathname === "/admin"
                    ? "text-[#4F378B]"
                    : "text-[#8C8896] hover:text-[#1E1B24]"
                }`}
              >
                Dashboard
                {pathname === "/admin" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#6C63FF] rounded-full" />
                )}
              </Link>
              <Link href="#" className="text-sm font-bold text-[#8C8896] hover:text-[#1E1B24] pb-2">
                Shipments
              </Link>
              <Link href="#" className="text-sm font-bold text-[#8C8896] hover:text-[#1E1B24] pb-2">
                Fleet
              </Link>
              <Link href="#" className="text-sm font-bold text-[#8C8896] hover:text-[#1E1B24] pb-2">
                Reports
              </Link>
            </nav>
          </div>

          {/* Top Nav Right Controls */}
          <div className="flex items-center gap-6">
            {/* Search Box */}
            <div className="relative w-64">
              <span className="absolute inset-y-0 left-3 flex items-center text-[#8C8896] pointer-events-none">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Track shipment..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full text-sm py-2 pl-10 pr-4 rounded-xl border border-[#E5E2EB] bg-[#F5F3F7] focus:outline-none focus:border-[#6C63FF] focus:bg-white transition-all text-[#1E1B24] placeholder-[#8C8896]"
              />
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="p-2 rounded-xl border border-[#E5E2EB] hover:bg-[#FAF9F6] text-[#7C788A] hover:text-[#1E1B24] transition-all cursor-pointer relative"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E9C46A]" />
            </button>

            {/* Settings Gear */}
            <button
              type="button"
              className="p-2 rounded-xl border border-[#E5E2EB] hover:bg-[#FAF9F6] text-[#7C788A] hover:text-[#1E1B24] transition-all cursor-pointer"
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>

            {/* User Profile Info */}
            <div className="flex items-center gap-3 pl-2 border-l border-[#E5E2EB]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4F378B] text-white font-extrabold text-sm shadow-sm">
                {user.fullName?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-sm font-bold text-[#1E1B24] leading-tight">
                  {user.fullName || "Admin User"}
                </span>
                <span className="text-xs text-[#8C8896] font-medium leading-none mt-0.5">
                  {user.email}
                </span>
              </div>
              <ChevronDown size={14} className="text-[#8C8896] hidden lg:block" />
            </div>
          </div>
        </header>

        {/* Scrollable Layout Content */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-[1200px] w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
