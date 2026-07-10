import {
  apiRequest,
  authenticatedRequest,
  authenticatedRequestWithMeta,
  buildQueryString,
} from "@/lib/api/api-client";

export type InquiryStatus = "new" | "in-progress" | "resolved" | "escalated";
export type InquiryCategory = "support" | "sales" | "general";

export type Inquiry = {
  id: string;
  customer: string | null;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  category: InquiryCategory;
  status: InquiryStatus;
  adminNote: string;
  adminReply: string;
  repliedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InquiryStats = {
  total: number;
  pending: number;
  resolved: number;
  newToday: number;
  resolvedRate: number;
};

export type InquiryMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CreateInquiryPayload = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
};

export type CreateCustomerInquiryPayload = {
  subject: string;
  message: string;
};

export type AdminInquiryFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: InquiryStatus;
  category?: InquiryCategory;
  sort?: "newest" | "oldest";
};

export type AdminUpdateInquiryPayload = {
  status?: InquiryStatus;
  category?: InquiryCategory;
  adminNote?: string;
  adminReply?: string;
};

export async function createInquiry(
  payload: CreateInquiryPayload,
): Promise<Inquiry> {
  return apiRequest<Inquiry>("/api/v1/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMyInquiries(token: string): Promise<Inquiry[]> {
  return authenticatedRequest<Inquiry[]>("/api/v1/inquiries/my", token, {
    method: "GET",
  });
}

export async function createMyInquiry(
  token: string,
  payload: CreateCustomerInquiryPayload,
): Promise<Inquiry> {
  return authenticatedRequest<Inquiry>("/api/v1/inquiries/my", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function adminGetInquiries(
  token: string,
  filters: AdminInquiryFilters = {},
): Promise<{ data: Inquiry[]; meta: InquiryMeta }> {
  return authenticatedRequestWithMeta<Inquiry[], InquiryMeta>(
    `/api/v1/admin/inquiries${buildQueryString({
      page: filters.page ?? 1,
      limit: filters.limit ?? 5,
      search: filters.search,
      status: filters.status,
      category: filters.category,
      sort: filters.sort ?? "newest",
    })}`,
    token,
    { method: "GET" },
  );
}

export async function adminGetInquiryStats(
  token: string,
): Promise<InquiryStats> {
  return authenticatedRequest<InquiryStats>(
    "/api/v1/admin/inquiries/stats",
    token,
    { method: "GET" },
  );
}

export async function adminUpdateInquiry(
  token: string,
  id: string,
  payload: AdminUpdateInquiryPayload,
): Promise<Inquiry> {
  return authenticatedRequest<Inquiry>(`/api/v1/admin/inquiries/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function adminDeleteInquiry(
  token: string,
  id: string,
): Promise<void> {
  await authenticatedRequest<null>(`/api/v1/admin/inquiries/${id}`, token, {
    method: "DELETE",
  });
}
