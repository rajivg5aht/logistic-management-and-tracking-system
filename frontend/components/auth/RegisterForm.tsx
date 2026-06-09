"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  registerAction,
  type AuthFormState,
} from "@/actions/auth.actions";
import { FieldError } from "@/components/auth/FieldError";

const initialState: AuthFormState = {
  success: false,
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <>
      <form action={formAction} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Jordan Lee"
              className={inputClassName}
              required
            />
            <FieldError errors={state.fieldErrors?.fullName} />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="phoneNumber"
            >
              Phone Number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              placeholder="9800000000"
              className={inputClassName}
              required
            />
            <FieldError errors={state.fieldErrors?.phoneNumber} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Work Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className={inputClassName}
            required
          />
          <FieldError errors={state.fieldErrors?.email} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              className={inputClassName}
              required
            />
            <FieldError errors={state.fieldErrors?.password} />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
              className={inputClassName}
              required
            />
            <FieldError errors={state.fieldErrors?.confirmPassword} />
          </div>
        </div>

        {state.message ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? "Creating account..." : "Create new Account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Already have an account?{" "}
        <Link className="font-semibold text-slate-900 hover:underline" href="/login">
          Sign In
        </Link>
      </p>
    </>
  );
}
