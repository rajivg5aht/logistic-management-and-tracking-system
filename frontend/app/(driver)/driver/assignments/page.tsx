import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import DriverAssignments from "@/components/driver/DriverAssignments";

export const metadata = {
  title: "My Assignments - CargoNep",
  description: "Your active delivery and completed history.",
};

interface DriverAssignmentsPageProps {
  searchParams: Promise<{ search?: string | string[] }>;
}

export default async function DriverAssignmentsPage({
  searchParams,
}: DriverAssignmentsPageProps) {
  const params = await searchParams;
  const rawSearch = Array.isArray(params.search) ? params.search[0] : params.search;
  const initialSearch = rawSearch?.trim().slice(0, 120) ?? "";
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

  return <DriverAssignments token={token} initialSearch={initialSearch} />;
}
