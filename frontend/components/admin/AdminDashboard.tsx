"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, UserX, Shield } from "lucide-react";
import { adminGetUsers } from "@/lib/api/admin.api";
import { AuthUser } from "@/lib/api/auth.api";
import AdminUserManagement from "./AdminUserManagement";

interface AdminDashboardProps {
  token: string;
  currentUser: AuthUser;
}

export default function AdminDashboard({ token, currentUser }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admin: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      // Fetch a large number of users to compute high-level system metrics
      const res = await adminGetUsers(token, 1, 10000);
      const allUsers = res.data;
      
      const total = allUsers.length;
      const active = allUsers.filter(u => u.status === "active").length;
      const inactive = allUsers.filter(u => u.status === "inactive").length;
      const admin = allUsers.filter(u => u.role === "admin").length;

      setStats({ total, active, inactive, admin });
      setStatsError(null);
    } catch (err: any) {
      console.error("Failed to load dashboard stats:", err);
      setStatsError("Failed to load statistics.");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Kicker */}
      <div className="border-b border-[var(--border)] pb-5">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--accent)]">
          Control Center
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)] mt-1">
          Admin Dashboard
        </h1>
        <p className="text-[var(--text-soft)] text-sm mt-1.5">
          Overview of platform health, registered users, status, and role metrics.
        </p>
      </div>

      {/* Metrics Row */}
      {statsError ? (
        <div className="rounded-xl border border-[var(--border)] bg-[rgba(181,71,59,0.05)] p-4 text-center text-sm font-semibold text-[var(--danger)]">
          {statsError}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Users */}
          <div className="card group relative overflow-hidden p-5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Total Users
                </p>
                {loadingStats ? (
                  <div className="mt-2 h-8 w-16 animate-pulse rounded bg-[var(--surface-muted)]" />
                ) : (
                  <h3 className="text-3xl font-extrabold text-[var(--text)] mt-1 transition-colors duration-300 group-hover:text-[var(--accent)]">
                    {stats.total}
                  </h3>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] transition-all duration-300 group-hover:scale-105">
                <Users size={22} />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[var(--accent)] to-[rgba(233,196,106,0.5)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Card 2: Active Users */}
          <div className="card group relative overflow-hidden p-5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Active Accounts
                </p>
                {loadingStats ? (
                  <div className="mt-2 h-8 w-16 animate-pulse rounded bg-[var(--surface-muted)]" />
                ) : (
                  <h3 className="text-3xl font-extrabold text-[var(--text)] mt-1 transition-colors duration-300 group-hover:text-[var(--success)]">
                    {stats.active}
                  </h3>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(95,127,53,0.1)] text-[var(--success)] transition-all duration-300 group-hover:scale-105">
                <UserCheck size={22} />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--success)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Card 3: Inactive Users */}
          <div className="card group relative overflow-hidden p-5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Inactive Accounts
                </p>
                {loadingStats ? (
                  <div className="mt-2 h-8 w-16 animate-pulse rounded bg-[var(--surface-muted)]" />
                ) : (
                  <h3 className="text-3xl font-extrabold text-[var(--text)] mt-1 transition-colors duration-300 group-hover:text-[var(--danger)]">
                    {stats.inactive}
                  </h3>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(181,71,59,0.1)] text-[var(--danger)] transition-all duration-300 group-hover:scale-105">
                <UserX size={22} />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Card 4: System Admins */}
          <div className="card group relative overflow-hidden p-5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Administrators
                </p>
                {loadingStats ? (
                  <div className="mt-2 h-8 w-16 animate-pulse rounded bg-[var(--surface-muted)]" />
                ) : (
                  <h3 className="text-3xl font-extrabold text-[var(--text)] mt-1 transition-colors duration-300 group-hover:text-[#6C63FF]">
                    {stats.admin}
                  </h3>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(108,99,255,0.1)] text-[#6C63FF] transition-all duration-300 group-hover:scale-105">
                <Shield size={22} />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-[#6C63FF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      )}

      {/* Embedded User Management */}
      <div className="pt-2">
        <AdminUserManagement 
          token={token} 
          currentUser={currentUser} 
          onMutationFinished={fetchStats}
        />
      </div>
    </div>
  );
}
