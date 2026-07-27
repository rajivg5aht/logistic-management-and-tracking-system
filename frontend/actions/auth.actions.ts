"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  changePassword,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  type AuthUser,
  type UpdateProfilePayload,
} from "@/lib/api/auth.api";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/schemas/auth.schema";
import { AUTH_COOKIE_MAX_AGE } from "@/lib/config";
import { z } from "zod";

export type AuthFormState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  user?: AuthUser;
};

const passwordUpdateSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const passwordChangeSchema = passwordUpdateSchema.safeExtend({
  currentPassword: z.string().min(1, "Current password is required"),
});

function cookieOptions(httpOnly: boolean) {
  return {
    httpOnly,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
  };
}

function buildProfilePayload(formData: FormData): UpdateProfilePayload {
  const payload: UpdateProfilePayload = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    phoneNumber: formData.get("phoneNumber") as string,
  };
  const profileImage = formData.get("profileImage");
  if (profileImage instanceof File && profileImage.size > 0) {
    payload.profileImage = profileImage;
  }
  return payload;
}

async function getAuthToken(role: AuthUser["role"]): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(`token_${role}`)?.value ?? null;
}

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
      message: error instanceof Error ? error.message : "Registration failed",
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

  const selectedTab = formData.get("role") as string;
  let expectedRole = "customer";
  if (selectedTab === "Admin") {
    expectedRole = "admin";
  } else if (selectedTab === "Driver") {
    expectedRole = "driver";
  }

  if (user.role !== expectedRole) {
    let friendlyName = "Customer";
    if (user.role === "admin") friendlyName = "Admin";
    else if (user.role === "driver") friendlyName = "Driver";

    return {
      success: false,
      message: `Role mismatch. Your account is registered as a ${friendlyName}. Please select the correct tab.`,
    };
  }

  const cookieStore = await cookies();
  const tokenCookieName = `token_${user.role}`;
  const userCookieName = `user_${user.role}`;

  cookieStore.set(tokenCookieName, token, cookieOptions(true));

  cookieStore.set(userCookieName, JSON.stringify(user), cookieOptions(false));

  if (user.role === "admin") {
    redirect("/admin");
  } else if (user.role === "driver") {
    redirect("/driver");
  } else {
    redirect("/dashboard");
  }
}

export async function forgotPasswordAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await requestPasswordReset(parsed.data.email);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not send reset link",
    };
  }

  return {
    success: true,
    message:
      "If an account exists for that email, a password reset link is on its way. Please check your inbox.",
  };
}

export async function resetPasswordAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const token = formData.get("token") as string;

  if (!token) {
    return {
      success: false,
      message: "This reset link is invalid or has expired.",
    };
  }

  const parsed = resetPasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await resetPassword(token, parsed.data.newPassword);
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Could not reset password",
    };
  }

  return {
    success: true,
    message:
      "Your password has been reset. You can now sign in with your new password.",
  };
}

export async function updateProfileAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const cookieStore = await cookies();
    const token = await getAuthToken("customer");

    if (!token) {
      return {
        success: false,
        message: "Unauthorized - Please login again",
      };
    }

    const payload = buildProfilePayload(formData);

    const updatedUser = await updateProfile(token, payload);

    cookieStore.set(
      `user_${updatedUser.role}`,
      JSON.stringify(updatedUser),
      cookieOptions(false),
    );

    return {
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

export async function updatePasswordAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const token = await getAuthToken("customer");

    if (!token) {
      return {
        success: false,
        message: "Unauthorized - Please login again",
      };
    }

    await changePassword(token, {
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update password",
    };
  }
}

export async function getUserFromCookie(
  role: "customer" | "admin" | "driver" = "customer",
) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get(`user_${role}`)?.value;

  if (!userCookie) {
    return null;
  }

  try {
    return JSON.parse(userCookie);
  } catch {
    return null;
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token_customer");
  cookieStore.delete("user_customer");
  cookieStore.delete("token_admin");
  cookieStore.delete("user_admin");
  cookieStore.delete("token_driver");
  cookieStore.delete("user_driver");
  redirect("/login");
}

export async function updateAdminProfileAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token_admin")?.value;

    if (!token) {
      return {
        success: false,
        message: "Unauthorized - Please login again",
      };
    }

    const payload = buildProfilePayload(formData);

    const updatedUser = await updateProfile(token, payload);
    if (updatedUser.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized admin profile response",
      };
    }

    cookieStore.set(
      "user_admin",
      JSON.stringify(updatedUser),
      cookieOptions(false),
    );

    return {
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

export async function updateAdminPasswordAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token_admin")?.value;

    if (!token) {
      return {
        success: false,
        message: "Unauthorized - Please login again",
      };
    }

    await changePassword(token, {
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update password",
    };
  }
}

export async function updateDriverProfileAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token_driver")?.value;

    if (!token) {
      return {
        success: false,
        message: "Unauthorized - Please login again",
      };
    }

    const payload = buildProfilePayload(formData);

    const updatedUser = await updateProfile(token, payload);
    if (updatedUser.role !== "driver") {
      return {
        success: false,
        message: "Unauthorized driver profile response",
      };
    }

    cookieStore.set(
      "user_driver",
      JSON.stringify(updatedUser),
      cookieOptions(false),
    );

    return {
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

export async function updateDriverPasswordAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token_driver")?.value;

    if (!token) {
      return {
        success: false,
        message: "Unauthorized - Please login again",
      };
    }

    await changePassword(token, {
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update password",
    };
  }
}
