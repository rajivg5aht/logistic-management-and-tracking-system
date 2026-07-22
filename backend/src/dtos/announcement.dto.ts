import { z } from "zod";
import { ANNOUNCEMENT_AUDIENCES } from "../types/announcement.type";

export const CreateAnnouncementDTO = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(3000),
  audience: z.enum(ANNOUNCEMENT_AUDIENCES),
});

export type CreateAnnouncementDTO = z.infer<typeof CreateAnnouncementDTO>;
