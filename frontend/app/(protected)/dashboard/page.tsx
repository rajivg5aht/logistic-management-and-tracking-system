import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import { logoutAction } from "@/actions/auth.actions";
import {
  LayoutDashboard,
  Mail,
  Phone,
  Shield,
  UserCircle,
  LogOut,
  Settings,
  TrendingUp,
  Package,
  Truck,
} from "lucide-react";

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
    <main className="min-h-screen bg-[#050816] py-16 lg:py-20">
      <div className="container-max">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00E5FF]">
                Dashboard
              </p>
              <p className="text-sm text-white/30">Command Center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="btn-secondary btn-sm inline-flex items-center gap-2"
            >
              <Settings size={16} />
              Settings
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-2.5 text-sm font-semibold text-red-400 transition-all hover:border-red-500/30 hover:bg-red-500/10"
              >
                <LogOut size={16} />
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="card p-8 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.08)_0%,transparent_70%)] blur-3xl pointer-events-none" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover border border-[#00E5FF]/20 shadow-[0_0_10px_rgba(0,229,255,0.15)]"
                />
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00E5FF]/25 to-[#00E5FF]/5 border border-[#00E5FF]/10 text-2xl font-bold text-white">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">
                  Welcome back, {user.fullName}
                </h1>
                <p className="mt-1 text-white/30">
                  You are signed in to the logistics management workspace.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="card p-8">
            <div className="relative min-w-0">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
                <Mail size={20} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30">
                Email
              </p>
              <p className="mt-2 text-lg font-semibold text-white truncate">
                {user.email}
              </p>
            </div>
          </div>

          <div className="card p-8">
            <div className="relative min-w-0">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
                <Phone size={20} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30">
                Phone
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {user.phoneNumber}
              </p>
            </div>
          </div>

          <div className="card p-8">
            <div className="relative min-w-0">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
                <Shield size={20} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30">
                Role
              </p>
              <p className="mt-2 text-lg font-semibold capitalize text-white">
                {user.role}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: <Package size={20} />, label: "Active Shipments", value: "—" },
            { icon: <Truck size={20} />, label: "Fleet Vehicles", value: "—" },
            { icon: <TrendingUp size={20} />, label: "On-Time Rate", value: "—" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] text-white/30">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/30">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-xl font-bold text-white/30">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}