"use client";

import { MessageCircle, HelpCircle } from "lucide-react";

export default function SupportBanner() {
  return (
    <div className="min-h-[200px] rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#172554] to-[#1E3A8A] p-10 flex flex-col relative overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
      {/* Decorative glow circles */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/[0.08]" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-white/[0.08]" />

      {/* Content */}
      <div className="relative z-10 max-w-[500px]">
        <h2 className="text-[24px] font-bold text-white">Need Help?</h2>
        <p className="text-sm text-white/60 mt-2 leading-relaxed">
          Our support team is available 24/7 to assist you with any questions
          or issues you may have.
        </p>
      </div>

      {/* Buttons — pushed away from text */}
      <div className="relative z-10 flex items-center gap-4 mt-[30px]">
        <button
          type="button"
          className="inline-flex items-center gap-2.5 h-12 px-7 rounded-xl bg-[#F5D38B] text-[#111827] text-sm font-semibold transition-all hover:bg-[#E8C47A] hover:-translate-y-0.5 active:translate-y-0"
        >
          <MessageCircle size={18} />
          Chat with Us
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2.5 h-12 px-7 rounded-xl border border-white/30 text-white text-sm font-semibold transition-all hover:bg-white/5 hover:-translate-y-0.5 active:translate-y-0"
        >
          <HelpCircle size={18} />
          FAQ
        </button>
      </div>
    </div>
  );
}
