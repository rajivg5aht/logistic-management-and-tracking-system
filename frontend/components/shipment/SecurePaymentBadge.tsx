"use client";

import { Shield } from "lucide-react";

export function SecurePaymentBadge() {
  return (
    <div className="app-card p-5">
      <div className="flex items-center gap-4">
        {/* Shield Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-[#2B7A7A] bg-white">
          <Shield size={24} className="text-[#2B7A7A]" strokeWidth={1.5} />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-[#1A2B3C] mb-0.5">
            Secure Payment
          </h3>
          <p className="text-xs text-[#8A9BAD]">
            Protected with 256-bit encryption
          </p>
        </div>
      </div>
    </div>
  );
}