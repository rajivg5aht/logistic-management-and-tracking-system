import { authenticatedRequest } from "@/lib/api/api-client";

export type AnnouncementAudience = "customer" | "driver" | "all";

export type Announcement = {
  id: string;
  title: string;
  message: string;
  audience: AnnouncementAudience;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateAnnouncementPayload = {
  title: string;
  message: string;
  audience: AnnouncementAudience;
};

export async function getMyAnnouncements(token: string): Promise<Announcement[]> {
  return authenticatedRequest<Announcement[]>("/api/v1/announcements", token, {
    method: "GET",
  });
}

export async function adminGetAnnouncements(token: string): Promise<Announcement[]> {
  return authenticatedRequest<Announcement[]>(
    "/api/v1/admin/announcements",
    token,
    { method: "GET" },
  );
}

export async function adminCreateAnnouncement(
  token: string,
  payload: CreateAnnouncementPayload,
): Promise<Announcement> {
  return authenticatedRequest<Announcement>(
    "/api/v1/admin/announcements",
    token,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function adminDeleteAnnouncement(
  token: string,
  id: string,
): Promise<void> {
  await authenticatedRequest<null>(
    `/api/v1/admin/announcements/${id}`,
    token,
    { method: "DELETE" },
  );
}
