"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { AuthUser } from "@/lib/api/auth.api";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
});

export function AuthProvider({
  children,
  initialUser = null,
  role = "customer",
}: {
  children: ReactNode;
  initialUser?: AuthUser | null;
  role?: "customer" | "admin" | "driver";
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);

  useEffect(() => {
    // Read user from role-specific cookie on mount if not provided by server
    if (!user) {
      const cookieName = `user_${role}=`;
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith(cookieName))
        ?.split("=")[1];

      if (cookieValue) {
        try {
          const parsed = JSON.parse(decodeURIComponent(cookieValue)) as AuthUser;
          setUser(parsed);
        } catch {
          setUser(null);
        }
      }
    }
    setIsLoading(false);
  }, [user, role]);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}