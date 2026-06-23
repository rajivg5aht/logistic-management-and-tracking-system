// "use server";

// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import {
//   loginUser,
//   registerUser,
//   updateProfile,
//   updatePassword,
//   getWhoami,
// } from "@/lib/api/auth.api";
// import { loginSchema, registerSchema } from "@/lib/schemas/auth.schema";
// import { z } from "zod";

// export type AuthFormState = {
//   success: boolean;
//   message?: string;
//   fieldErrors?: Record<string, string[]>;
// };

// const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

// export async function registerAction(
//   _prevState: AuthFormState,
//   formData: FormData,
// ): Promise<AuthFormState> {
//   const parsed = registerSchema.safeParse({
//     fullName: formData.get("fullName"),
//     email: formData.get("email"),
//     phoneNumber: formData.get("phoneNumber"),
//     password: formData.get("password"),
//     confirmPassword: formData.get("confirmPassword"),
//   });

//   if (!parsed.success) {
//     return {
//       success: false,
//       fieldErrors: parsed.error.flatten().fieldErrors,
//     };
//   }

//   try {
//     await registerUser({
//       fullName: parsed.data.fullName,
//       email: parsed.data.email,
//       phoneNumber: parsed.data.phoneNumber,
//       password: parsed.data.password,
//     });
//   } catch (error) {
//     return {
//       success: false,
//       message:
//         error instanceof Error ? error.message : "Registration failed",
//     };
//   }

//   redirect("/login");
// }

// export async function loginAction(
//   _prevState: AuthFormState,
//   formData: FormData,
// ): Promise<AuthFormState> {
//   const parsed = loginSchema.safeParse({
//     email: formData.get("email"),
//     password: formData.get("password"),
//   });

//   if (!parsed.success) {
//     return {
//       success: false,
//       fieldErrors: parsed.error.flatten().fieldErrors,
//     };
//   }

//   let token: string;
//   let user: Awaited<ReturnType<typeof loginUser>>["user"];

//   try {
//     const result = await loginUser(parsed.data);
//     token = result.token;
//     user = result.user;
//   } catch (error) {
//     return {
//       success: false,
//       message: error instanceof Error ? error.message : "Login failed",
//     };
//   }

//   const cookieStore = await cookies();

//   cookieStore.set("token", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     maxAge: AUTH_COOKIE_MAX_AGE,
//     path: "/",
//   });

//   cookieStore.set("user", JSON.stringify(user), {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     maxAge: AUTH_COOKIE_MAX_AGE,
//     path: "/",
//   });

//   redirect("/dashboard");
// }

// export async function updateProfileAction(
//   _prevState: AuthFormState,
//   formData: FormData,
// ): Promise<AuthFormState> {
//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get("token")?.value;

//     if (!token) {
//       return {
//         success: false,
//         message: "Unauthorized - Please login again",
//       };
//     }

//     const profileImage = formData.get("profileImage") as File | null;
//     const payload: any = {
//       fullName: formData.get("fullName") as string,
//       email: formData.get("email") as string,
//       phoneNumber: formData.get("phoneNumber") as string,
//     };

//     if (profileImage && profileImage.size > 0) {
//       payload.profileImage = profileImage;
//     }

//     const updatedUser = await updateProfile(token, payload);

//     // Update user cookie
//     cookieStore.set("user", JSON.stringify(updatedUser), {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: AUTH_COOKIE_MAX_AGE,
//       path: "/",
//     });

//     return {
//       success: true,
//       message: "Profile updated successfully",
//     };
//   } catch (error) {
//     return {
//       success: false,
//       message:
//         error instanceof Error ? error.message : "Failed to update profile",
//     };
//   }
// }

// export async function updatePasswordAction(
//   _prevState: AuthFormState,
//   formData: FormData,
// ): Promise<AuthFormState> {
//   const passwordSchema = z
//     .object({
//       newPassword: z
//         .string()
//         .min(6, "Password must be at least 6 characters long"),
//       confirmPassword: z.string(),
//     })
//     .refine((data) => data.newPassword === data.confirmPassword, {
//       message: "Passwords do not match",
//       path: ["confirmPassword"],
//     });

//   const parsed = passwordSchema.safeParse({
//     newPassword: formData.get("newPassword"),
//     confirmPassword: formData.get("confirmPassword"),
//   });

//   if (!parsed.success) {
//     return {
//       success: false,
//       fieldErrors: parsed.error.flatten().fieldErrors,
//     };
//   }

//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get("token")?.value;

//     if (!token) {
//       return {
//         success: false,
//         message: "Unauthorized - Please login again",
//       };
//     }

//     await updatePassword(token, { password: parsed.data.newPassword });

//     return {
//       success: true,
//       message: "Password updated successfully",
//     };
//   } catch (error) {
//     return {
//       success: false,
//       message:
//         error instanceof Error ? error.message : "Failed to update password",
//     };
//   }
// }

// export async function getUserFromCookie() {
//   const cookieStore = await cookies();
//   const userCookie = cookieStore.get("user")?.value;

//   if (!userCookie) {
//     return null;
//   }

//   try {
//     return JSON.parse(userCookie);
//   } catch {
//     return null;
//   }
// }

// export async function logoutAction() {
//   const cookieStore = await cookies();
//   cookieStore.delete("token");
//   cookieStore.delete("user");
//   redirect("/login");
// }
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  loginUser,
  registerUser,
  updateProfile,
  updatePassword,
  getWhoami,
} from "@/lib/api/auth.api";
import { loginSchema, registerSchema } from "@/lib/schemas/auth.schema";
import { z } from "zod";

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
    httpOnly: false, // Allow client-side JS to read via AuthContext
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
  });

  redirect("/dashboard");
}

export async function updateProfileAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Unauthorized - Please login again",
      };
    }

    const profileImage = formData.get("profileImage") as File | null;
    const payload: any = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phoneNumber: formData.get("phoneNumber") as string,
    };

    // ✅ Fixed: properly convert File for server-side fetch
    if (profileImage && profileImage.size > 0) {
      const arrayBuffer = await profileImage.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const blob = new Blob([buffer], { type: profileImage.type });
      payload.profileImage = new File([blob], profileImage.name, {
        type: profileImage.type,
      });
    }

    const updatedUser = await updateProfile(token, payload);

    cookieStore.set("user", JSON.stringify(updatedUser), {
      httpOnly: false, // Allow client-side JS to read via AuthContext
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_COOKIE_MAX_AGE,
      path: "/",
    });

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

export async function updatePasswordAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const passwordSchema = z
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

  const parsed = passwordSchema.safeParse({
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
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        success: false,
        message: "Unauthorized - Please login again",
      };
    }

    await updatePassword(token, { password: parsed.data.newPassword });

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update password",
    };
  }
}

export async function getUserFromCookie() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;

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
  cookieStore.delete("token");
  cookieStore.delete("user");
  redirect("/login");
}