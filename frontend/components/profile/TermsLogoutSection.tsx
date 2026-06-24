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
    <div className="card overflow-hidden">
      <button
        type="button"
        className="flex min-h-[68px] w-full items-center justify-between border-b border-[var(--border)] px-5 text-left transition-colors duration-150 hover:bg-[var(--surface-soft)] sm:px-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-soft)]">
            <FileText size={18} className="text-[var(--text-muted)]" />
          </div>
          <span className="text-sm font-medium text-[var(--text-muted)]">
            Terms of Service
          </span>
        </div>
        <ChevronRight size={18} className="text-[var(--text-muted)]" />
      </button>

      <button
        type="button"
        onClick={handleLogout}
        className="flex min-h-[68px] w-full items-center justify-between px-5 text-left transition-colors duration-150 hover:bg-[rgba(184,92,74,0.08)] sm:px-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(184,92,74,0.10)]">
            <LogOut size={18} className="text-[var(--danger)]" />
          </div>
          <span className="text-sm font-bold text-[var(--danger)]">Logout</span>
        </div>
      </button>
    </div>
  );
}
