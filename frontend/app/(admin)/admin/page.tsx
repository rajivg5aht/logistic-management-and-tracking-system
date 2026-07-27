import OverviewDashboard from "@/components/admin/OverviewDashboard";
import { requireRole } from "@/lib/auth/role-guard";

export const metadata = {
  title: "Admin Console Overview - CargoNep",
  description: "Dashboard panel metrics and operational tracking.",
};

export default async function AdminDashboardPage() {
  const { token } = await requireRole("admin");

  return <OverviewDashboard token={token} />;
}
