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