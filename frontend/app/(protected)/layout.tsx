import { AuthProvider } from "@/context/AuthContext";
import CustomerLayoutClient from "@/components/dashboard/CustomerLayoutClient";
import { requireRole } from "@/lib/auth/role-guard";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token } = await requireRole("customer");

  return (
    <AuthProvider initialUser={user} role="customer">
      <CustomerLayoutClient token={token}>{children}</CustomerLayoutClient>
    </AuthProvider>
  );
}
