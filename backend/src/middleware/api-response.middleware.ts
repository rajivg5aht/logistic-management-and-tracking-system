import { createHash, randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

type ApiEnvelope = {
  success?: boolean;
  status?: number;
  data?: unknown;
  meta?: { page?: number; limit?: number; totalPages?: number };
  links?: Record<string, string>;
};

type ResourceCandidate = Record<string, unknown> & { id: string };

const COLLECTION_ROUTES = [
  "/api/v1/admin/fleet-reports/incidents",
  "/api/v1/admin/fleet-reports/fuel-expenses",
  "/api/v1/driver/fleet/fuel-expenses",
  "/api/v1/driver/fleet/incidents",
  "/api/v1/admin/announcements",
  "/api/v1/admin/shipments",
  "/api/v1/admin/vehicles",
  "/api/v1/admin/drivers",
  "/api/v1/admin/users",
  "/api/v1/admin/payments",
  "/api/v1/admin/inquiries",
  "/api/v1/announcements",
  "/api/v1/shipments",
  "/api/v1/driver/shipments",
  "/api/v1/inquiries",
  "/api/v1/payments",
] as const;

function isApiEnvelope(value: unknown): value is ApiEnvelope {
  return typeof value === "object" && value !== null && "success" in value && "status" in value;
}

function isResourceCandidate(value: unknown): value is ResourceCandidate {
  return typeof value === "object" && value !== null && "id" in value && typeof value.id === "string";
}

function withoutQuery(url: string): string {
  return url.split("?")[0] || "/";
}

function canonicalCollectionPath(pathname: string): string | null {
  return COLLECTION_ROUTES.find((route) => pathname === route || pathname.startsWith(`${route}/`)) ?? null;
}

function buildPageUrl(req: Request, page: number): string {
  const url = new URL(req.originalUrl, "http://api.local");
  url.searchParams.set("page", String(page));
  return `${url.pathname}${url.search}`;
}

function buildLinks(req: Request, meta?: ApiEnvelope["meta"]): Record<string, string> {
  const links: Record<string, string> = { self: req.originalUrl || req.baseUrl || "/" };
  if (!meta?.page || !meta.limit || !meta.totalPages) return links;
  links.first = buildPageUrl(req, 1);
  links.last = buildPageUrl(req, meta.totalPages);
  if (meta.page > 1) links.previous = buildPageUrl(req, meta.page - 1);
  if (meta.page < meta.totalPages) links.next = buildPageUrl(req, meta.page + 1);
  return links;
}

function addResourceLinks(data: unknown, collectionPath: string | null): unknown {
  if (!collectionPath) return data;
  const toLinkedResource = (item: unknown) => {
    if (!isResourceCandidate(item)) return item;
    return { ...item, _links: { self: `${collectionPath}/${item.id}`, collection: collectionPath } };
  };
  return Array.isArray(data) ? data.map(toLinkedResource) : toLinkedResource(data);
}

function toLinkHeader(links: Record<string, string>): string {
  return Object.entries(links).map(([rel, href]) => `<${href}>; rel="${rel}"`).join(", ");
}

function matchesEtag(header: string | undefined, etag: string): boolean {
  if (!header) return false;
  return header.split(",").map((value) => value.trim()).some((value) => value === "*" || value === etag || value === `W/${etag}`);
}

/** Adds HTTP metadata without changing existing API payload fields. */
export function apiResponseMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = req.header("x-request-id")?.trim() || randomUUID();
  res.setHeader("X-Request-Id", requestId);
  const originalJson = res.json.bind(res);

  res.json = ((body: unknown) => {
    if (!isApiEnvelope(body)) return originalJson(body);
    const collectionPath = canonicalCollectionPath(withoutQuery(req.originalUrl));
    const links = { ...buildLinks(req, body.meta), ...(body.links ?? {}) };
    const enriched: ApiEnvelope = {
      ...body,
      data: body.success ? addResourceLinks(body.data, collectionPath) : body.data,
      links,
    };
    if (req.method === "POST" && body.success && collectionPath && isResourceCandidate(body.data)) {
      res.setHeader("Location", `${collectionPath}/${body.data.id}`);
    }

    const linkHeader = toLinkHeader(links);
    if (linkHeader) res.setHeader("Link", linkHeader);

    if (req.method === "GET" && body.success && res.statusCode >= 200 && res.statusCode < 300) {
      const etag = `"${createHash("sha256").update(JSON.stringify(enriched)).digest("base64url")}"`;
      res.setHeader("ETag", etag);
      res.setHeader("Cache-Control", req.path.startsWith("/api/v1/track") ? "public, max-age=60, must-revalidate" : "private, max-age=0, must-revalidate");
      if (matchesEtag(req.header("if-none-match"), etag)) {
        res.status(304).end();
        return res;
      }
    }
    return originalJson(enriched);
  }) as Response["json"];
  next();
}
