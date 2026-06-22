"use client";

import { useActionState } from "react";
import { updatePasswordAction, AuthFormState } from "@/actions/auth.actions";

const initialState: AuthFormState = {
  success: false,
};

export default function PasswordUpdateForm() {
  const [state, formAction] = useActionState(updatePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            state.success
              ? "border-green-500/20 bg-green-500/5 text-green-300"
              : "border-red-500/20 bg-red-500/5 text-red-300"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* New Password */}
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-white/65 mb-2"
        >
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          className="w-full h-[54px] bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 text-sm text-white outline-none transition-all duration-200 placeholder-white/20 focus:border-[#00E5FF] focus:bg-white/[0.03] focus:shadow-[0_0_15px_rgba(0,229,255,0.12)]"
          required
          minLength={6}
        />
        {state.fieldErrors?.newPassword && (
          <p className="mt-1 text-sm text-red-400">
            {state.fieldErrors.newPassword[0]}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-white/65 mb-2"
        >
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          className="w-full h-[54px] bg-white/[0.02] border border-white/[0.08] rounded-xl px-4 text-sm text-white outline-none transition-all duration-200 placeholder-white/20 focus:border-[#00E5FF] focus:bg-white/[0.03] focus:shadow-[0_0_15px_rgba(0,229,255,0.12)]"
          required
          minLength={6}
        />
        {state.fieldErrors?.confirmPassword && (
          <p className="mt-1 text-sm text-red-400">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full h-[52px] border-none rounded-xl bg-[#00E5FF] text-black text-base font-semibold cursor-pointer shadow-[0_4px_20px_rgba(0,229,255,0.2)] transition-all duration-200 hover:bg-[#00F0FF] hover:-translate-y-[1px] hover:shadow-[0_6px_25px_rgba(0,229,255,0.3)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        Update Password
      </button>
    </form>
  );
}

