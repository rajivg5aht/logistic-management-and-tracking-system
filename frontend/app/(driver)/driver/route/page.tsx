import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import DriverRoute from "@/components/driver/DriverRoute";

export const metadata = {
  title: "Route - CargoNep",
  description: "Your active delivery route and status updates.",
};

export default async function DriverRoutePage() {
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

  return <DriverRoute token={token} />;
}
