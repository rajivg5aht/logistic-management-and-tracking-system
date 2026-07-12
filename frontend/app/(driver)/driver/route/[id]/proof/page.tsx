import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import DriverProofOfDelivery from "@/components/driver/DriverProofOfDelivery";

export const metadata = {
  title: "Proof of Delivery - CargoNep",
  description: "Capture proof of delivery and confirm a completed shipment.",
};

export default async function DriverProofOfDeliveryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  return <DriverProofOfDelivery token={token} shipmentId={id} />;
}
