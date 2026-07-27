import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/auth.api";

export type AppRole = AuthUser["role"];

type Session = {
  user: AuthUser;
  token: string;
};

const SESSION_KEYS: Record<AppRole, { user: string; token: string }> = {
  admin: { user: "user_admin", token: "token_admin" },
  customer: { user: "user_customer", token: "token_customer" },
  driver: { user: "user_driver", token: "token_driver" },
};

function redirectForRole(role: AppRole): never {
  redirect(role === "admin" ? "/admin" : role === "driver" ? "/driver" : "/dashboard");
}

/**
 * Server-only session gate shared by every protected route. It keeps cookie
 * names and role redirects in one place without exposing tokens to the client.
 */
export async function requireRole(role: AppRole): Promise<Session> {
  const cookieStore = await cookies();
  const keys = SESSION_KEYS[role];
  const userCookie = cookieStore.get(keys.user)?.value;
  const token = cookieStore.get(keys.token)?.value;

  if (!userCookie || !token) redirect("/login");

  let user: AuthUser;
  try {
    user = JSON.parse(userCookie) as AuthUser;
  } catch {
    redirect("/login");
  }

  if (user.role !== role) redirectForRole(user.role);

  return { user, token };
}
