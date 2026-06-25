"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction, type AuthFormState } from "@/actions/auth.actions";
import { FieldError } from "@/components/auth/FieldError";

const initialState: AuthFormState = {
  success: false,
};

/* ─── Envelope Icon ─── */
function EnvelopeIcon({ focused }: { focused: boolean }) {
  return (
    <svg
      className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors duration-300"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={focused ? "var(--accent)" : "var(--text-faint)"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

/* ─── Lock Icon ─── */
function LockIcon({ focused }: { focused: boolean }) {
  return (
    <svg
      className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors duration-300"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={focused ? "var(--accent)" : "var(--text-faint)"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ─── Eye Icon ─── */
function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/* ─── Eye Off Icon ─── */
function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export function LoginForm({ role = "Admin" }: { role?: string }) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  return (
    <>
      <form action={formAction} className="space-y-4">
        {/* Hidden role field */}
        <input type="hidden" name="role" value={role} />

        {/* Email */}
        <div className="space-y-1.5">
          <label className="form-label" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <EnvelopeIcon focused={emailFocused} />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="name@cargonep.com"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className="form-input pl-12 text-sm"
              required
              suppressHydrationWarning
            />
          </div>
          <FieldError errors={state.fieldErrors?.email} />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <a
              href="#"
              className="text-[var(--accent)] text-xs font-medium no-underline hover:underline transition-all duration-200"
            >
              Forgot Password?
            </a>
          </div>
          <div className="relative">
            <LockIcon focused={passwordFocused} />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="form-input pl-12 pr-12 text-sm"
              required
              suppressHydrationWarning
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
              suppressHydrationWarning
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <FieldError errors={state.fieldErrors?.password} />
        </div>

        {/* Error message */}
        {state.message ? (
          <p className="form-error">
            {state.message}
          </p>
        ) : null}

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary mt-3 w-full"
          suppressHydrationWarning
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Create Account Link */}
      <p className="text-sm text-center text-[var(--text-muted)] mt-5">
        Don't have an account?{" "}
        <Link className="font-semibold hover:underline text-[var(--accent)] transition-colors duration-200" href="/register">
          Create Account
        </Link>
      </p>
    </>
  );
}