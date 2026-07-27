import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import AdminUserManagement from "@/components/admin/AdminUserManagement";

export const metadata = {
  title: "Admin User Management - CargoNep",
  description: "Manage system user accounts, roles, and statuses.",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialSearch = (Array.isArray(params.search) ? params.search[0] : params.search)?.trim() ?? "";
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

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return <AdminUserManagement token={token} currentUser={user} initialSearch={initialSearch} />;
}
