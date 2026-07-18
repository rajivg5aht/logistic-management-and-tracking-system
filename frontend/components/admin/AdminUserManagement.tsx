"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Edit2,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Ban,
  UserCheck,
  Trash2,
  Shield,
  Truck,
  User,
  Filter,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import {
  adminGetUsers,
  adminGetUserStats,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  AdminUserMeta,
  AdminUserPayload,
  AdminUserStats,
} from "@/lib/api/admin.api";
import { AuthUser } from "@/lib/api/auth.api";
import Modal from "@/components/ui/Modal";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { getInitials, getPageNumbers } from "@/lib/ui-helpers";

interface AdminUserManagementProps {
  token: string;
  currentUser: AuthUser;
  onMutationFinished?: () => void;
}

type RoleTab = "all" | "customer" | "driver";

const TABS: { id: RoleTab; label: string }[] = [
  { id: "all", label: "All Users" },
  { id: "customer", label: "Customers" },
  { id: "driver", label: "Drivers" },
];

const AVATAR_STYLES = [
  "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
  "bg-[var(--teal-tint)] text-[var(--teal)]",
  "bg-[rgba(108,99,255,0.12)] text-[var(--step-active)]",
  "bg-[rgba(95,127,53,0.12)] text-[var(--success)]",
];

const ROLE_CONFIG: Record<string, { label: string; Icon: LucideIcon; cls: string }> = {
  admin: { label: "Admin", Icon: Shield, cls: "bg-[var(--teal-tint)] text-[var(--teal)]" },
  driver: { label: "Driver", Icon: Truck, cls: "bg-[var(--accent-soft)] text-[var(--accent-strong)]" },
  customer: { label: "Customer", Icon: User, cls: "bg-[rgba(95,127,53,0.12)] text-[var(--success)]" },
};

