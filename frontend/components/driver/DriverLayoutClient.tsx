"use client";

import { useRouter } from "next/navigation";
import { LogOut, Truck, User } from "lucide-react";
import { AuthUser } from "@/lib/api/auth.api";

interface DriverLayoutClientProps {
  children: React.ReactNode;
  user: AuthUser;
}

export default function DriverLayoutClient({ children, user }: DriverLayoutClientProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Sign out failed:", err);
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans antialiased flex flex-col">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E6E1D6] bg-white px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E9C46A] text-[#3A2E12] shadow-sm">
            <Truck size={18} className="stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold text-[#2D2D2D] tracking-tight">
              CargoNep
            </span>
            <span className="rounded-md bg-[rgba(233,196,106,0.15)] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#C99A3D]">
              Driver
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(233,196,106,0.15)] text-[#3A2E12] font-bold text-xs uppercase">
              {user.fullName?.charAt(0).toUpperCase() || "D"}
            </div>
            <span className="text-sm font-bold text-[#2D2D2D] hidden sm:inline">
              {user.fullName || "Driver"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-bold text-[#9B9B9B] hover:text-[#2D2D2D] border border-[#E6E1D6] hover:bg-[#FBF1DC] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
