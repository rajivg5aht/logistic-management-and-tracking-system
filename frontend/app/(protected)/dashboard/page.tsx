import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActiveShipmentCard } from "@/components/dashboard/ActiveShipmentCard";
import { WeeklyStats } from "@/components/dashboard/WeeklyStats";
import { BillingBanner } from "@/components/dashboard/BillingBanner";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_customer")?.value;

  if (!userCookie) {
    redirect("/login");
  }

  return (
    <>
      {/* Quick Actions */}
      <section className="mb-8">
        <QuickActions />
      </section>

      {/* Active Shipment */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Active Shipment
          </h2>
          <a
            href="#"
            className="text-sm font-semibold text-[var(--accent)] no-underline hover:underline"
          >
            View All
          </a>
        </div>
        <ActiveShipmentCard />
      </section>

      {/* Weekly Insights */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            Weekly Insights
          </h2>
          <a
            href="#"
            className="text-sm font-semibold text-[var(--accent)] no-underline hover:underline"
          >
            View All
          </a>
        </div>
        <WeeklyStats />
      </section>

      {/* Billing Banner */}
      <section>
        <BillingBanner />
      </section>
    </>
  );
}