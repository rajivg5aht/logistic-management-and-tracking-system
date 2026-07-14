"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Camera,
  IdCard,
  KeyRound,
  LogOut,
  Mail,
  Pencil,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  User as UserIcon,
  X,
} from "lucide-react";
import {
  updatePasswordAction,
  updateProfileAction,
  type AuthFormState,
} from "@/actions/auth.actions";
import { useAuth } from "@/context/AuthContext";
import type { AuthUser } from "@/lib/api/auth.api";
import { API_BASE_URL } from "@/lib/config";
import { getInitials } from "@/lib/ui-helpers";

const initialState: AuthFormState = { success: false };
const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

type AdminProfileTab = "overview" | "edit" | "security";

type InfoItem = {
  label: string;
  value: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
};

interface AdminProfileProps {
  user: AuthUser;
}

function formatRole(role: AuthUser["role"]): string {
  return role
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatStatus(status?: string): string {
  return (status || "active")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value?: string): string {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function resolveProfileImage(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("data:") || value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (value.startsWith("/")) {
    return `${API_BASE_URL}${value}`;
  }
  return value;
}

function displayValue(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Not provided";
}

function InfoCard({ title, items }: { title: string; items: InfoItem[] }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      <h2 className="text-base font-extrabold text-[#0C3B67]">{title}</h2>
      <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.Icon;
          return (
            <div
              key={item.label}
              className="rounded-xl border border-[var(--border)] bg-[var(--app-bg-soft)] p-4"
            >
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <Icon size={14} className="text-[#123E6B]" />
                <dt>{item.label}</dt>
              </div>
              <dd className="mt-2 break-words text-sm font-bold text-[var(--text)]">
                {item.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

export default function AdminProfile({ user }: AdminProfileProps) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);
  const [activeTab, setActiveTab] = useState<AdminProfileTab>("overview");
  const [previewImage, setPreviewImage] = useState<string | null>(() =>
    resolveProfileImage(user.profileImage),
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileFormRef = useRef<HTMLFormElement>(null);

  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileAction,
    initialState,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  useEffect(() => {
    if (!profileState.success || !profileState.user) return;

    setCurrentUser(profileState.user);
    setUser(profileState.user);
    setPreviewImage(resolveProfileImage(profileState.user.profileImage));
    setImageError(null);
    setActiveTab("overview");
    router.refresh();
  }, [profileState.success, profileState.user, router, setUser]);

  const initials = useMemo(
    () => getInitials(currentUser.fullName, "AD"),
    [currentUser.fullName],
  );
  const roleLabel = formatRole(currentUser.role);
  const statusLabel = formatStatus(currentUser.status);
  const isActive = (currentUser.status || "active") === "active";

  const personalInfo: InfoItem[] = [
    { label: "Full name", value: displayValue(currentUser.fullName), Icon: UserIcon },
    { label: "Email", value: displayValue(currentUser.email), Icon: Mail },
    { label: "Phone", value: displayValue(currentUser.phoneNumber), Icon: Phone },
  ];

  const administrativeInfo: InfoItem[] = [
    { label: "Admin ID", value: currentUser.id, Icon: IdCard },
    { label: "Role", value: roleLabel, Icon: Shield },
    { label: "Status", value: statusLabel, Icon: BadgeCheck },
    { label: "Created", value: formatDate(currentUser.createdAt), Icon: CalendarDays },
  ];

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImageError(null);

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Choose a JPG, PNG, or GIF image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setImageError("Profile image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const startEditing = () => {
    setPreviewImage(resolveProfileImage(currentUser.profileImage));
    setImageError(null);
    setActiveTab("edit");
  };

  const cancelEditing = () => {
    profileFormRef.current?.reset();
    setPreviewImage(resolveProfileImage(currentUser.profileImage));
    setImageError(null);
    setActiveTab("overview");
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
      router.push("/login");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[#123E6B] transition-colors hover:text-[#0C3B67]"
            suppressHydrationWarning
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-2xl font-black tracking-tight text-[#0C3B67] sm:text-3xl">
            Admin Profile
          </h1>
          <p className="mt-1 text-sm font-medium text-[var(--text-soft)]">
            Manage your administrator identity, security, and account access.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "edit" ? (
            <>
              <button
                type="button"
                onClick={cancelEditing}
                className="btn-secondary btn-sm"
                disabled={profilePending}
                suppressHydrationWarning
              >
                <X size={15} />
                Cancel
              </button>
              <button
                type="submit"
                form="admin-profile-form"
                className="btn-primary btn-sm"
                disabled={profilePending}
                suppressHydrationWarning
              >
                <Save size={15} />
                {profilePending ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : activeTab === "security" ? (
            <button
              type="submit"
              form="admin-security-form"
              className="btn-primary btn-sm"
              disabled={passwordPending}
              suppressHydrationWarning
            >
              <KeyRound size={15} />
              {passwordPending ? "Updating..." : "Update Password"}
            </button>
          ) : (
            <button
              type="button"
              onClick={startEditing}
              className="btn-primary btn-sm"
              suppressHydrationWarning
            >
              <Pencil size={15} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {profileState.success && profileState.message && activeTab === "overview" && (
        <div className="form-success">{profileState.message}</div>
      )}

      <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="h-28 w-28 overflow-hidden rounded-2xl border border-[#C8D6E2] bg-[#E8F0FB] shadow-sm">
                {previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewImage}
                    alt={currentUser.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-black text-[#123E6B]">
                    {initials}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (activeTab !== "edit") startEditing();
                  window.setTimeout(() => fileInputRef.current?.click(), 0);
                }}
                className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[var(--surface)] bg-[var(--accent)] text-[var(--text-on-accent)] shadow-lg transition-colors hover:bg-[var(--accent-hover)]"
                aria-label="Update profile photo"
                suppressHydrationWarning
              >
                <Camera size={16} />
              </button>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F0FB] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#123E6B]">
                  <ShieldCheck size={13} />
                  {roleLabel}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                    isActive
                      ? "bg-[#E6F4EC] text-[#1F9D57]"
                      : "bg-[#FBE4E1] text-[#D0453A]"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {statusLabel}
                </span>
              </div>
              <h2 className="mt-3 truncate text-2xl font-black tracking-tight text-[#0C3B67] sm:text-3xl">
                {currentUser.fullName}
              </h2>
              <p className="mt-1 break-words text-sm font-semibold text-[var(--text-soft)]">
                {currentUser.email}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                Admin account details are loaded from the authenticated backend session. Protected access fields remain managed by the system.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--app-bg-soft)] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Role</p>
              <p className="mt-1 text-sm font-black text-[#0C3B67]">{roleLabel}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--app-bg-soft)] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Member Since</p>
              <p className="mt-1 text-sm font-black text-[#0C3B67]">{formatDate(currentUser.createdAt)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex gap-6 border-b border-[var(--border)]">
        {[
          { id: "overview" as const, label: "Overview" },
          { id: "edit" as const, label: "Edit Profile" },
          { id: "security" as const, label: "Security" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => (tab.id === "edit" ? startEditing() : setActiveTab(tab.id))}
            className={`relative -mb-px pb-3 text-sm font-bold transition-colors ${
              activeTab === tab.id
                ? "text-[#123E6B]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
            suppressHydrationWarning
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#123E6B]" />
            )}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <InfoCard title="Personal Information" items={personalInfo} />
            <InfoCard title="Administrative Information" items={administrativeInfo} />
          </div>

          <aside className="space-y-6">
            <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-extrabold text-[#0C3B67]">Account Settings</h2>
              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={startEditing}
                  className="btn-secondary btn-sm w-full justify-start"
                  suppressHydrationWarning
                >
                  <Pencil size={15} />
                  Edit profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    startEditing();
                    window.setTimeout(() => fileInputRef.current?.click(), 0);
                  }}
                  className="btn-secondary btn-sm w-full justify-start"
                  suppressHydrationWarning
                >
                  <Camera size={15} />
                  Update photo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("security")}
                  className="btn-secondary btn-sm w-full justify-start"
                  suppressHydrationWarning
                >
                  <KeyRound size={15} />
                  Change password
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="btn-secondary btn-sm w-full justify-start text-[var(--danger)] hover:text-[var(--danger)]"
                  suppressHydrationWarning
                >
                  <LogOut size={15} />
                  {loggingOut ? "Signing out..." : "Logout"}
                </button>
              </div>
            </section>

            <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[#0C3B67] p-5 text-white shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <h2 className="text-sm font-black">Access Protected</h2>
                  <p className="text-xs font-medium text-white/70">Role and status are system-managed.</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      )}

      {activeTab === "edit" && (
        <form
          id="admin-profile-form"
          ref={profileFormRef}
          action={profileAction}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6 lg:p-8"
          suppressHydrationWarning
        >
          <div className="flex flex-col gap-5 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border border-[#C8D6E2] bg-[#E8F0FB] shadow-sm">
                {previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewImage} alt={currentUser.fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-black text-[#123E6B]">
                    {initials}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--surface)] bg-[var(--accent)] text-[var(--text-on-accent)] shadow-lg transition-colors hover:bg-[var(--accent-hover)]"
                aria-label="Choose profile image"
                suppressHydrationWarning
              >
                <Camera size={14} />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0C3B67]">Edit Admin Profile</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Update contact details and profile photo. Role, ID, and account status are read-only.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            name="profileImage"
            accept="image/jpeg,image/png,image/gif"
            onChange={handleImageChange}
            className="hidden"
            suppressHydrationWarning
          />

          {imageError && <div className="form-error mt-5">{imageError}</div>}
          {profileState.message && activeTab === "edit" && (
            <div className={`mt-5 ${profileState.success ? "form-success" : "form-error"}`}>
              {profileState.message}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="adminFullName" className="settings-label">Full Name</label>
              <input
                id="adminFullName"
                name="fullName"
                type="text"
                defaultValue={currentUser.fullName}
                className="form-input"
                required
                suppressHydrationWarning
              />
              {profileState.fieldErrors?.fullName && (
                <p className="mt-1 text-sm text-[var(--danger)]">{profileState.fieldErrors.fullName[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="adminEmail" className="settings-label">Email Address</label>
              <input
                id="adminEmail"
                name="email"
                type="email"
                defaultValue={currentUser.email}
                className="form-input"
                required
                suppressHydrationWarning
              />
              {profileState.fieldErrors?.email && (
                <p className="mt-1 text-sm text-[var(--danger)]">{profileState.fieldErrors.email[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="adminPhone" className="settings-label">Phone Number</label>
              <input
                id="adminPhone"
                name="phoneNumber"
                type="tel"
                defaultValue={currentUser.phoneNumber}
                className="form-input"
                required
                suppressHydrationWarning
              />
              {profileState.fieldErrors?.phoneNumber && (
                <p className="mt-1 text-sm text-[var(--danger)]">{profileState.fieldErrors.phoneNumber[0]}</p>
              )}
            </div>

            <div>
              <label className="settings-label">Protected Role</label>
              <div className="flex h-12 items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-sm font-bold capitalize text-[var(--text-muted)]">
                {roleLabel}
              </div>
            </div>
          </div>
        </form>
      )}

      {activeTab === "security" && (
        <form
          id="admin-security-form"
          action={passwordAction}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6 lg:p-8"
          suppressHydrationWarning
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8F0FB] text-[#123E6B]">
              <KeyRound size={18} />
            </span>
            <div>
              <h2 className="text-lg font-black text-[#0C3B67]">Change Password</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Set a new password for this admin account. Password values are never displayed.
              </p>
            </div>
          </div>

          {passwordState.message && (
            <div className={`mt-5 ${passwordState.success ? "form-success" : "form-error"}`}>
              {passwordState.message}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="adminNewPassword" className="settings-label">New Password</label>
              <input
                id="adminNewPassword"
                name="newPassword"
                type="password"
                className="form-input"
                minLength={6}
                required
                suppressHydrationWarning
              />
              {passwordState.fieldErrors?.newPassword && (
                <p className="mt-1 text-sm text-[var(--danger)]">{passwordState.fieldErrors.newPassword[0]}</p>
              )}
            </div>
            <div>
              <label htmlFor="adminConfirmPassword" className="settings-label">Confirm New Password</label>
              <input
                id="adminConfirmPassword"
                name="confirmPassword"
                type="password"
                className="form-input"
                minLength={6}
                required
                suppressHydrationWarning
              />
              {passwordState.fieldErrors?.confirmPassword && (
                <p className="mt-1 text-sm text-[var(--danger)]">{passwordState.fieldErrors.confirmPassword[0]}</p>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
