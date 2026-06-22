import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { AuthUser } from "@/lib/api/auth.api";
import ProfileUpdateForm from "@/components/profile/ProfileUpdateForm";
import { KeyRound, Shield, Bell } from "lucide-react";

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
    <main className="min-h-screen bg-[#050816] py-16 lg:py-20">
      <div className="container-max">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00E5FF]">
            Settings
          </p>
          <h1 className="mt-3 heading-md">Profile Settings</h1>
          <p className="mt-2 text-white/40">
            Manage your personal information and account security
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid gap-7 lg:grid-cols-[1fr_380px]">
          {/* Left Column — Profile Form */}
          <div className="card p-8">
            <ProfileUpdateForm user={user} />
          </div>

          {/* Right Column — Secondary Cards */}
          <div className="space-y-7">
            {/* Security & Password Card */}
            <div className="card p-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
                <Shield size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Security</h3>
              <p className="mt-1 text-sm text-white/40">
                Manage your password and account security settings
              </p>
              <div className="mt-6 border-t border-white/[0.06] pt-6">
                <Link
                  href="/change-password"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-3 text-sm font-semibold text-white/80 transition-all hover:bg-white/5 hover:text-white"
                >
                  <KeyRound size={16} />
                  Change Password
                </Link>
              </div>
            </div>

            {/* Notifications Card */}
            <div className="card p-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00E5FF]/10 text-[#00E5FF]">
                <Bell size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Notifications</h3>
              <p className="mt-1 text-sm text-white/40">
                Configure how you receive alerts and updates
              </p>
              <div className="mt-6 border-t border-white/[0.06] pt-6">
                <p className="text-sm text-white/30">
                  Notification preferences coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}