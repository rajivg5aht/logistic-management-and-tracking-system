"use client";

import { useActionState } from "react";
import { updateProfileAction, AuthFormState } from "@/actions/auth.actions";
import { AuthUser } from "@/lib/api/auth.api";
import { useState, useRef } from "react";
import { Camera, User } from "lucide-react";

const initialState: AuthFormState = {
  success: false,
};

interface ProfileUpdateFormProps {
  user: AuthUser;
}

export default function ProfileUpdateForm({ user }: ProfileUpdateFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const [previewImage, setPreviewImage] = useState<string | null>(
    user.profileImage ? `http://localhost:4000${user.profileImage}` : null,
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
    <form
      action={formAction}
      suppressHydrationWarning
    >
      {state.message && (
        <div
          className={`mb-6 rounded-xl border p-4 text-sm ${
            state.success
              ? "border-green-500/20 bg-green-500/5 text-green-300"
              : "border-red-500/20 bg-red-500/5 text-red-300"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Profile Header — Avatar + Name/Role */}
      <div className="mb-8 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-[#00E5FF]/20 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#00E5FF]/25 to-[#00E5FF]/5 text-3xl font-bold text-white">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {/* Camera icon overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#050816] bg-[#00E5FF] text-black shadow-lg transition-all hover:bg-[#00F0FF] hover:scale-105"
          >
            <Camera size={12} />
          </button>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{user.fullName}</h2>
          <p className="text-sm capitalize text-white/40">{user.role}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
            <span className="text-xs text-green-400/80">Active</span>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        name="profileImage"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-xs font-semibold uppercase tracking-[0.12em] text-white/50 mb-2"
          >
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            defaultValue={user.fullName}
            className="w-full h-[52px] bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 text-sm text-white outline-none transition-all duration-200 placeholder-white/20 focus:border-[#00E5FF] focus:bg-white/[0.03] focus:shadow-[0_0_15px_rgba(0,229,255,0.12)]"
            required
          />
          {state.fieldErrors?.fullName && (
            <p className="mt-1 text-sm text-red-400">
              {state.fieldErrors.fullName[0]}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-[0.12em] text-white/50 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={user.email}
            className="w-full h-[52px] bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 text-sm text-white outline-none transition-all duration-200 placeholder-white/20 focus:border-[#00E5FF] focus:bg-white/[0.03] focus:shadow-[0_0_15px_rgba(0,229,255,0.12)]"
            required
          />
          {state.fieldErrors?.email && (
            <p className="mt-1 text-sm text-red-400">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-xs font-semibold uppercase tracking-[0.12em] text-white/50 mb-2"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            defaultValue={user.phoneNumber}
            className="w-full h-[52px] bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 text-sm text-white outline-none transition-all duration-200 placeholder-white/20 focus:border-[#00E5FF] focus:bg-white/[0.03] focus:shadow-[0_0_15px_rgba(0,229,255,0.12)]"
            required
          />
          {state.fieldErrors?.phoneNumber && (
            <p className="mt-1 text-sm text-red-400">
              {state.fieldErrors.phoneNumber[0]}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="mt-8 w-full h-[52px] border-none rounded-xl bg-[#00E5FF] text-black text-base font-semibold cursor-pointer shadow-[0_4px_20px_rgba(0,229,255,0.2)] transition-all duration-200 hover:bg-[#00F0FF] hover:-translate-y-[1px] hover:shadow-[0_6px_25px_rgba(0,229,255,0.3)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        Update Profile
      </button>
    </form>
  );
}