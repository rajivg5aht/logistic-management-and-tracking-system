"use client";

import { useActionState, useRef, useState } from "react";
import { updateProfileAction, AuthFormState } from "@/actions/auth.actions";
import { AuthUser } from "@/lib/api/auth.api";
import { Camera } from "lucide-react";

const initialState: AuthFormState = {
  success: false,
};

interface ProfileUpdateFormProps {
  user: AuthUser;
}

export default function ProfileUpdateForm({ user }: ProfileUpdateFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const [previewImage, setPreviewImage] = useState<string | null>(
    user.profileImage ? user.profileImage : null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form action={formAction} suppressHydrationWarning>
      {state.message && (
        <div className={`mb-6 ${state.success ? "form-success" : "form-error"}`}>
          {state.message}
        </div>
      )}

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <div className="h-20 w-20 overflow-hidden rounded-2xl border border-[rgba(200,162,74,0.25)]">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile"
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
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[var(--app-bg)] bg-[var(--accent)] text-black shadow-lg transition-colors hover:bg-[var(--accent-hover)]"
            aria-label="Choose profile image"
          >
            <Camera size={12} />
          </button>
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-[var(--text)]">{user.fullName}</h2>
          <p className="text-sm capitalize text-[var(--text-muted)]">{user.role}</p>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_6px_rgba(95,127,53,0.35)]" />
            <span className="text-xs text-[var(--success)]">Active</span>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        name="profileImage"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      <div className="space-y-5">
        <div>
          <label htmlFor="fullName" className="form-label">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            defaultValue={user.fullName}
            className="form-input h-12"
            required
          />
          {state.fieldErrors?.fullName && (
            <p className="mt-1 text-sm text-[var(--danger)]">
              {state.fieldErrors.fullName[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={user.email}
            className="form-input h-12"
            required
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-sm text-[var(--danger)]">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="form-label">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            defaultValue={user.phoneNumber}
            className="form-input h-12"
            required
          />
          {state.fieldErrors?.phoneNumber && (
            <p className="mt-1 text-sm text-[var(--danger)]">
              {state.fieldErrors.phoneNumber[0]}
            </p>
          )}
        </div>
      </div>

      <button type="submit" className="btn-primary mt-8 w-full">
        Update Profile
      </button>
    </form>
  );
}
