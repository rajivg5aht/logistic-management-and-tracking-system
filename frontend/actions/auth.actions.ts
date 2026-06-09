"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginUser, registerUser } from "@/api/auth.api";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";

export type AuthFormState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await registerUser({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phoneNumber: parsed.data.phoneNumber,
      password: parsed.data.password,
    });
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Registration failed",
    };
  }

  redirect("/login");
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let token: string;
  let user: Awaited<ReturnType<typeof loginUser>>["user"];

  try {
    const result = await loginUser(parsed.data);
    token = result.token;
    user = result.user;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Login failed",
    };
  }

  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
  });

  cookieStore.set("user", JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
  });

  redirect("/dashboard");
}
