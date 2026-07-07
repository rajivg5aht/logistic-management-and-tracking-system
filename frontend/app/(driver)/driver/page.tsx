import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import DriverDashboard from "@/components/driver/DriverDashboard";

export const metadata = {
  title: "Driver Dashboard - CargoNep",
  description: "Your assigned delivery, vehicle, and status updates.",
};

export default async function DriverDashboardPage() {
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

  if (user.role !== "driver") {
    redirect("/dashboard");
  }

  return <DriverDashboard user={user} token={token} />;
}
