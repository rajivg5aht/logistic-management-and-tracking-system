import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import PasswordUpdateForm from "@/components/profile/PasswordUpdateForm";

export default async function PasswordPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;

  if (!userCookie) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            ← Back to Profile
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Security
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Change Password
            </h1>
            <p className="mt-2 text-slate-600">
              Update your password to keep your account secure
            </p>
          </div>

          <PasswordUpdateForm />
        </div>
      </div>
    </main>
  );
}
