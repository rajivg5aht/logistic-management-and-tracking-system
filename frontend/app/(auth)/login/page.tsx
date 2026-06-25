"use client";

import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import RocketIcon from "@/components/auth/RocketIcon";

const roles = ["Admin", "Driver", "Customer"] as const;

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState<string>("Admin");

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--app-bg)] p-4 font-sans sm:p-6 md:p-8">
      <div
        className="absolute inset-0 scale-105 bg-[url('/cargo_ship_neon.png')] bg-cover bg-center opacity-20 blur-[2px]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[image:var(--auth-overlay)]" />

      <div className="card relative z-10 w-full max-w-[480px] overflow-hidden p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(200,162,74,0.4)] to-transparent" />

        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="rounded-xl border border-[rgba(200,162,74,0.25)] bg-[var(--accent-soft)] p-2.5">
              <RocketIcon />
            </div>
            <span className="text-3xl font-extrabold tracking-tight text-[var(--text)]">
              CargoNep
            </span>
          </div>
          <h1 className="heading-md mb-2">
            Welcome Back
          </h1>
          <p className="max-w-[320px] text-sm leading-relaxed text-[var(--text-muted)]">
            Enter your credentials to access the command center.
          </p>
        </div>

        <div
          className="mb-7 flex h-12 items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-1"
          suppressHydrationWarning
        >
          {roles.map((role) => (
            <button
              key={role}
              type="button"
              className={`flex h-full flex-1 cursor-pointer items-center justify-center rounded-lg border border-transparent text-sm font-semibold transition-all duration-200 ${
                activeRole === role
                  ? "border-[rgba(200,162,74,0.25)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_2px_12px_rgba(200,162,74,0.12)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-soft)]"
              }`}
              onClick={() => setActiveRole(role)}
              suppressHydrationWarning
            >
              {role}
            </button>
          ))}
        </div>

        <LoginForm role={activeRole} />
      </div>
    </div>
  );
}
