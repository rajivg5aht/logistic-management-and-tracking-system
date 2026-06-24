"use client";

import type { AuthUser } from "@/lib/api/auth.api";
import { Camera } from "lucide-react";

interface ProfileHeaderProps {
  user: AuthUser;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="card flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
      <div className="relative flex-shrink-0">
        <div className="h-24 w-24 overflow-hidden rounded-2xl border border-[rgba(200,162,74,0.25)] shadow-lg sm:h-[110px] sm:w-[110px]">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--accent-soft)] text-4xl font-bold text-[var(--text)]">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <button
          type="button"
          className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] shadow-lg transition-colors hover:bg-[var(--accent-hover)]"
          aria-label="Update profile photo"
        >
          <Camera size={16} className="text-[var(--app-bg)]" />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
          Profile
        </p>
        <h1 className="truncate text-2xl font-bold text-[var(--text)] sm:text-3xl">
          {user.fullName}
        </h1>
        <p className="mt-1 text-base font-medium capitalize text-[var(--text-muted)]">
          {user.role}
        </p>
        <p className="mt-1 truncate text-sm text-[var(--text-muted)]">
          {user.email}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--success)] shadow-[0_0_6px_rgba(95,127,53,0.35)]" />
          <span className="text-xs font-medium text-[var(--success)]">Active</span>
        </div>
      </div>
    </div>
  );
}
