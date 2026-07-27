import { z } from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema.pick({
  fullName: true,
  email: true,
  phoneNumber: true,
  password: true,
});

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = UserSchema.pick({
  email: true,
  password: true,
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits long")
    .optional(),
  profileImage: z.string().optional(),
}).strict();

export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;

export const ChangePasswordDTO = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});

export type ChangePasswordDTO = z.infer<typeof ChangePasswordDTO>;

export const ForgotPasswordDTO = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordDTO>;

export const ResetPasswordDTO = z.object({
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});

export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTO>;