function formatRegDate(value?: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUserManagement({ token, currentUser, onMutationFinished }: AdminUserManagementProps) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [meta, setMeta] = useState<AdminUserMeta | null>(null);
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<RoleTab>("all");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    role: "customer" as "admin" | "customer" | "driver",
    status: "active" as "active" | "inactive",
  });

  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchUsers = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }
        const role = activeTab === "all" ? undefined : activeTab;
        const res = await adminGetUsers(
          token,
          page,
          limit,
          searchQuery,
          role,
        );
        setUsers(res.data);
        setMeta(res.meta);
        adminGetUserStats(token).then(setStats).catch(() => {});
        onMutationFinished?.();
      } catch (err: unknown) {
        if (!silent) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load users. Please check your connection.",
          );
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token, page, searchQuery, activeTab, onMutationFinished],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useAutoRefresh(() => fetchUsers(true));

  const handleCreateOpen = () => {
    setFormData({
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      role: "customer",
      status: "active",
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleEditOpen = (user: AuthUser) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber || "",
      email: user.email,
      password: "",
      role: user.role,
      status: (user.status as "active" | "inactive") || "active",
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleDeleteOpen = (user: AuthUser) => {
    setSelectedUser(user);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.fullName || !formData.phoneNumber || !formData.email || !formData.password) {
      setFormError("All required fields must be filled.");
      return;
    }

    if (formData.phoneNumber.trim().length < 10) {
      setFormError("Phone number must be at least 10 digits long.");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setActionLoading(true);
      await adminCreateUser(token, {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email,
        password: formData.password,
        role: "customer",
      });
      setIsCreateOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create user.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError(null);

    if (!formData.fullName || !formData.email || !formData.phoneNumber) {
      setFormError("Name, Phone and Email are required fields.");
      return;
    }

    if (formData.phoneNumber.trim().length < 10) {
      setFormError("Phone number must be at least 10 digits long.");
      return;
    }

    try {
      setActionLoading(true);
      const payload: Partial<AdminUserPayload> = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber.trim(),
        status: formData.status,
      };

      if (formData.password) {
        if (formData.password.length < 6) {
          setFormError("Password must be at least 6 characters long.");
          setActionLoading(false);
          return;
        }
        payload.password = formData.password;
      }

      await adminUpdateUser(token, selectedUser.id, payload);
      setIsEditOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to update user.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user: AuthUser) => {
    const nextStatus = user.status === "inactive" ? "active" : "inactive";
    try {
      setActionLoading(true);
      setError(null);
      await adminUpdateUser(token, user.id, {
        fullName: user.fullName,
        email: user.email,
        status: nextStatus,
      });
      fetchUsers();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to update user status.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      setDeleteError(null);
      await adminDeleteUser(token, selectedUser.id);
      setIsDeleteOpen(false);
      fetchUsers();
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete user.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (meta && newPage >= 1 && newPage <= meta.totalPages) {
      setPage(newPage);
    }
  };

  const visibleUsers = users;
  const rangeStart = meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const rangeEnd = meta ? (meta.page - 1) * meta.limit + users.length : 0;

  const regTrend = stats?.registrationTrend ?? [];
  const regTrendMax = Math.max(1, ...regTrend.map((b) => b.count));

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-black tracking-tight text-[var(--teal)]">User Management</h1>
        <div className="relative sm:w-72 lg:w-80">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[var(--text-muted)]">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search system users..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="form-input w-full rounded-full pl-11"
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-1 self-start rounded-xl bg-[var(--surface-muted)] p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[var(--surface)] text-[var(--teal)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
              suppressHydrationWarning
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleCreateOpen}
          className="btn-primary flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          suppressHydrationWarning
        >
          <Plus size={18} />
          Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent-hover)]">Total Users</p>
          <p className="mt-2 text-4xl font-black tracking-tight text-[var(--text)]">
            {meta ? meta.total.toLocaleString() : "-"}
          </p>
          {stats ? (
            <p
              className={`mt-2 flex items-center gap-1 text-xs font-bold ${
                stats.growthPct >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"
              }`}
            >
              {stats.growthPct >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {stats.growthPct >= 0 ? "+" : ""}
              {stats.growthPct}% vs last month
            </p>
          ) : (
            <p className="mt-2 text-xs font-medium text-[var(--text-muted)]">Registration trend</p>
          )}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent-hover)]">New Signups</p>
          <p className="mt-2 text-4xl font-black tracking-tight text-[var(--accent-hover)]">
            {stats ? stats.newSignups24h.toLocaleString() : "-"}
          </p>
          <p className="mt-2 text-xs font-medium text-[var(--text-muted)]">Last 24 hours</p>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--accent-hover)]">System Uptime</p>
          <p className="mt-2 text-4xl font-black tracking-tight text-[var(--teal)]">99.9%</p>
          <p className="mt-2 text-xs font-medium text-[var(--text-muted)]">Service Healthy</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h3 className="text-sm font-extrabold text-[var(--text)]">Registered Personnel</h3>
          <div className="flex items-center gap-1 text-[var(--text-muted)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)]">
              <Filter size={16} />
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)]">
              <MoreVertical size={16} />
            </span>
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center">
            <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(181,71,59,0.1)] text-[var(--danger)]">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-semibold text-[var(--text)]">{error}</p>
            <button
              type="button"
              onClick={() => fetchUsers()}
              className="btn-secondary btn-sm mt-4 inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : (
          <div className="table-wrap rounded-none border-none shadow-none">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[var(--border)]" />
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-28 rounded bg-[var(--border)]" />
                            <div className="h-3 w-40 rounded bg-[var(--border)]" />
                          </div>
                        </div>
                      </td>
                      <td><div className="h-4 w-24 rounded bg-[var(--border)]" /></td>
                      <td><div className="h-6 w-16 rounded-full bg-[var(--border)]" /></td>
                      <td><div className="h-6 w-16 rounded-full bg-[var(--border)]" /></td>
                      <td><div className="h-4 w-20 rounded bg-[var(--border)]" /></td>
                      <td><div className="ml-auto h-6 w-20 rounded bg-[var(--border)]" /></td>
                    </tr>
                  ))
                ) : visibleUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center font-medium text-[var(--text-muted)]">
                      {activeTab === "all" ? "No users found." : `No ${activeTab}s found.`}
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map((user, idx) => {
                    const status = user.status === "inactive" ? "inactive" : "active";
                    const isSelf = currentUser.id === user.id;
                    const roleCfg =
                      ROLE_CONFIG[user.role] ?? {
                        label: user.role,
                        Icon: User,
                        cls: "bg-[var(--surface-muted)] text-[var(--text-soft)]",
                      };
                    const RoleIcon = roleCfg.Icon;
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AVATAR_STYLES[idx % AVATAR_STYLES.length]}`}>
                              {getInitials(user.fullName)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-bold text-[var(--text)]">{user.fullName}</p>
                              <p className="truncate text-xs text-[var(--text-muted)]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap text-sm text-[var(--text-soft)]">
                          {user.phoneNumber || "-"}
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${roleCfg.cls}`}>
                            <RoleIcon size={13} />
                            {roleCfg.label}
                          </span>
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                            status === "inactive"
                              ? "bg-[rgba(181,71,59,0.1)] text-[var(--danger)]"
                              : "bg-[rgba(95,127,53,0.1)] text-[var(--success)]"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${status === "inactive" ? "bg-[var(--danger)]" : "bg-[var(--success)]"}`} />
                            {status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap text-sm text-[var(--text-soft)]">
                          {formatRegDate(user.createdAt)}
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-1">
                            {user.role === "driver" ? (
                              <Link
                                href="/admin/drivers"
                                className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-[var(--teal)] hover:bg-[var(--teal-tint)]"
                              >
                                Manage driver
                              </Link>
                            ) : !isSelf ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleEditOpen(user)}
                                  className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--text)] cursor-pointer"
                                  title="Edit user"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(user)}
                                  disabled={actionLoading}
                                  className={`rounded-lg p-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                                    status === "inactive"
                                      ? "text-[var(--text-muted)] hover:bg-[rgba(95,127,53,0.1)] hover:text-[var(--success)]"
                                      : "text-[var(--text-muted)] hover:bg-[rgba(181,71,59,0.1)] hover:text-[var(--danger)]"
                                  }`}
                                  title={status === "inactive" ? "Unblock user" : "Block user"}
                                >
                                  {status === "inactive" ? <UserCheck size={16} /> : <Ban size={16} />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOpen(user)}
                                  disabled={actionLoading}
                                  className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[rgba(181,71,59,0.1)] hover:text-[var(--danger)] cursor-pointer disabled:opacity-50"
                                  title="Delete permanently"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            ) : (
                              <span className="pr-2 text-xs font-semibold text-[var(--text-muted)]">You</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {meta && !error && (
          <div className="flex flex-col gap-3 border-t border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-[var(--text-muted)]">
              {meta.total > 0 ? (
                <>
                  Showing <span className="font-semibold text-[var(--text)]">{rangeStart}-{rangeEnd}</span> of{" "}
                  <span className="font-semibold text-[var(--text)]">{meta.total.toLocaleString()}</span> entries
                </>
              ) : (
                "No entries to show"
              )}
            </p>

            {meta.totalPages > 1 && (
              <nav className="flex items-center gap-1.5" aria-label="Pagination">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageNumbers(page, meta.totalPages).map((p, i) =>
                  p === "..." ? (
                    <span key={`e${i}`} className="px-1.5 text-sm font-semibold text-[var(--text-muted)]">...</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePageChange(p)}
                      className={`h-9 min-w-9 rounded-lg border px-2 text-sm font-bold transition-colors cursor-pointer ${
                        page === p
                          ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--text-on-accent)]"
                          : "border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === meta.totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-soft)] transition-colors hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-extrabold text-[var(--teal)]">Quick Insights</h2>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
          <h3 className="text-sm font-extrabold text-[var(--teal)]">
            Registration Growth <span className="font-semibold text-[var(--text-muted)]">(Last 7 Days)</span>
          </h3>
          {!stats ? (
            <div className="mt-8">
              <div className="flex h-40 items-end justify-between gap-3 sm:gap-5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 animate-pulse rounded-t-lg bg-[var(--border)]"
                    style={{ height: `${30 + ((i * 37) % 55)}%` }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between gap-3 sm:gap-5">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-3 flex-1 animate-pulse rounded bg-[var(--border)]" />
                ))}
              </div>
            </div>
          ) : regTrendMax === 1 && regTrend.every((b) => b.count === 0) ? (
            <div className="mt-6 flex h-44 flex-col items-center justify-center gap-1 text-center">
              <p className="text-sm font-semibold text-[var(--text)]">No new registrations yet</p>
              <p className="text-xs text-[var(--text-muted)]">Customer signups from the last 7 days will appear here.</p>
            </div>
          ) : (
            <div className="mt-8">
              <div className="flex h-40 items-end justify-between gap-3 sm:gap-5">
                {regTrend.map((bar, i) => {
                  const pct = bar.count === 0 ? 0 : Math.max(6, (bar.count / regTrendMax) * 100);
                  return (
                    <div
                      key={i}
                      className="relative flex-1 rounded-t-lg bg-[var(--accent)] transition-all duration-500"
                      style={{ height: `${pct}%` }}
                      title={`${bar.count} signup${bar.count === 1 ? "" : "s"}`}
                    >
                      {bar.count > 0 && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-bold text-[var(--text)]">
                          {bar.count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between gap-3 sm:gap-5">
                {regTrend.map((bar, i) => (
                  <span key={i} className="flex-1 text-center text-[11px] font-semibold text-[var(--text-muted)]">
                    {bar.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Customer Account">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && <div className="form-error">{formError}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label" htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                placeholder="e.g. John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="phoneNumber"
                autoComplete="tel"
                placeholder="9800000000"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              placeholder="e.g. john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--text-soft)]">
            This creates a customer account. Drivers are onboarded from Driver Management.
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="btn-secondary btn-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {actionLoading && <Loader2 size={16} className="animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit User">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && <div className="form-error">{formError}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label" htmlFor="edit-fullName">Full Name *</label>
              <input
                type="text"
                id="edit-fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label" htmlFor="edit-phoneNumber">Phone Number *</label>
              <input
                type="tel"
                id="edit-phoneNumber"
                autoComplete="tel"
                placeholder="9800000000"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="edit-email">Email Address *</label>
            <input
              type="email"
              id="edit-email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="edit-password">
              Password <span className="text-xs font-normal text-[var(--text-muted)]">(leave blank to keep current)</span>
            </label>
            <input
              type="password"
              id="edit-password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Role</label>
              <div className="form-input flex items-center capitalize text-[var(--text-muted)]">{formData.role}</div>
            </div>
            <div>
              <label className="form-label" htmlFor="edit-status">Status *</label>
              <select
                id="edit-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                className="form-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="btn-secondary btn-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {actionLoading && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete User Permanently">
        <div className="space-y-4">
          {deleteError && <div className="form-error">{deleteError}</div>}

          <div className="rounded-xl border border-[rgba(181,71,59,0.18)] bg-[rgba(181,71,59,0.06)] p-4 text-sm text-[var(--text)]">
            <p className="font-semibold text-[var(--danger)]">This will permanently delete the account.</p>
            <p className="mt-2 text-[var(--text-soft)]">
              {selectedUser ? (
                <>
                  <span className="font-semibold text-[var(--text)]">{selectedUser.fullName}</span>
                  {" "}({selectedUser.email}) will be removed from the system.
                </>
              ) : (
                "The selected user will be removed from the system."
              )}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-3">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="btn-secondary btn-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteSubmit}
              disabled={actionLoading}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--danger)] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50"
            >
              {actionLoading && <Loader2 size={16} className="animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
