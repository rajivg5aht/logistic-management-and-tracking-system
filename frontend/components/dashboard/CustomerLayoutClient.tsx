"use client";

import { useEffect, useState } from "react";
import { CustomerHeader } from "@/components/dashboard/CustomerHeader";
import { PageBreadcrumb } from "@/components/dashboard/PageBreadcrumb";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function CustomerLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const syncCollapsedState = () => {
      const savedState = localStorage.getItem("sidebar-collapsed");
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }
    };

    syncCollapsedState();
    window.addEventListener("sidebar-toggle", syncCollapsedState);
    return () => window.removeEventListener("sidebar-toggle", syncCollapsedState);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <Sidebar />

      <div
        className={`ml-0 flex min-h-screen flex-col transition-all duration-280 ease-in-out ${
          isCollapsed ? "lg:ml-[76px]" : "lg:ml-[260px]"
        }`}
        style={{ transitionDuration: "280ms" }}
      >
        <CustomerHeader />
        <main className="flex-1 px-8 py-8 lg:px-12 xl:px-16">
          <PageBreadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
