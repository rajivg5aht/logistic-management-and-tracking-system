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
          className={`${
            state.success
              ? "form-success"
              : "form-error"
          }`}
        >
          {state.message}
        </div>
      )}

      <div>
        <label
          htmlFor="newPassword"
          className="form-label"
        >
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          className="form-input h-12"
          required
          minLength={6}
        />
        {state.fieldErrors?.newPassword && (
          <p className="mt-1 text-sm text-[var(--danger)]">
            {state.fieldErrors.newPassword[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="form-label"
        >
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          className="form-input h-12"
          required
          minLength={6}
        />
        {state.fieldErrors?.confirmPassword && (
          <p className="mt-1 text-sm text-[var(--danger)]">
            {state.fieldErrors.confirmPassword[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="btn-primary w-full"
      >
        Update Password
      </button>
    </form>
  );
}

