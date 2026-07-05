import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import AdminFleetManagement from "@/components/admin/AdminFleetManagement";

export const metadata = {
  title: "Fleet Management - CargoNep",
  description: "Manage vehicles, maintenance, and driver assignments.",
};

export default async function AdminFleetPage() {
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

  return <AdminFleetManagement token={token} />;
}
