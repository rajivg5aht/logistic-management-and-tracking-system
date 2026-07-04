"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { PageBreadcrumb } from "@/components/dashboard/PageBreadcrumb";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function ProtectedLayoutContent({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  // Initialize collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }

    // Listen for sidebar toggle events
    const handleToggle = () => {
      const newState = localStorage.getItem("sidebar-collapsed");
      if (newState !== null) {
        setIsCollapsed(JSON.parse(newState));
      }
    };

    window.addEventListener("sidebar-toggle", handleToggle);
    return () => window.removeEventListener("sidebar-toggle", handleToggle);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      {/* Sidebar Panel */}
      <Sidebar />

      {/* Main Content */}
      <div
        className="transition-all duration-280 ease-in-out"
        style={{
          marginLeft: isCollapsed ? '76px' : '260px',
          transitionDuration: '280ms'
        }}
      >
        {/* Page Content.
            Full width with responsive side padding (matching the admin layout)
            so content fills the space evenly and the left/right gaps stay
            consistent whether the sidebar is expanded or collapsed. */}
        <main className="px-8 py-8 lg:px-12 xl:px-16">
          <PageBreadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedLayoutContent>{children}</ProtectedLayoutContent>
    </AuthProvider>
  );
}
