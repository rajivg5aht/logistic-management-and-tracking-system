import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import OverviewDashboard from "@/components/admin/OverviewDashboard";

export const metadata = {
  title: "Admin Console Overview - CargoNep",
  description: "Dashboard panel metrics and operational tracking.",
};

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_admin")?.value;
  const token = cookieStore.get("token_admin")?.value;

  if (!userCookie || !token) {
    redirect("/login");
  }

  let user: AuthUser;
  try {
    user = JSON.parse(userCookie) as AuthUser;
  } catch {
    redirect("/login");
  }

  // Security check: Only admins should see this page
  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return <OverviewDashboard />;
}
