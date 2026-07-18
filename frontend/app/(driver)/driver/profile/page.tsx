import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DriverProfile from "@/components/driver/DriverProfile";
import { getWhoami, type AuthUser } from "@/lib/api/auth.api";
import { ApiError } from "@/lib/api/api-client";

export const metadata = {
  title: "Driver Profile - CargoNep",
  description: "Manage driver profile, contact details, and account security.",
};

export default async function DriverProfilePage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_driver")?.value;
  const token = cookieStore.get("token_driver")?.value;

  if (!userCookie || !token) {
    redirect("/login");
  }

  let cookieUser: AuthUser;
  try {
    cookieUser = JSON.parse(userCookie) as AuthUser;
  } catch {
    redirect("/login");
  }

  if (cookieUser.role !== "driver") {
    redirect("/dashboard");
  }

  let user: AuthUser;
  try {
    user = await getWhoami(token);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      redirect("/login");
    }
    throw error;
  }

  if (user.role !== "driver") {
    redirect("/dashboard");
  }

  return <DriverProfile user={user} />;
}
