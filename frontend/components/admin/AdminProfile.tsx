"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BadgeCheck,
  Camera,
  KeyRound,
  LogOut,
  Shield,
  UserRoundCog,
} from "lucide-react";
import {
  updateAdminPasswordAction,
  updateAdminProfileAction,
  type AuthFormState,
} from "@/actions/auth.actions";
import { useAuth } from "@/context/AuthContext";
import type { AuthUser } from "@/lib/api/auth.api";
import {
  formatMemberSince,
  formatStatusLabel,
  getInitials,
  resolveProfileImage,
} from "@/lib/ui-helpers";

const initialState: AuthFormState = { success: false };
const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;

type Tab = "profile" | "security";

interface AdminProfileProps {
  user: AuthUser;
}

export default function AdminProfile({ user }: AdminProfileProps) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [previewImage, setPreviewImage] = useState<string | null>(() =>
    resolveProfileImage(user.profileImage),
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileFormRef = useRef<HTMLFormElement>(null);
  const passwordFormRef = useRef<HTMLFormElement>(null);

  const [profileState, profileAction, profilePending] = useActionState(
    updateAdminProfileAction,
    initialState,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    updateAdminPasswordAction,
    initialState,
  );

  useEffect(() => {
    if (!profileState.success || !profileState.user) return;

    setCurrentUser(profileState.user);
    setUser(profileState.user);
    setPreviewImage(resolveProfileImage(profileState.user.profileImage));
    setImageUnavailable(false);
    setImageError(null);
    router.refresh();
  }, [profileState.success, profileState.user, router, setUser]);

  useEffect(() => {
    if (passwordState.success) {
      passwordFormRef.current?.reset();
    }
  }, [passwordState.success]);

  const initials = useMemo(
    () => getInitials(currentUser.fullName, "AD"),
    [currentUser.fullName],
  );
  const statusLabel = formatStatusLabel(currentUser.status);
  const activeFormId = activeTab === "profile" ? "admin-profile-form" : "admin-security-form";
  const isPending = activeTab === "profile" ? profilePending : passwordPending;
  const visibleImage = previewImage && !imageUnavailable ? previewImage : null;

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
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      setImageUnavailable(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDiscard = () => {
    if (activeTab === "profile") {
      profileFormRef.current?.reset();
      setPreviewImage(resolveProfileImage(currentUser.profileImage));
      setImageUnavailable(false);
      setImageError(null);
      return;
    }

    passwordFormRef.current?.reset();
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">
            Admin Profile
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Manage your administrator information and account security.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="reset"
            form={activeFormId}
            onClick={handleDiscard}
            className="btn-secondary btn-sm"
            disabled={isPending}
          >
            Discard
          </button>
          <button
            type="submit"
            form={activeFormId}
            disabled={isPending}
            className="btn-primary btn-sm"
          >
            {isPending
              ? "Saving..."
              : activeTab === "profile"
                ? "Save Changes"
                : "Update Password"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-[var(--border)]">
        {[
          { id: "profile", label: "Profile" },
          { id: "security", label: "Security" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`relative -mb-px pb-3 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "text-[var(--accent-strong)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--accent-strong)]" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {activeTab === "profile" ? (
            <form
              key={`${currentUser.id}-${currentUser.email}-${currentUser.phoneNumber}`}
              id="admin-profile-form"
              ref={profileFormRef}
              action={profileAction}
              className="card p-6 sm:p-8"
            >
              <h2 className="text-base font-bold text-[var(--text)]">
                Personal Profile
              </h2>

              {profileState.message && (
                <div className={`mt-4 ${profileState.success ? "form-success" : "form-error"}`}>
                  {profileState.message}
                </div>
              )}

              <div className="mt-6 flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="h-24 w-24 overflow-hidden rounded-2xl border border-[rgba(200,162,74,0.25)] shadow-sm">
                    {visibleImage ? (
                      <Image
                        src={visibleImage}
                        alt={currentUser.fullName}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                        onError={() => setImageUnavailable(true)}
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[var(--accent-soft)] text-3xl font-bold text-[var(--text)]">
                        {initials}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--surface)] bg-[var(--accent)] text-[var(--text-on-accent)] shadow-lg transition-colors hover:bg-[var(--accent-hover)]"
                    aria-label="Update profile photo"
                  >
                    <Camera size={14} />
                  </button>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-[var(--text)]">
                    {currentUser.fullName}
                  </h3>
                  <p className="text-sm capitalize text-[var(--text-muted)]">
                    Administrator
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
              />
              {imageError && <p className="mt-3 text-sm text-[var(--danger)]">{imageError}</p>}

              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="adminFullName" className="settings-label">
                    Full Name
                  </label>
                  <input
                    id="adminFullName"
                    name="fullName"
                    type="text"
                    defaultValue={currentUser.fullName}
                    className="form-input"
                    autoComplete="name"
                    required
                  />
                  {profileState.fieldErrors?.fullName && (
                    <p className="mt-1 text-sm text-[var(--danger)]">
                      {profileState.fieldErrors.fullName[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="adminEmail" className="settings-label">
                    Email Address
                  </label>
                  <input
                    id="adminEmail"
                    name="email"
                    type="email"
                    defaultValue={currentUser.email}
                    className="form-input"
                    autoComplete="email"
                    required
                  />
                  {profileState.fieldErrors?.email && (
                    <p className="mt-1 text-sm text-[var(--danger)]">
                      {profileState.fieldErrors.email[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="adminPhoneNumber" className="settings-label">
                    Phone Number
                  </label>
                  <input
                    id="adminPhoneNumber"
                    name="phoneNumber"
                    type="tel"
                    defaultValue={currentUser.phoneNumber}
                    className="form-input"
                    autoComplete="tel"
                    required
                  />
                  {profileState.fieldErrors?.phoneNumber && (
                    <p className="mt-1 text-sm text-[var(--danger)]">
                      {profileState.fieldErrors.phoneNumber[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="settings-label">Protected Role</label>
                  <div className="flex h-12 items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-4 text-sm font-bold text-[var(--text-muted)]">
                    Administrator
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <form
              id="admin-security-form"
              ref={passwordFormRef}
              action={passwordAction}
              className="card p-6 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                  <KeyRound size={17} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-[var(--text)]">Change Password</h2>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Confirm your current password before setting a new one.
                  </p>
                </div>
              </div>

              {passwordState.message && (
                <div className={`mt-4 ${passwordState.success ? "form-success" : "form-error"}`}>
                  {passwordState.message}
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="adminCurrentPassword" className="settings-label">
                    Current Password
                  </label>
                  <input
                    id="adminCurrentPassword"
                    name="currentPassword"
                    type="password"
                    className="form-input"
                    autoComplete="current-password"
                    required
                  />
                  {passwordState.fieldErrors?.currentPassword && (
                    <p className="mt-1 text-sm text-[var(--danger)]">
                      {passwordState.fieldErrors.currentPassword[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="adminNewPassword" className="settings-label">
                    New Password
                  </label>
                  <input
                    id="adminNewPassword"
                    name="newPassword"
                    type="password"
                    className="form-input"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                  {passwordState.fieldErrors?.newPassword && (
                    <p className="mt-1 text-sm text-[var(--danger)]">
                      {passwordState.fieldErrors.newPassword[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="adminConfirmPassword" className="settings-label">
                    Confirm New Password
                  </label>
                  <input
                    id="adminConfirmPassword"
                    name="confirmPassword"
                    type="password"
                    className="form-input"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                  {passwordState.fieldErrors?.confirmPassword && (
                    <p className="mt-1 text-sm text-[var(--danger)]">
                      {passwordState.fieldErrors.confirmPassword[0]}
                    </p>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                <Shield size={16} />
              </span>
              <h3 className="text-sm font-bold text-[var(--text)]">Security</h3>
            </div>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              Keep administrator access protected with a unique password.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className="btn-secondary btn-sm mt-4 w-full"
            >
              <KeyRound size={15} />
              Change Password
            </button>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                <UserRoundCog size={16} />
              </span>
              <h3 className="text-sm font-bold text-[var(--text)]">Account Summary</h3>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[var(--text-muted)]">Status</dt>
                <dd>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-bold text-[var(--accent-strong)]">
                    <BadgeCheck size={12} />
                    {statusLabel}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] pt-3">
                <dt className="text-[var(--text-muted)]">Role</dt>
                <dd className="font-semibold text-[var(--text)]">Administrator</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-t border-[var(--border)] pt-3">
                <dt className="shrink-0 text-[var(--text-muted)]">Email</dt>
                <dd className="break-all text-right font-semibold text-[var(--text)]">{currentUser.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] pt-3">
                <dt className="text-[var(--text-muted)]">Member Since</dt>
                <dd className="text-right font-semibold text-[var(--text)]">
                  {formatMemberSince(currentUser.createdAt)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-bold text-[var(--text)]">Account Actions</h3>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="btn-secondary btn-sm mt-4 w-full text-[var(--danger)]"
            >
              <LogOut size={15} />
              {loggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
