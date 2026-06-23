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
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    form: "profile" as const,
  },
  {
    id: "notifications",
    label: "Notification Preferences",
    icon: Bell,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    form: null,
  },
  {
    id: "security",
    label: "Security & Privacy",
    icon: Shield,
    iconBg: "bg-red-500/10",
    iconColor: "text-red-400",
    form: "password" as const,
  },
  {
    id: "address",
    label: "Address Management",
    icon: MapPin,
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
    form: null,
  },
  {
    id: "payment",
    label: "Payment Methods",
    icon: CreditCard,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    form: null,
  },
];

export default function SettingsList({ user }: SettingsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-[#0B1220] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <p className="text-[14px] font-bold tracking-[2px] uppercase text-white/30">
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
              className={`w-full h-[65px] px-6 flex items-center justify-between transition-colors duration-150 hover:bg-white/[0.03] ${
                !isLast ? "border-b border-white/[0.04]" : ""
              } ${isExpanded ? "bg-white/[0.02]" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center`}
                >
                  <Icon size={18} className={item.iconColor} />
                </div>
                <span className="text-sm font-medium text-white/80">
                  {item.label}
                </span>
              </div>
              <ChevronRight
                size={18}
                className={`text-white/30 transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </button>

            {/* Expandable section */}
            {isExpanded && (
              <div
                className={`px-6 py-6 bg-[#050816]/50 ${
                  !isLast ? "border-b border-white/[0.04]" : ""
                }`}
              >
                {item.form === "profile" && (
                  <ProfileUpdateForm user={user} />
                )}
                {item.form === "password" && <PasswordUpdateForm />}
                {item.form === null && (
                  <p className="text-sm text-white/30 italic">
                    Coming soon
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
