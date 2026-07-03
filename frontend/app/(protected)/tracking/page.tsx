import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TrackingPanel from "@/components/tracking/TrackingPanel";

export default async function TrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ trackingId?: string | string[] }>;
}) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_customer")?.value;

  if (!userCookie) {
    redirect("/login");
  }

  const params = await searchParams;
  const trackingId = Array.isArray(params.trackingId)
    ? params.trackingId[0]
    : params.trackingId;

  return <TrackingPanel initialTrackingId={trackingId ?? ""} />;
}
