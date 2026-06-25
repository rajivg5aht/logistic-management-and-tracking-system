"use client";

import { Package, Zap, Truck, CheckCircle } from "lucide-react";

const stats = [
  { label: "Total Shipments", value: "12", icon: Package, dark: false },
  { label: "On-Time Rate", value: "98%", icon: Zap, dark: true },
  { label: "In Transit", value: "3", icon: Truck, dark: false },
  { label: "Delivered", value: "9", icon: CheckCircle, dark: false },
];

export function WeeklyStats() {
  return (
    <div className="content-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`app-card p-5 ${stat.dark ? "bg-[var(--surface-dark)] text-[var(--text-on-dark)]" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  stat.dark
                    ? "bg-[rgba(200,162,74,0.2)] text-[var(--accent)]"
                    : "bg-[var(--surface-soft)] text-[var(--text-muted)]"
                }`}
              >
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold uppercase tracking-[0.1em] ${
                    stat.dark ? "text-[var(--text-on-dark-muted)]" : "text-[var(--text-muted)]"
                  }`}
                >
                  {stat.label}
                </p>
                <p
                  className={`mt-1.5 text-2xl font-bold ${
                    stat.dark ? "text-[var(--text-on-dark)]" : "text-[var(--text)]"
                  }`}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}