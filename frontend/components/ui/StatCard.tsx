import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: string;
  loading?: boolean;
  className?: string;
};

/** Reusable metric card for dashboards across customer, driver, and admin areas. */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  loading = false,
  className = "",
}: StatCardProps) {
  return (
    <article
      className={`app-card p-5 ${className}`}
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={19} className="stroke-[2.4]" aria-hidden="true" />
      </div>
      <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-black tracking-tight text-[var(--text)]">
        {loading ? "-" : value}
      </p>
    </article>
  );
}
