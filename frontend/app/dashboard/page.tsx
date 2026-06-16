import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/api/auth.api";
import { logoutAction } from "@/actions/auth.actions";

export default async function DashboardPage() {
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
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            Welcome back, {user.fullName}
          </h1>
          <p className="mt-3 text-slate-600">
            You are signed in to the logistics management workspace.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Account
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {user.email}
              </p>
              <p className="mt-1 text-sm text-slate-600">{user.phoneNumber}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Role
              </p>
              <p className="mt-2 text-lg font-semibold capitalize text-slate-900">
                {user.role}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Sprint 2 auth flow is complete.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard/profile"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Edit Profile
            </Link>
            <Link
              href="/"
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to home
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
