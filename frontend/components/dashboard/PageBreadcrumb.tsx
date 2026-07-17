"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

const BREADCRUMBS: Record<string, { section: string; page: string }> = {
  "/dashboard": { section: "Dashboard", page: "Overview" },
  "/shipments": { section: "Shipments", page: "Create Shipment" },
  "/tracking": { section: "Tracking", page: "Track Shipment" },
  "/shipments/history": { section: "Shipments", page: "History" },
  "/payments": { section: "Payments", page: "History" },
  "/inquiries": { section: "Support", page: "My Inquiries" },
  "/profile": { section: "Profile", page: "Account" },
  "/change-password": { section: "Profile", page: "Change Password" },
};

export function PageBreadcrumb() {
  const pathname = usePathname();
  const breadcrumb = BREADCRUMBS[pathname];

  if (!breadcrumb) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]"
    >
      <span>{breadcrumb.section}</span>
      <ChevronRight size={12} aria-hidden="true" />
      <span className="text-[var(--text)]">{breadcrumb.page}</span>
    </nav>
  );
}
