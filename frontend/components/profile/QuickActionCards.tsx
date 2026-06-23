"use client";

import { Truck, CreditCard, Package, Headphones } from "lucide-react";

const cards = [
  {
    title: "Shipping",
    subtitle: "Track & manage shipments",
    icon: Truck,
    gradient: "from-amber-500/10 to-amber-500/5",
    iconColor: "text-amber-600",
  },
  {
    title: "Payments",
    subtitle: "Invoices & transactions",
    icon: CreditCard,
    gradient: "from-emerald-500/10 to-emerald-500/5",
    iconColor: "text-emerald-600",
  },
  {
    title: "Orders",
    subtitle: "View order history",
    icon: Package,
    gradient: "from-blue-500/10 to-blue-500/5",
    iconColor: "text-blue-600",
  },
  {
    title: "Support",
    subtitle: "Get help & resources",
    icon: Headphones,
    gradient: "from-purple-500/10 to-purple-500/5",
    iconColor: "text-purple-600",
  },
];

export default function QuickActionCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.title}
            type="button"
            className="card p-6 min-h-[140px] text-left cursor-pointer hover:-translate-y-[5px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] group flex flex-col justify-center transition-all duration-300"
          >
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4`}
            >
              <Icon size={24} className={card.iconColor} />
            </div>
            <h3 className="text-[20px] font-semibold text-white group-hover:text-[#00E5FF] transition-colors">
              {card.title}
            </h3>
            <p className="text-[14px] text-white/30 mt-1 leading-relaxed">
              {card.subtitle}
            </p>
          </button>
        );
      })}
    </div>
  );
}
