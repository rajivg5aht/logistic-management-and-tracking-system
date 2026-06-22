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
            <label className="form-label" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Jordan Lee"
              className="form-input h-[52px]"
              required
            />
            <FieldError errors={state.fieldErrors?.fullName} />
          </div>

          <div className="space-y-2">
            <label className="form-label" htmlFor="phoneNumber">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              placeholder="9800000000"
              className="form-input h-[52px]"
              required
            />
            <FieldError errors={state.fieldErrors?.phoneNumber} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="form-label" htmlFor="email">
            Work Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="form-input h-[52px]"
            required
          />
          <FieldError errors={state.fieldErrors?.email} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              className="form-input h-[52px]"
              required
            />
            <FieldError errors={state.fieldErrors?.password} />
          </div>

          <div className="space-y-2">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
              className="form-input h-[52px]"
              required
            />
            <FieldError errors={state.fieldErrors?.confirmPassword} />
          </div>
        </div>

        {state.message ? (
          <p className="form-error">
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-[52px] border-none rounded-xl bg-[#00E5FF] text-[#050816] text-base font-bold cursor-pointer shadow-[0_4px_20px_rgba(0,229,255,0.2)] transition-all duration-300 hover:bg-[#00F0FF] hover:-translate-y-[1px] hover:shadow-[0_6px_25px_rgba(0,229,255,0.35)] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
        >
          {isPending ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-white/50">
        Already have an account?{" "}
        <Link className="font-semibold text-[#00E5FF] hover:underline" href="/login">
          Sign In
        </Link>
      </p>
    </>
  );
}