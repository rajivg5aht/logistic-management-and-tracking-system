export const INQUIRY_STATUSES = [
  "new",
  "in-progress",
  "resolved",
  "escalated",
] as const;

export const INQUIRY_CATEGORIES = ["support", "sales", "general"] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];
export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number];
