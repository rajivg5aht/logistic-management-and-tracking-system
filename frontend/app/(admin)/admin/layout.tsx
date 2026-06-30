import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { AuthProvider } from "@/context/AuthContext";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <AuthProvider initialUser={user} role="admin">
      <AdminLayoutClient user={user}>
        {children}
      </AdminLayoutClient>
    </AuthProvider>
  );
}
