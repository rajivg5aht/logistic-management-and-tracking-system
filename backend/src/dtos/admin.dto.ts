import { z } from "zod";

const PhoneNumberDTO = z
  .string()
  .trim()
  .min(10, "Phone number must be at least 10 digits long");

const OptionalPhoneNumberDTO = z.union([z.literal(""), PhoneNumberDTO]);

export const AdminCreateUserDTO = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.literal("customer").default("customer"),
  phoneNumber: OptionalPhoneNumberDTO.optional().default(""),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export type AdminCreateUserDTO = z.infer<typeof AdminCreateUserDTO>;

export const AdminUpdateUserDTO = z
  .object({
    fullName: z.string().min(1, "Full name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    status: z.enum(["active", "inactive"]).optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .optional(),
    phoneNumber: OptionalPhoneNumberDTO.optional(),
  })
  .strict();

export type AdminUpdateUserDTO = z.infer<typeof AdminUpdateUserDTO>;
