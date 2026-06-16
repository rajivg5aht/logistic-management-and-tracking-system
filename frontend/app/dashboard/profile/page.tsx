import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { AuthUser } from "@/api/auth.api";
import ProfileUpdateForm from "@/components/profile/ProfileUpdateForm";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;

  if (!userCookie) {
    redirect("/login");
  }

  let user: AuthUser;

  try {
    user = JSON.parse(userCookie) as AuthUser;
  } catch {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Settings
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              Update Profile
            </h1>
            <p className="mt-2 text-slate-600">
              Update your personal information and profile picture
            </p>
          </div>

          <ProfileUpdateForm user={user} />

          <div className="mt-8 border-t border-slate-200 pt-6">
            <Link
              href="/dashboard/password"
              className="inline-flex items-center text-sm font-semibold text-slate-700 transition hover:text-slate-900"
            >
              Change Password →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
