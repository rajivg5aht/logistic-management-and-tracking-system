import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import AdminCommunications from "@/components/admin/AdminCommunications";

export const metadata = {
  title: "Announcements and Inquiries - CargoNep",
  description: "Publish announcements and manage incoming customer messages.",
};

export default async function AdminInquiriesPage() {
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

  return <AdminCommunications token={token} />;
}
