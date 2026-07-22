import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CustomerCommunications from "@/components/inquiries/CustomerCommunications";
import type { AuthUser } from "@/lib/api/auth.api";

export const metadata = {
  title: "Announcements and Inquiries - CargoNep",
  description: "View official announcements, support inquiries, and responses.",
};

export default async function CustomerInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
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

  return (
    <CustomerCommunications
      token={token}
      user={user}
      initialTab={tab === "announcements" ? "announcements" : "inquiries"}
    />
  );
}
