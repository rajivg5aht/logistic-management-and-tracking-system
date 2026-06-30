import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import PaymentsBilling from "@/components/billing/PaymentsBilling";

export const metadata = {
  title: "Payments & Billing - CargoNep",
  description: "Manage your digital wallet, saved methods, and shipment history",
};

export default async function BillingPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_customer")?.value;

  if (!userCookie) {
    redirect("/login");
  }

  let user: AuthUser;
  try {
    user = JSON.parse(userCookie) as AuthUser;
  } catch {
    redirect("/login");
  }

  return <PaymentsBilling user={user} />;
}