export const ANNOUNCEMENT_AUDIENCES = ["customer", "driver", "all"] as const;

export type AnnouncementAudience = (typeof ANNOUNCEMENT_AUDIENCES)[number];
export type AnnouncementRecipientRole = Exclude<AnnouncementAudience, "all">;
