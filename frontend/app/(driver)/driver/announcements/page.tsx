import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AnnouncementsFeed from "@/components/announcements/AnnouncementsFeed";
import type { AuthUser } from "@/lib/api/auth.api";

export const metadata = {
  title: "Driver Announcements - CargoNep",
  description: "View official announcements for CargoNep drivers.",
};

export default async function DriverAnnouncementsPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_driver")?.value;
  const token = cookieStore.get("token_driver")?.value;

  if (!userCookie || !token) redirect("/login");

  let user: AuthUser;
  try {
    user = JSON.parse(userCookie) as AuthUser;
  } catch {
    redirect("/login");
  }

  if (user.role !== "driver") redirect("/dashboard");

  return <AnnouncementsFeed token={token} audienceName="drivers" />;
}
