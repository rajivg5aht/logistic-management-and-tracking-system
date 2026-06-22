import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import PasswordUpdateForm from "@/components/profile/PasswordUpdateForm";
import { ArrowLeft } from "lucide-react";

export default async function ChangePasswordPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;

  if (!userCookie) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#050816]">
      <div className="container-max py-16 lg:py-20">
        <div className="mx-auto max-w-2xl">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/40 transition hover:text-white/70"
            >
              <ArrowLeft size={16} />
              Back to Profile
            </Link>
          </div>

          {/* Main Card */}
          <div className="card p-8">
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00E5FF]">
                Security
              </p>
              <h1 className="mt-3 heading-md">
                Change Password
              </h1>
              <p className="mt-2 text-white/40">
                Update your password to keep your account secure
              </p>
            </div>

            <PasswordUpdateForm />
          </div>
        </div>
      </div>
    </main>
  );
}