import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import AdminDriverManagement from "@/components/admin/AdminDriverManagement";

export const metadata = {
  title: "Driver Management - CargoNep",
  description: "Add and manage company drivers, vehicles, and availability.",
};

export default async function AdminDriversPage() {
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

  // Security: Only admins can access this page
  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return <AdminDriverManagement token={token} />;
}
