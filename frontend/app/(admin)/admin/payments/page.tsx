import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import AdminPayments from "@/components/admin/AdminPayments";

export const metadata = {
  title: "Payments - CargoNep",
  description: "Payment ledger, COD settlement, and refunds.",
};

export default async function AdminPaymentsPage() {
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

  return <AdminPayments token={token} />;
}
