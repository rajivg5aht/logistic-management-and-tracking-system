"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Shield, 
  User, 
  AlertCircle, 
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { 
  adminGetUsers, 
  adminCreateUser, 
  adminUpdateUser, 
  adminDeleteUser, 
  AdminUserMeta,
  AdminUserPayload 
} from "@/lib/api/admin.api";
import { AuthUser } from "@/lib/api/auth.api";
import Modal from "@/components/ui/Modal";

interface AdminUserManagementProps {
  token: string;
  currentUser: AuthUser;
  onMutationFinished?: () => void;
}

export default function AdminUserManagement({ token, currentUser, onMutationFinished }: AdminUserManagementProps) {
  // Lists & pagination
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [meta, setMeta] = useState<AdminUserMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form payload states
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "customer" as "admin" | "customer" | "driver",
    status: "active" as "active" | "inactive",
  });

  const limit = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch users on query change
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminGetUsers(token, page, limit, searchQuery);
      setUsers(res.data);
      setMeta(res.meta);
      onMutationFinished?.();
    } catch (err: any) {
      setError(err.message || "Failed to load users. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery]);

  // Form handlers
  const handleCreateOpen = () => {
    setFormData({
      fullName: "",
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
      email: user.email,
      password: "", // Leave blank unless changing
      role: user.role,
      status: (user.status as "active" | "inactive") || "active",
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleDeleteOpen = (user: AuthUser) => {
    setSelectedUser(user);
    setFormError(null);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.fullName || !formData.email || !formData.password) {
      setFormError("All required fields must be filled.");
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
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setIsCreateOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || "Failed to create user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError(null);

    if (!formData.fullName || !formData.email) {
      setFormError("Name and Email are required fields.");
      return;
    }

    try {
      setActionLoading(true);
      const payload: Partial<AdminUserPayload> = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
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
    } catch (err: any) {
      setFormError(err.message || "Failed to update user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    try {
      setActionLoading(true);
      await adminDeleteUser(token, selectedUser.id);
      setIsDeleteOpen(false);
      // If we deleted the last user on the page, go to previous page
      if (users.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchUsers();
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  // Pagination helper
  const handlePageChange = (newPage: number) => {
    if (meta && newPage >= 1 && newPage <= meta.totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="page-kicker">Administration</span>
          <h1 className="page-title mt-1">User Management</h1>
          <p className="page-subtitle">View, search, create, update, and delete accounts.</p>
        </div>
        <button
          type="button"
          onClick={handleCreateOpen}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          suppressHydrationWarning
        >
          <Plus size={18} />
          Create User
        </button>
      </div>

      {/* Main Panel */}
      <div className="card overflow-hidden">
        {/* Search Bar & Stats */}
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-[var(--border)] p-5">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-3 flex items-center text-[var(--text-muted)] pointer-events-none">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="form-input pl-10 w-full"
              suppressHydrationWarning
            />
          </div>
          <div className="text-sm font-semibold text-[var(--text-soft)] sm:ml-auto">
            {meta ? `${meta.total} Total Users` : "Loading..."}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-8 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(181,71,59,0.1)] text-[var(--danger)] mb-3">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm font-semibold text-[var(--text)]">{error}</p>
            <button
              type="button"
              onClick={fetchUsers}
              className="btn-secondary btn-sm mt-4 inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* Users Table */}
        {!error && (
          <div className="table-wrap border-none rounded-none shadow-none">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="p-4"><div className="h-4 w-16 bg-[var(--border)] rounded" /></td>
                      <td className="p-4"><div className="h-4 w-28 bg-[var(--border)] rounded" /></td>
                      <td className="p-4"><div className="h-4 w-40 bg-[var(--border)] rounded" /></td>
                      <td className="p-4"><div className="h-6 w-16 bg-[var(--border)] rounded-full" /></td>
                      <td className="p-4"><div className="h-6 w-16 bg-[var(--border)] rounded-full" /></td>
                      <td className="p-4"><div className="h-6 w-20 bg-[var(--border)] rounded" /></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[var(--text-muted)] font-medium">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="font-mono text-xs text-[var(--text-muted)]">
                        {user.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="font-bold text-[var(--text)]">
                        {user.fullName}
                      </td>
                      <td className="text-sm text-[var(--text-soft)]">
                        {user.email}
                      </td>
                      <td className="capitalize">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                          user.role === "admin" 
                            ? "bg-[var(--accent-soft)] text-[var(--accent-strong)] border border-[rgba(200,162,74,0.3)]" 
                            : "bg-[var(--surface-muted)] text-[var(--text-soft)]"
                        }`}>
                          {user.role === "admin" ? <Shield size={12} /> : <User size={12} />}
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          user.status === "inactive" 
                            ? "bg-[rgba(181,71,59,0.1)] text-[var(--danger)]" 
                            : "bg-[rgba(95,127,53,0.1)] text-[var(--success)]"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            user.status === "inactive" ? "bg-[var(--danger)]" : "bg-[var(--success)]"
                          }`} />
                          {user.status || "active"}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {currentUser.id !== user.id && (
                            <button
                              type="button"
                              onClick={() => handleEditOpen(user)}
                              className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] rounded-lg transition-colors cursor-pointer"
                              title="Edit User"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {currentUser.id !== user.id && (
                            <button
                              type="button"
                              onClick={() => handleDeleteOpen(user)}
                              className="p-1.5 text-[var(--text-muted)] hover:bg-[rgba(181,71,59,0.1)] hover:text-[var(--danger)] rounded-lg transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Section */}
        {meta && meta.totalPages > 1 && !error && (
          <div className="flex items-center justify-between border-t border-[var(--border)] p-4 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="btn-secondary btn-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === meta.totalPages}
                className="btn-secondary btn-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">
                  Showing Page <span className="font-semibold text-[var(--text)]">{page}</span> of{" "}
                  <span className="font-semibold text-[var(--text)]">{meta.totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-xl shadow-xs gap-1" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 border border-[var(--border)] rounded-lg text-[var(--text-soft)] hover:bg-[var(--surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {Array.from({ length: meta.totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1.5 text-sm font-semibold rounded-lg border transition-all cursor-pointer ${
                          page === pageNum
                            ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--text-on-accent)]"
                            : "border-[var(--border)] text-[var(--text-soft)] hover:bg-[var(--surface-soft)]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === meta.totalPages}
                    className="p-2 border border-[var(--border)] rounded-lg text-[var(--text-soft)] hover:bg-[var(--surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New User">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && <div className="form-error">{formError}</div>}
          
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

          <div>
            <label className="form-label" htmlFor="role">User Role *</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as "customer" | "driver" })}
              className="form-input"
            >
              <option value="customer">Customer</option>
              <option value="driver">Driver</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
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

      {/* EDIT MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit User">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && <div className="form-error">{formError}</div>}

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
              <label className="form-label" htmlFor="edit-role">Role *</label>
              <select
                id="edit-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as "customer" | "driver" })}
                className="form-input"
              >
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
              </select>
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

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
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

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Delete">
        <div className="space-y-4">
          {formError && <div className="form-error">{formError}</div>}
          
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(181,71,59,0.1)] text-[var(--danger)]">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">
                Are you sure you want to delete this user?
              </p>
              <p className="text-sm text-[var(--text-soft)] mt-1">
                This action cannot be undone. User <span className="font-bold text-[var(--text)]">"{selectedUser?.fullName}"</span> ({selectedUser?.email}) will be permanently deleted from the database.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
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
              className="bg-[var(--danger)] hover:bg-[#9a382d] text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
