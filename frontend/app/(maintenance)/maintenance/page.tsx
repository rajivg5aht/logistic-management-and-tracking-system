import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import MaintenanceWorkOrders from "@/components/maintenance/MaintenanceWorkOrders";

export const metadata = {
  title: "Maintenance Work Orders - CargoNep",
};

export default async function MaintenancePage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_maintenance")?.value;
  const token = cookieStore.get("token_maintenance")?.value;

  if (!userCookie || !token) redirect("/login");

  let user: AuthUser;
  try {
    user = JSON.parse(userCookie) as AuthUser;
  } catch {
    redirect("/login");
  }

  if (user.role !== "maintenance") redirect("/dashboard");

  return <MaintenanceWorkOrders token={token} user={user} />;
}