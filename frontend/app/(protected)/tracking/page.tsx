import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TrackingPanel from "@/components/tracking/TrackingPanel";

export default async function TrackingPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_customer")?.value;

  if (!userCookie) {
    redirect("/login");
  }

  return <TrackingPanel />;
}
