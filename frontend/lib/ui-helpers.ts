import { API_BASE_URL } from "@/lib/config";

export type PageToken = number | "...";

export function getInitials(name?: string | null, fallback = "?"): string {
  if (!name) return fallback;

  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return initials || fallback;
}

export function getPageNumbers(current: number, total: number): PageToken[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages: PageToken[] = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (current < total - 2) pages.push("...");
  pages.push(total);

  return pages;
}

export function resolveProfileImage(value?: string | null): string | null {
  if (!value) return null;
  if (
    value.startsWith("data:") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }
  if (value.startsWith("/")) return `${API_BASE_URL}${value}`;
  return value;
}

export function formatMemberSince(
  createdAt?: string,
  fallback = "Not available",
): string {
  if (!createdAt) return fallback;

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatDriverCode(id: string): string {
  return `LN-DR-${id.slice(-4).toUpperCase()}`;
}

export function formatStatusLabel(status = "active"): string {
  return status.replace(/[-_]/g, " ").toUpperCase();
}
