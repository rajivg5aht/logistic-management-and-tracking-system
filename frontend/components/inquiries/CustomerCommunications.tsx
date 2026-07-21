"use client";

import { useEffect, useState } from "react";
import { Megaphone, MessageSquareText } from "lucide-react";
import AnnouncementsFeed from "@/components/announcements/AnnouncementsFeed";
import CustomerInquiries from "@/components/inquiries/CustomerInquiries";
import type { AuthUser } from "@/lib/api/auth.api";

type CommunicationTab = "inquiries" | "announcements";

export default function CustomerCommunications({
  token,
  user,
  initialTab,
}: {
  token: string;
  user: AuthUser;
  initialTab: CommunicationTab;
}) {
  const [activeTab, setActiveTab] = useState<CommunicationTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="space-y-6">
      <div
        className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-1"
        role="tablist"
        aria-label="Announcements and inquiries"
      >
        <button
          suppressHydrationWarning
          type="button"
          role="tab"
          aria-selected={activeTab === "inquiries"}
          onClick={() => setActiveTab("inquiries")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === "inquiries"
              ? "bg-white text-[var(--accent-strong)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          <MessageSquareText size={15} /> My Inquiries
        </button>
        <button
          suppressHydrationWarning
          type="button"
          role="tab"
          aria-selected={activeTab === "announcements"}
          onClick={() => setActiveTab("announcements")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === "announcements"
              ? "bg-white text-[var(--accent-strong)] shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          <Megaphone size={15} /> Announcements
        </button>
      </div>

      <div role="tabpanel">
        {activeTab === "inquiries" ? (
          <CustomerInquiries token={token} user={user} />
        ) : (
          <AnnouncementsFeed token={token} audienceName="customers" />
        )}
      </div>
    </div>
  );
}
