"use client";

import { useActionState, useRef, useState } from "react";
import {
  updateProfileAction,
  updatePasswordAction,
  AuthFormState,
} from "@/actions/auth.actions";
import type { AuthUser } from "@/lib/api/auth.api";
import {
  Camera,
  Shield,
  KeyRound,
  BadgeCheck,
  Headphones,
  ChevronRight,
} from "lucide-react";

const initialState: AuthFormState = { success: false };

type Tab = "profile" | "security";

interface AccountSettingsProps {
  user: AuthUser;
}

function formatMemberSince(createdAt?: string): string {
  if (!createdAt) return "—";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const [profileState, profileAction, profilePending] = useActionState(
    updateProfileAction,
    initialState,
  );
  const [passwordState, passwordAction, passwordPending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  const [previewImage, setPreviewImage] = useState<string | null>(
    user.profileImage,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileFormRef = useRef<HTMLFormElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDiscard = () => {
    if (activeTab === "profile") {
      profileFormRef.current?.reset();
      setPreviewImage(user.profileImage);
    }
  };

  const activeFormId =
    activeTab === "profile" ? "profile-form" : "security-form";
  const isPending = activeTab === "profile" ? profilePending : passwordPending;

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
  ];

  const statusLabel = (user.status || "active").toUpperCase();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
        <span>Profile</span>
        <ChevronRight size={12} />
        <span className="text-[var(--text)]">Account</span>
      </nav>

      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Manage your personal information and preferences.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="reset"
            form={activeFormId}
            onClick={handleDiscard}
            className="btn-secondary btn-sm"
            suppressHydrationWarning
          >
            Discard
          </button>
          <button
            type="submit"
            form={activeFormId}
            disabled={isPending}
            className="btn-primary btn-sm"
            suppressHydrationWarning
          >
            {isPending
              ? "Saving..."
              : activeTab === "profile"
                ? "Save Changes"
                : "Update Password"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[var(--border)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative -mb-px pb-3 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "text-[var(--accent-strong)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
            suppressHydrationWarning
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[var(--accent-strong)]" />
            )}
          </button>
        ))}
      </div>

      {/* Body: two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {activeTab === "profile" ? (
            <form
              id="profile-form"
              ref={profileFormRef}
              action={profileAction}
              className="card p-6 sm:p-8"
              suppressHydrationWarning
            >
              <h2 className="text-base font-bold text-[var(--text)]">
                Personal Profile
              </h2>

              {profileState.message && (
                <div
                  className={`mt-4 ${
                    profileState.success ? "form-success" : "form-error"
                  }`}
                >
                  {profileState.message}
                </div>
              )}

              {/* Avatar */}
              <div className="mt-6 flex items-center gap-5">
                <div className="relative shrink-0">
                  <div className="h-24 w-24 overflow-hidden rounded-2xl border border-[rgba(200,162,74,0.25)] shadow-sm">
                    {previewImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewImage}
                        alt={user.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[var(--accent-soft)] text-3xl font-bold text-[var(--text)]">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[var(--surface)] bg-[var(--accent)] text-[var(--text-on-accent)] shadow-lg transition-colors hover:bg-[var(--accent-hover)]"
                    aria-label="Update profile photo"
                    suppressHydrationWarning
                  >
                    <Camera size={14} />
                  </button>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-[var(--text)]">
                    {user.fullName}
                  </h3>
                  <p className="text-sm capitalize text-[var(--text-muted)]">
                    {user.role}
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                suppressHydrationWarning
              />

              {/* Fields */}
              <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="settings-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    defaultValue={user.fullName}
                    className="form-input"
                    required
                    suppressHydrationWarning
                  />
                  {profileState.fieldErrors?.fullName && (
                    <p className="mt-1 text-sm text-[var(--danger)]">
                      {profileState.fieldErrors.fullName[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="settings-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={user.email}
                    className="form-input"
                    required
                    suppressHydrationWarning
                  />
                  {profileState.fieldErrors?.email && (
                    <p className="mt-1 text-sm text-[var(--danger)]">
                      {profileState.fieldErrors.email[0]}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="phoneNumber" className="settings-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    defaultValue={user.phoneNumber}
                    className="form-input"
                    required
                    suppressHydrationWarning
                  />
                  {profileState.fieldErrors?.phoneNumber && (
                    <p className="mt-1 text-sm text-[var(--danger)]">
                      {profileState.fieldErrors.phoneNumber[0]}
                    </p>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <form
              id="security-form"
              action={passwordAction}
              className="card p-6 sm:p-8"
            >
              <h2 className="text-base font-bold text-[var(--text)]">
                Change Password
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Update the password you use to sign in.
              </p>

              {passwordState.message && (
                <div
                  className={`mt-4 ${
                    passwordState.success ? "form-success" : "form-error"
                  }`}
                >
                  {passwordState.message}
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="newPassword" className="settings-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className="form-input"
                    required
                    minLength={6}
                    suppressHydrationWarning
                  />
                  {passwordState.fieldErrors?.newPassword && (
                    <p className="mt-1 text-sm text-[var(--danger)]">
                      {passwordState.fieldErrors.newPassword[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="settings-label">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-input"
                    required
                    minLength={6}
                    suppressHydrationWarning
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

        {/* Right column */}
        <div className="space-y-6">
          {/* Security card */}
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
                <Shield size={16} />
              </span>
              <h3 className="text-sm font-bold text-[var(--text)]">Security</h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className="btn-secondary btn-sm mt-4 w-full"
              suppressHydrationWarning
            >
              <KeyRound size={15} />
              Change Password
            </button>
          </div>

          {/* Account Summary */}
          <div className="card p-6">
            <h3 className="text-sm font-bold text-[var(--text)]">
              Account Summary
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[var(--text-muted)]">Status</dt>
                <dd>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-bold text-[var(--accent-strong)]">
                    <BadgeCheck size={12} />
                    {statusLabel}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                <dt className="text-[var(--text-muted)]">Member Since</dt>
                <dd className="font-semibold text-[var(--text)]">
                  {formatMemberSince(user.createdAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                <dt className="text-[var(--text-muted)]">Role</dt>
                <dd className="font-semibold capitalize text-[var(--text)]">
                  {user.role}
                </dd>
              </div>
            </dl>
          </div>

          {/* Need help banner */}
          <div className="card flex items-center gap-3 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <Headphones size={18} />
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--text)]">Need help?</p>
              <p className="text-xs text-[var(--text-muted)]">
                Contact our dedicated support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
