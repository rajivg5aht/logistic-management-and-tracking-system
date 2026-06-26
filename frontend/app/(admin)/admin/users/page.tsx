import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import AdminUserManagement from "@/components/admin/AdminUserManagement";

export const metadata = {
  title: "Admin User Management - CargoNep",
  description: "Manage system user accounts, roles, and statuses.",
};

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const token = cookieStore.get("token")?.value;

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

  return <AdminUserManagement token={token} currentUser={user} />;
}
