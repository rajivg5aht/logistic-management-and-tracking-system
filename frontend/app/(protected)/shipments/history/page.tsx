import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import ShipmentHistory from "@/components/shipment/ShipmentHistory";

export const metadata = {
  title: "Shipment History - CargoNep",
  description: "Review and manage your past logistics operations",
};

export default async function ShipmentHistoryPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_customer")?.value;

  if (!userCookie) {
    redirect("/login");
  }

  let user: AuthUser;
  try {
    user = JSON.parse(userCookie) as AuthUser;
  } catch {
    redirect("/login");
  }

  return <ShipmentHistory user={user} />;
}
