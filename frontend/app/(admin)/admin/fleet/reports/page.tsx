import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import AdminFleetReports from "@/components/admin/AdminFleetReports";

export const metadata = {
  title: "Fleet Reports - CargoNep",
  description: "Driver-submitted vehicle issues and fuel expenses.",
};

export default async function AdminFleetReportsPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_admin")?.value;
  const token = cookieStore.get("token_admin")?.value;

  if (!userCookie || !token) redirect("/login");

  let user: AuthUser;
  try {
    user = JSON.parse(userCookie) as AuthUser;
  } catch {
    redirect("/login");
  }

  if (user.role !== "admin") redirect("/dashboard");

  return <AdminFleetReports token={token} />;
}
