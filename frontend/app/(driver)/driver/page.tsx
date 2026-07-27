import DriverDashboard from "@/components/driver/DriverDashboard";
import { requireRole } from "@/lib/auth/role-guard";

export const metadata = {
  title: "Driver Dashboard - CargoNep",
  description: "Your assigned delivery, vehicle, and status updates.",
};

export default async function DriverDashboardPage() {
  const { user, token } = await requireRole("driver");

  return <DriverDashboard user={user} token={token} />;
}
