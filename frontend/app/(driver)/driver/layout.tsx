import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import DriverLayoutClient from "@/components/driver/DriverLayoutClient";
import { AuthProvider } from "@/context/AuthContext";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_driver")?.value;
  const token = cookieStore.get("token_driver")?.value;

  if (!userCookie || !token) {
    redirect("/login");
  }

  let user: AuthUser;
  try {
    user = JSON.parse(userCookie) as AuthUser;
  } catch {
    redirect("/login");
  }

  // Security: Only drivers can access this page
  if (user.role !== "driver") {
    redirect("/dashboard");
  }

  return (
    <AuthProvider initialUser={user} role="driver">
      <DriverLayoutClient user={user}>
        {children}
      </DriverLayoutClient>
    </AuthProvider>
  );
}
