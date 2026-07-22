"use client";

import { useState } from "react";
import { Megaphone, MessageSquareText } from "lucide-react";
import AdminAnnouncements from "@/components/admin/AdminAnnouncements";
import AdminInquiries from "@/components/admin/AdminInquiries";

type CommunicationTab = "inquiries" | "announcements";

export default function AdminCommunications({ token }: { token: string }) {
  const [activeTab, setActiveTab] = useState<CommunicationTab>("inquiries");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h1 className="text-lg font-extrabold text-[var(--text)]">
            Announcements / Inquiries
          </h1>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Publish one-way updates or manage incoming support messages.
          </p>
        </div>
        <div
          className="inline-flex self-start rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-1 sm:self-auto"
          role="tablist"
          aria-label="Communication sections"
        >
          <button
            suppressHydrationWarning
            type="button"
            role="tab"
            aria-selected={activeTab === "inquiries"}
            onClick={() => setActiveTab("inquiries")}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
              activeTab === "inquiries"
                ? "bg-white text-[var(--accent-strong)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            <MessageSquareText size={15} /> Inquiries
          </button>
          <button
            suppressHydrationWarning
            type="button"
            role="tab"
            aria-selected={activeTab === "announcements"}
            onClick={() => setActiveTab("announcements")}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
              activeTab === "announcements"
                ? "bg-white text-[var(--accent-strong)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            <Megaphone size={15} /> Announcements
          </button>
        </div>
      </div>

      <div role="tabpanel">
        {activeTab === "inquiries" ? (
          <AdminInquiries token={token} />
        ) : (
          <AdminAnnouncements token={token} />
        )}
      </div>
    </div>
  );
}
