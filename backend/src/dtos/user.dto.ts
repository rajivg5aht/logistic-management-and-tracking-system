import { z } from "zod";
import { UserSchema } from "../types/user.type";

// DTO for user registration
export const CreateUserDTO = UserSchema.pick({
  fullName: true,
  email: true,
  phoneNumber: true,
  password: true,
});

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

// DTO for user login
export const LoginUserDTO = UserSchema.pick({
  email: true,
  password: true,
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

// DTO for user update
export const UpdateUserDTO = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits long")
    .optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 character long")
    .optional(),
  profileImage: z.string().optional(),
});

export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
