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
          className={`rounded-2xl border p-4 ${
            state.success
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* New Password */}
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-semibold text-slate-700"
        >
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 transition focus:border-slate-400 focus:outline-none"
          required
          minLength={6}
        />
        {state.fieldErrors?.newPassword && (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.newPassword[0]}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-semibold text-slate-700"
        >
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 transition focus:border-slate-400 focus:outline-none"
          required
          minLength={6}
        />
        {state.fieldErrors?.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
      >
        Update Password
      </button>
    </form>
  );
}
