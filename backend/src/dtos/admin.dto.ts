import { z } from "zod";

export const AdminCreateUserDTO = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.literal("customer").default("customer"),
  phoneNumber: z.string().optional().default(""),
});

export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;

export const AdminUpdateUserDTO = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  status: z.enum(["active", "inactive"]).optional(),
  password: z.string().min(6, "Password must be at least 6 characters long").optional(),
  phoneNumber: z.string().optional(),
}).strict();

export type AdminUpdateUserDTO = z.infer<typeof AdminUpdateUserDTO>;
