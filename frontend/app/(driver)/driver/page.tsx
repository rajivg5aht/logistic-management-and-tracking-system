import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import DriverConsole from "@/components/driver/DriverConsole";

export const metadata = {
  title: "Driver Dashboard - CargoNep",
  description: "Driver console for tracking assigned routes and delivery updates.",
};

export default async function DriverDashboardPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;

  if (!userCookie) {
    redirect("/login");
  }

  let user: AuthUser;
  try {
    user = JSON.parse(userCookie) as AuthUser;
  } catch {
    redirect("/login");
  }

  // Double check role authorization
  if (user.role !== "driver") {
    redirect("/dashboard");
  }

  return <DriverConsole user={user} />;
}
