import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import DriverLayoutClient from "@/components/driver/DriverLayoutClient";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;
  const token = cookieStore.get("token")?.value;

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
    <DriverLayoutClient user={user}>
      {children}
    </DriverLayoutClient>
  );
}
