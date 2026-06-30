import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import PasswordUpdateForm from "@/components/profile/PasswordUpdateForm";
import { ArrowLeft } from "lucide-react";

export default async function ChangePasswordPage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_customer")?.value;

  if (!userCookie) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] transition hover:text-[var(--text)]"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </Link>
      </div>

      {/* Main Card */}
      <div className="card p-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">
            Security
          </p>
          <h1 className="mt-3 heading-md">
            Change Password
          </h1>
          <p className="mt-2 text-[var(--text-muted)]">
            Update your password to keep your account secure
          </p>
        </div>

        <PasswordUpdateForm />
      </div>
    </div>
  );
}