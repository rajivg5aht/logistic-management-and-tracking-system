"use client";

import { MessageCircle, HelpCircle } from "lucide-react";

export default function SupportBanner() {
  return (
    <div className="card relative flex min-h-[190px] flex-col overflow-hidden p-6 sm:p-8 lg:p-10">
      <div className="relative z-10 max-w-[520px]">
        <h2 className="text-2xl font-bold text-[var(--text)]">Need Help?</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          Our support team is available 24/7 to assist you with any questions
          or issues you may have.
        </p>
      </div>

      <div className="relative z-10 mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="button" className="btn-primary">
          <MessageCircle size={18} />
          Chat with Us
        </button>
        <button type="button" className="btn-secondary">
          <HelpCircle size={18} />
          FAQ
        </button>
      </div>
    </div>
  );
}
