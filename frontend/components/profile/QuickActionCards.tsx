"use client";

import { Truck, CreditCard, Package, Headphones } from "lucide-react";

const cards = [
  {
    title: "Shipping",
    subtitle: "Track & manage shipments",
    icon: Truck,
  },
  {
    title: "Payments",
    subtitle: "Invoices & transactions",
    icon: CreditCard,
  },
  {
    title: "Orders",
    subtitle: "View order history",
    icon: Package,
  },
  {
    title: "Support",
    subtitle: "Get help & resources",
    icon: Headphones,
  },
];

export default function QuickActionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.title}
            type="button"
            className="card card-interactive flex min-h-[132px] cursor-pointer flex-col justify-center p-5 text-left group sm:p-6"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <Icon size={24} />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text)] transition-colors group-hover:text-[var(--accent)]">
              {card.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
              {card.subtitle}
            </p>
          </button>
        );
      })}
    </div>
  );
}
