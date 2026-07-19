"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  forgotPasswordAction,
  type AuthFormState,
} from "@/actions/auth.actions";
import { FieldError } from "@/components/auth/FieldError";

const initialState: AuthFormState = {
  success: false,
};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <>
      {state.success ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-center text-sm text-[var(--text-soft)]">
          {state.message}
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <p className="text-center text-sm text-[var(--text-muted)]">
            Enter the email linked to your account and we&apos;ll send you a link
            to reset your password.
          </p>

          <div className="space-y-2">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@cargonep.com"
              className="form-input"
              required
            />
            <FieldError errors={state.fieldErrors?.email} />
          </div>

          {state.message ? (
            <p className="form-error">{state.message}</p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary mt-2 w-full"
          >
            {isPending ? "Sending link..." : "Send Reset Link"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Remembered your password?{" "}
        <Link
          className="font-semibold text-[var(--accent)] transition-colors duration-200 hover:underline"
          href="/login"
        >
          Back to Sign In
        </Link>
      </p>
    </>
  );
}
