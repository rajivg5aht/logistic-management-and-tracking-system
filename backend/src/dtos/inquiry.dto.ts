import { z } from "zod";
import { INQUIRY_CATEGORIES, INQUIRY_STATUSES } from "../types/inquiry.type";

export const CreateInquiryDTO = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(80),
  email: z.email("Enter a valid email address").max(120),
  subject: z.string().trim().min(2, "Subject is required").max(120),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export const CreateCustomerInquiryDTO = z.object({
  subject: z.string().trim().min(2, "Subject is required").max(120),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export const AdminUpdateInquiryDTO = z
  .object({
    status: z.enum(INQUIRY_STATUSES).optional(),
    category: z.enum(INQUIRY_CATEGORIES).optional(),
    adminNote: z.string().trim().max(2000).optional(),
    adminReply: z.string().trim().max(4000).optional(),
  })
  .refine(
    (data) => data.status !== undefined ||
      data.category !== undefined ||
      data.adminNote !== undefined ||
      data.adminReply !== undefined,
    "Provide at least one field to update",
  );

export type CreateInquiryDTO = z.infer<typeof CreateInquiryDTO>;
export type CreateCustomerInquiryDTO = z.infer<typeof CreateCustomerInquiryDTO>;
export type AdminUpdateInquiryDTO = z.infer<typeof AdminUpdateInquiryDTO>;
