import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import { AuthProvider } from "@/context/AuthContext";
import CustomerLayoutClient from "@/components/dashboard/CustomerLayoutClient";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_customer")?.value;
  const token = cookieStore.get("token_customer")?.value;

  if (!userCookie || !token) redirect("/login");

  let user: AuthUser;
  try {
    user = JSON.parse(userCookie) as AuthUser;
  } catch {
    redirect("/login");
  }

  if (user.role !== "customer") {
    redirect(user.role === "admin" ? "/admin" : "/driver");
  }

  return (
    <AuthProvider initialUser={user} role="customer">
      <CustomerLayoutClient>{children}</CustomerLayoutClient>
    </AuthProvider>
  );
}
