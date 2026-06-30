import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import AdminAnalytics from "@/components/admin/AdminAnalytics";

export const metadata = {
  title: "Admin Analytics - CargoNep",
  description: "Revenue, fleet efficiency, and delivery performance insights.",
};

export default async function AdminAnalyticsPage() {
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

  return <AdminAnalytics />;
}
