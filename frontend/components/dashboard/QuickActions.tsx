"use client";

import { Plus, Scan, CreditCard } from "lucide-react";
import Link from "next/link";

const actions = [
  {
    label: "New Shipment",
    href: "/shipments",
    icon: Plus,
    accent: true,
  },
  {
    label: "Track Order",
    href: "/tracking",
    icon: Scan,
    accent: false,
  },
  {
    label: "Billing & Invoices",
    href: "/billing",
    icon: CreditCard,
    accent: false,
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.label}
            href={action.href}
            className="app-card card-interactive flex flex-col items-center justify-center gap-4 p-6 text-center no-underline"
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                action.accent
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "bg-[var(--surface-soft)] text-[var(--text-muted)]"
              }`}
            >
              <Icon size={28} strokeWidth={2} />
            </div>
            <span className="text-base font-semibold text-[var(--text)]">{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}