import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CustomerInquiries from "@/components/inquiries/CustomerInquiries";
import type { AuthUser } from "@/lib/api/auth.api";

export const metadata = {
  title: "My Inquiries - CargoNep",
  description: "View your support inquiries and CargoNep responses.",
};

export default async function CustomerInquiriesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token_customer")?.value;
  const userCookie = cookieStore.get("user_customer")?.value;
  if (!token || !userCookie) redirect("/login");

  let user: AuthUser;
  try {
    user = JSON.parse(userCookie) as AuthUser;
  } catch {
    redirect("/login");
  }

  return <CustomerInquiries token={token} user={user} />;
}
