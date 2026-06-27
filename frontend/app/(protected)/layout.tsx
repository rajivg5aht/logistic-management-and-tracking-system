import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AuthProvider } from "@/context/AuthContext";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user_customer")?.value;

  if (!userCookie) {
    redirect("/login");
  }

  let user: any;
  try {
    user = JSON.parse(userCookie);
  } catch {
    redirect("/login");
  }

  // Redirect users with other roles to their respective dashboards
  if (user?.role === "admin") {
    redirect("/admin");
  } else if (user?.role === "driver") {
    redirect("/driver");
  } else if (user?.role !== "customer") {
    redirect("/login");
  }

  return (
    <AuthProvider initialUser={user} role="customer">
      <div className="min-h-screen bg-[var(--app-bg)]">
        {/* Sidebar Panel */}
        <Sidebar />

        {/* Main Content */}
        <div className="lg:pl-60">
          {/* Sticky Header */}
          <DashboardHeader />

          {/* Page Content */}
          <main className="mx-auto max-w-[1180px] px-6 py-8 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}