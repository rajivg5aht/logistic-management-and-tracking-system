import { z } from "zod";

export const UserSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),

  email: z.string().email("Invalid email address"),

  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits long"),

  password: z
    .string()
    .min(6, "Password must be at least 6 character long"),

  role: z.enum(["admin", "user"]).default("user"),
});

export type UserType = z.infer<typeof UserSchema>;