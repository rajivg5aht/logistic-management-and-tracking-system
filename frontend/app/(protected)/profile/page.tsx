import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";
import ProfileHeader from "@/components/profile/ProfileHeader";
import QuickActionCards from "@/components/profile/QuickActionCards";
import SettingsList from "@/components/profile/SettingsList";
import SupportBanner from "@/components/profile/SupportBanner";
import TermsLogoutSection from "@/components/profile/TermsLogoutSection";

export default async function ProfilePage() {
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

  return (
    <div className="min-h-screen bg-[#050816] pt-10 pb-16">
      <div className="container-max space-y-8">
        {/* Profile Header */}
        <ProfileHeader user={user} />

        {/* Quick Action Cards */}
        <QuickActionCards />

        {/* Settings List */}
        <SettingsList user={user} />

        {/* Support Banner */}
        <SupportBanner />

        {/* Terms & Logout */}
        <TermsLogoutSection />

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-white/[0.05] text-center">
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} Logistic Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
