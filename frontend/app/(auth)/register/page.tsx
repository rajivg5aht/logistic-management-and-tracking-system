import { RegisterForm } from "@/components/auth/RegisterForm";
import RocketIcon from "@/components/auth/RocketIcon";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--app-bg)] p-4 font-sans sm:p-6 md:p-8">
      <div
        className="absolute inset-0 scale-105 bg-[url('/cargo_ship_neon.png')] bg-cover bg-center opacity-20 blur-[2px]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[image:var(--auth-overlay)]" />

      <div className="card relative z-10 w-full max-w-[520px] overflow-hidden p-6 sm:p-8 md:p-10">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(200,162,74,0.35)] to-transparent" />

        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3.5 flex items-center gap-2.5">
            <div className="rounded-xl border border-[rgba(200,162,74,0.25)] bg-[var(--accent-soft)] p-2">
              <RocketIcon />
            </div>
            <span className="text-3xl font-extrabold tracking-normal text-[var(--text)]">
              CargoNep
            </span>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-normal text-[var(--text)]">
            Get Started
          </h1>
          <p className="max-w-[320px] text-sm leading-6 text-[var(--text-muted)]">
            Register your workspace and start tracking.
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
