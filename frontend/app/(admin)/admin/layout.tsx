import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { AuthProvider } from "@/context/AuthContext";
import { requireRole } from "@/lib/auth/role-guard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token } = await requireRole("admin");

  return (
    <AuthProvider initialUser={user} role="admin">
      <AdminLayoutClient user={user} token={token}>
        {children}
      </AdminLayoutClient>
    </AuthProvider>
  );
}
