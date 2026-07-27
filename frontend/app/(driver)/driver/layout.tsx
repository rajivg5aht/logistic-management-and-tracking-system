import DriverLayoutClient from "@/components/driver/DriverLayoutClient";
import { AuthProvider } from "@/context/AuthContext";
import { requireRole } from "@/lib/auth/role-guard";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token } = await requireRole("driver");

  return (
    <AuthProvider initialUser={user} role="driver">
      <DriverLayoutClient user={user} token={token}>
        {children}
      </DriverLayoutClient>
    </AuthProvider>
  );
}
