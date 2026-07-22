"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  resetPasswordAction,
  type AuthFormState,
} from "@/actions/auth.actions";
import { FieldError } from "@/components/auth/FieldError";

const initialState: AuthFormState = {
  success: false,
};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <p className="form-error">
          This reset link is invalid or has expired. Please request a new one.
        </p>
        <Link
          className="font-semibold text-[var(--accent)] transition-colors duration-200 hover:underline"
          href="/forgot-password"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (state.success) {
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm text-[var(--text-soft)]">
          {state.message}
        </div>
        <Link className="btn-primary inline-block w-full" href="/login">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <p className="text-center text-sm text-[var(--text-muted)]">
          Choose a new password for your account.
        </p>

        <div className="space-y-2">
          <label className="form-label" htmlFor="newPassword">
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Enter a new password"
            className="form-input"
            required
          />
          <FieldError errors={state.fieldErrors?.newPassword} />
        </div>

        <div className="space-y-2">
          <label className="form-label" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter the new password"
            className="form-input"
            required
          />
          <FieldError errors={state.fieldErrors?.confirmPassword} />
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword((prev) => !prev)}
          />
          Show password
        </label>

        {state.message ? <p className="form-error">{state.message}</p> : null}

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary mt-2 w-full"
        >
          {isPending ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Back to{" "}
        <Link
          className="font-semibold text-[var(--accent)] transition-colors duration-200 hover:underline"
          href="/login"
        >
          Sign In
        </Link>
      </p>
    </>
  );
}
