"use client";

import { useActionState } from "react";
import { updateProfileAction, AuthFormState } from "@/actions/auth.actions";
import { AuthUser } from "@/api/auth.api";
import { useState, useRef } from "react";

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
    <form action={formAction} className="space-y-6">
      {state.message && (
        <div
          className={`rounded-2xl border p-4 ${
            state.success
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* Profile Image */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative h-32 w-32">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Profile"
              className="absolute inset-0 h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-200 text-4xl font-semibold text-slate-600">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          name="profileImage"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Change Photo
        </button>
      </div>

      {/* Full Name */}
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-semibold text-slate-700"
        >
          Full Name
        </label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          defaultValue={user.fullName}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 transition focus:border-slate-400 focus:outline-none"
          required
        />
        {state.fieldErrors?.fullName && (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.fullName[0]}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-slate-700"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          defaultValue={user.email}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 transition focus:border-slate-400 focus:outline-none"
          required
        />
        {state.fieldErrors?.email && (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-semibold text-slate-700"
        >
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          defaultValue={user.phoneNumber}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 transition focus:border-slate-400 focus:outline-none"
          required
        />
        {state.fieldErrors?.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.phoneNumber[0]}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
      >
        Update Profile
      </button>
    </form>
  );
}
