const API_BASE_URL =
  typeof window !== "undefined"
    ? ""
    : process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

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

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Request failed");
  }
  return payload;
}

export async function createInquiry(payload: CreateInquiryPayload): Promise<Inquiry> {
  const response = await fetch(API_BASE_URL + "/api/v1/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await parseResponse<{ data: Inquiry }>(response);
  return result.data;
}

export async function getMyInquiries(token: string): Promise<Inquiry[]> {
  const response = await fetch(API_BASE_URL + "/api/v1/inquiries/my", {
    headers: { Authorization: "Bearer " + token },
    credentials: "include",
  });
  const result = await parseResponse<{ data: Inquiry[] }>(response);
  return result.data;
}

export async function createMyInquiry(
  token: string,
  payload: CreateCustomerInquiryPayload,
): Promise<Inquiry> {
  const response = await fetch(API_BASE_URL + "/api/v1/inquiries/my", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  const result = await parseResponse<{ data: Inquiry }>(response);
  return result.data;
}

export async function adminGetInquiries(
  token: string,
  filters: AdminInquiryFilters = {},
): Promise<{ data: Inquiry[]; meta: InquiryMeta }> {
  const params = new URLSearchParams({
    page: String(filters.page ?? 1),
    limit: String(filters.limit ?? 5),
    sort: filters.sort ?? "newest",
  });
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);

  const response = await fetch(
    API_BASE_URL + "/api/v1/admin/inquiries?" + params.toString(),
    { headers: { Authorization: "Bearer " + token }, credentials: "include" },
  );
  const result = await parseResponse<{ data: Inquiry[]; meta: InquiryMeta }>(response);
  return { data: result.data, meta: result.meta };
}

export async function adminGetInquiryStats(token: string): Promise<InquiryStats> {
  const response = await fetch(API_BASE_URL + "/api/v1/admin/inquiries/stats", {
    headers: { Authorization: "Bearer " + token },
    credentials: "include",
  });
  const result = await parseResponse<{ data: InquiryStats }>(response);
  return result.data;
}

export async function adminUpdateInquiry(
  token: string,
  id: string,
  payload: AdminUpdateInquiryPayload,
): Promise<Inquiry> {
  const response = await fetch(API_BASE_URL + "/api/v1/admin/inquiries/" + id, {
    method: "PATCH",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  const result = await parseResponse<{ data: Inquiry }>(response);
  return result.data;
}

export async function adminDeleteInquiry(token: string, id: string): Promise<void> {
  const response = await fetch(API_BASE_URL + "/api/v1/admin/inquiries/" + id, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
    credentials: "include",
  });
  await parseResponse<{ data: null }>(response);
}
