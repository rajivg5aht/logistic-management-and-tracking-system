import Image from "next/image";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[var(--app-bg)] p-4 font-sans sm:p-6 md:p-8">
      <div
        className="absolute inset-0 scale-105 bg-[url('/back.png')] bg-cover bg-center opacity-20 blur-[2px]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[image:var(--auth-overlay)]" />

      <div className="card relative z-10 w-full max-w-[480px] overflow-hidden p-8 sm:p-10">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(200,162,74,0.35)] to-transparent" />

        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/logo.png"
            alt="CargoNep"
            width={96}
            height={96}
            priority
            className="h-24 w-24 object-contain"
          />
          <span className="-mt-2 text-xl font-semibold tracking-tight text-[var(--text)]">
            CargoNep
          </span>
          <p className="mt-1 text-sm font-medium text-[var(--text-soft)]">
            Streamlining Logistics Across the Himalayas
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
