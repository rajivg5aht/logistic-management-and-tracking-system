"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthFormState } from "@/actions/auth.actions";
import { FieldError } from "@/components/auth/FieldError";

const initialState: AuthFormState = {
  success: false,
};

export function LoginForm({ role = "Admin" }: { role?: string }) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <>
      <form action={formAction} className="space-y-5">
        {/* Hidden role field */}
        <input type="hidden" name="role" value={role} />

        {/* Email */}
        <div className="space-y-2">
          <label
            className="block text-sm font-medium"
            htmlFor="email"
            style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}
          >
            Work Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="login-input"
            required
          />
          <FieldError errors={state.fieldErrors?.email} />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label
            className="block text-sm font-medium"
            htmlFor="password"
            style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '8px' }}
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            className="login-input"
            required
          />
          <FieldError errors={state.fieldErrors?.password} />
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="login-checkbox" />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
              Remember me
            </span>
          </label>
          <a
            href="#"
            style={{
              color: '#E2C275',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.textDecoration = 'underline'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.textDecoration = 'none'; }}
          >
            Forgot Password?
          </a>
        </div>

        {/* Error message */}
        {state.message ? (
          <p className="login-error">
            {state.message}
          </p>
        ) : null}

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isPending}
          className="login-btn"
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Create Account Link */}
      <p className="mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
        Don&apos;t have an account?{" "}
        <Link
          className="font-semibold hover:underline"
          href="/register"
          style={{ color: '#E2C275' }}
        >
          Create Account
        </Link>
      </p>
    </>
  );
}
