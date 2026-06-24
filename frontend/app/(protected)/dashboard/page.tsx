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
  LogOut,
  Settings,
  TrendingUp,
  Package,
  Truck,
  MapPinned,
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

  const infoCards = [
    { icon: <Mail size={20} />, label: "Email", value: user.email },
    { icon: <Phone size={20} />, label: "Phone", value: user.phoneNumber },
    { icon: <Shield size={20} />, label: "Role", value: user.role },
  ];

  const stats = [
    { icon: <Package size={20} />, label: "Active Shipments", value: "No active shipments" },
    { icon: <Truck size={20} />, label: "Fleet Vehicles", value: "No vehicles assigned" },
    { icon: <TrendingUp size={20} />, label: "On-Time Rate", value: "Awaiting shipment data" },
  ];

  return (
    <main className="page-shell">
      <div className="page-container">
        <div className="page-header">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(200,162,74,0.20)] bg-[var(--accent-soft)] text-[var(--accent)]">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <p className="page-kicker">
                Dashboard
              </p>
              <h1 className="page-title">
                Logistics Command Center
              </h1>
              <p className="page-subtitle">
                Monitor account details, shipment readiness, and operational status from one consistent workspace.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/profile" className="btn-secondary btn-sm">
              <Settings size={16} />
              Settings
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[rgba(184,92,74,0.28)] bg-[rgba(184,92,74,0.10)] px-4 text-sm font-semibold text-[var(--danger)] transition-colors hover:border-[rgba(184,92,74,0.42)] hover:bg-[rgba(184,92,74,0.14)] sm:w-auto"
              >
                <LogOut size={16} />
                Logout
              </button>
            </form>
          </div>
        </div>

        <section className="card mb-6 overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="h-16 w-16 shrink-0 rounded-2xl border border-[rgba(200,162,74,0.20)] object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[rgba(200,162,74,0.20)] bg-[var(--accent-soft)] text-2xl font-bold text-[var(--text)]">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--accent)]">
                  Welcome back
                </p>
                <h2 className="truncate text-2xl font-bold text-[var(--text)] md:text-3xl">
                  {user.fullName}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                  You are signed in to the logistics management workspace.
                </p>
              </div>
            </div>

            <div className="empty-state text-left md:w-[260px]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <MapPinned size={18} />
              </div>
              <p className="text-sm font-semibold text-[var(--text)]">No live route selected</p>
              <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                Shipment activity will appear here when tracking data is available.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {infoCards.map((card) => (
            <div className="card p-5 sm:p-6" key={card.label}>
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                {card.icon}
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                {card.label}
              </p>
              <p className="mt-2 truncate text-base font-semibold capitalize text-[var(--text)]">
                {card.value}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-soft)] text-[var(--text-muted)]">
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--text-muted)]">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
