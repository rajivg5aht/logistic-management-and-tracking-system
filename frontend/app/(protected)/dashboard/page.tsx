import DashboardOverview from "@/components/dashboard/DashboardOverview";
import { requireRole } from "@/lib/auth/role-guard";

export default async function DashboardPage() {
  const { user, token } = await requireRole("customer");

  return <DashboardOverview user={user} token={token} />;
}
