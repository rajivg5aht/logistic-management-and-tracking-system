"use client";

import { useState } from "react";
import type { AuthUser } from "@/lib/api/auth.api";
import { ChevronRight, User, Bell, Shield, MapPin, CreditCard } from "lucide-react";
import ProfileUpdateForm from "@/components/profile/ProfileUpdateForm";
import PasswordUpdateForm from "@/components/profile/PasswordUpdateForm";

interface SettingsListProps {
  user: AuthUser;
}

const settingsItems = [
  {
    id: "personal",
    label: "Personal Information",
    icon: User,
    form: "profile" as const,
  },
  {
    id: "notifications",
    label: "Notification Preferences",
    icon: Bell,
    form: null,
  },
  {
    id: "security",
    label: "Security & Privacy",
    icon: Shield,
    form: "password" as const,
  },
  {
    id: "address",
    label: "Address Management",
    icon: MapPin,
    form: null,
  },
  {
    id: "payment",
    label: "Payment Methods",
    icon: CreditCard,
    form: null,
  },
];

export default function SettingsList({ user }: SettingsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          Account Settings
        </p>
      </div>

      {settingsItems.map((item, index) => {
        const isExpanded = expandedId === item.id;
        const Icon = item.icon;
        const isLast = index === settingsItems.length - 1;

        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => toggleExpand(item.id)}
              className={`flex min-h-[68px] w-full items-center justify-between px-5 text-left transition-colors duration-150 hover:bg-[var(--surface-soft)] sm:px-6 ${
                !isLast ? "border-b border-[var(--border)]" : ""
              } ${isExpanded ? "bg-[var(--surface-soft)]" : ""}`}
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                  <Icon size={18} />
                </div>
                <span className="truncate text-sm font-medium text-[var(--text-muted)]">
                  {item.label}
                </span>
              </div>
              <ChevronRight
                size={18}
                className={`text-[var(--text-muted)] transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </button>

            {isExpanded && (
              <div
                className={`bg-[rgba(246,241,231,0.40)] px-5 py-6 sm:px-6 ${
                  !isLast ? "border-b border-[var(--border)]" : ""
                }`}
              >
                {item.form === "profile" && (
                  <ProfileUpdateForm user={user} />
                )}
                {item.form === "password" && <PasswordUpdateForm />}
                {item.form === null && (
                  <div className="empty-state text-sm">
                    This setting is not available yet.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
