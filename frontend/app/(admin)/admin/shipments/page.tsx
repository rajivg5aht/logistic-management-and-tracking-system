import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import AdminShipments from "@/components/admin/AdminShipments";

export const metadata = {
  title: "Admin Shipments - CargoNep",
  description: "Monitor and manage shipments across the network.",
};

export default async function AdminShipmentsPage() {
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

  return <AdminShipments />;
}
