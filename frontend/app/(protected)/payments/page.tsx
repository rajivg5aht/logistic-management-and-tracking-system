import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import CustomerPayments from "@/components/payments/CustomerPayments";

export const metadata = {
  title: "Payments - CargoNep",
  description: "View your payment history, COD status, and refunds",
};

export default async function PaymentsPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_customer")?.value;
  const token = cookieStore.get("token_customer")?.value;

  if (!userCookie || !token) {
    redirect("/login");
  }

  let user: AuthUser;
  try {
    user = JSON.parse(userCookie) as AuthUser;
  } catch {
    redirect("/login");
  }

  return <CustomerPayments user={user} token={token} />;
}
