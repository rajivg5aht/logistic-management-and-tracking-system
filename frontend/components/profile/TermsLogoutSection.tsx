"use client";

import { ChevronRight, LogOut, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsLogoutSection() {
  const router = useRouter();

  const handleLogout = async () => {
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "user=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <div className="bg-[#0B1220] border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Terms of Service */}
      <button
        type="button"
        className="w-full h-[65px] px-6 flex items-center justify-between border-b border-white/[0.05] transition-colors duration-150 hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
            <FileText size={18} className="text-white/30" />
          </div>
          <span className="text-sm font-medium text-white/80">
            Terms of Service
          </span>
        </div>
        <ChevronRight size={18} className="text-white/30" />
      </button>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full h-[65px] px-6 flex items-center justify-between transition-colors duration-150 hover:bg-red-500/[0.08]"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <LogOut size={18} className="text-red-400" />
          </div>
          <span className="text-sm font-bold text-[#DC2626]">Logout</span>
        </div>
      </button>
    </div>
  );
}
