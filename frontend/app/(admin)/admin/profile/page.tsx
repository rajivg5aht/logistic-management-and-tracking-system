import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminProfile from "@/components/admin/AdminProfile";
import { getWhoami, type AuthUser } from "@/lib/api/auth.api";
import { ApiError } from "@/lib/api/api-client";

export const metadata = {
  title: "Admin Profile - CargoNep",
  description: "Manage administrator profile, contact details, and account security.",
};

export default async function AdminProfilePage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_admin")?.value;
  const token = cookieStore.get("token_admin")?.value;

  if (!userCookie || !token) {
    redirect("/login");
  }

  let cookieUser: AuthUser;
  try {
    cookieUser = JSON.parse(userCookie) as AuthUser;
  } catch {
    redirect("/login");
  }

  if (cookieUser.role !== "admin") {
    redirect("/dashboard");
  }

  let user: AuthUser;
  try {
    user = await getWhoami(token);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      redirect("/login");
    }
    throw error;
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return <AdminProfile user={user} />;
}
