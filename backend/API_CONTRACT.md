# CargoNep API contract

## Compatibility promise

The mobile app and web application share the same API. Existing `/api/v1` paths,
request fields, response fields, authentication mechanism, and default ordering
remain supported. New HTTP headers and `links` / `_links` properties are additive:
clients that do not use them continue to work unchanged.

Breaking changes must be introduced under `/api/v2`, not by changing a published
`/api/v1` response shape.

## Base URL and authentication

- Base path: `/api/v1`
- Protected requests use `Authorization: Bearer <JWT>`.
- Browser clients may additionally use the existing authenticated cookie flow.
- The server sends `X-Request-Id` on every response. Clients may send one to
  correlate logs and support requests.

## Standard response envelope

```json
{
  "status": 200,
  "success": true,
  "message": "Shipments retrieved successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  },
  "links": {
    "self": "/api/v1/admin/shipments?page=1&limit=10",
    "first": "/api/v1/admin/shipments?page=1&limit=10",
    "next": "/api/v1/admin/shipments?page=2&limit=10",
    "last": "/api/v1/admin/shipments?page=5&limit=10"
  }
}
```

Resource records returned by supported collections also carry additive links:

```json
{
  "id": "shipment-id",
  "trackingId": "LN-100001",
  "_links": {
    "self": "/api/v1/admin/shipments/shipment-id",
    "collection": "/api/v1/admin/shipments"
  }
}
```

An error always retains the envelope fields:

```json
{
  "status": 400,
  "success": false,
  "message": "Invalid shipment ID",
  "data": null,
  "links": { "self": "/api/v1/admin/shipments/not-an-id" }
}
```

## HTTP semantics and headers

| Situation | Contract |
| --- | --- |
| Successful creation | `201 Created`; collection resources also return `Location` when an ID is available. |
| Successful read | `200 OK`, `ETag`, `Cache-Control`, and `Link` headers. |
| Unchanged read | Send the prior `ETag` in `If-None-Match`; receive `304 Not Modified` with no body. |
| Collection navigation | `Link` header and `links.first`, `links.previous`, `links.next`, `links.last` as applicable. |
| Invalid request | `400 Bad Request` with the standard error envelope. |
| Missing resource | `404 Not Found` with the standard error envelope. |
| State conflict | `409 Conflict` when a shipment or workflow cannot make the requested transition. |

Authenticated responses use `Cache-Control: private, max-age=0, must-revalidate`.
Public tracking responses use a short public cache lifetime and can be revalidated
through `ETag`.

## Collection query contract

All collection endpoints should accept the following shared controls:

- `page`: positive integer, defaults to `1`.
- `limit`: positive integer, defaults to `10`; standard maximum is `100` unless
  a documented resource has a lower operational limit.
- `search`: trimmed text search across the resource's documented searchable fields.
- `sort`: an allowlisted field. Prefix with `-` for descending order; for example,
  `sort=-updatedAt`.

Current shipment list support:

```text
GET /api/v1/admin/shipments?page=1&limit=20&status=in-transit&search=Kathmandu&sort=-updatedAt
```

Allowed shipment sort fields are `createdAt`, `updatedAt`, and `trackingId`.
Unknown sort fields are ignored and the endpoint default is used. This prevents
database-field injection while preserving stable client behavior.

## Resource map

| Domain | Collection | Item / workflow resources |
| --- | --- | --- |
| Authentication | `/auth` | register, login, password reset, current user |
| Customer shipments | `/shipments` | shipment, location, customer lifecycle actions |
| Admin shipments | `/admin/shipments` | shipment, statistics, analytics |
| Driver work | `/driver/shipments` | assignment, delivery stage, proof, COD collection |
| Fleet | `/admin/vehicles`, `/admin/fleet-reports` | vehicle, incidents, fuel expenses |
| Users and drivers | `/admin/users`, `/admin/drivers` | user and driver management |
| Payments | `/payments`, `/admin/payments` | payment, settlement, refund workflow |
| Customer support | `/inquiries`, `/admin/inquiries` | inquiry and support workflow |
| Announcements | `/announcements`, `/admin/announcements` | announcement management |
| Public tracking | `/track/{trackingId}` | public shipment status |

Some established `/api/v1` paths describe workflow actions such as `cancel`,
`stage`, `proof`, `cod`, `refund`, and `settle`. They remain supported for mobile
compatibility. New endpoints should model these as documented sub-resources or
state-transition requests, and any replacement must be introduced in a new API
version while retaining a compatibility period.

## Client implementation guidance

1. Continue reading `status`, `success`, `message`, `data`, and `meta` exactly as
   existing clients do.
2. Prefer `links.next` or the `Link` header for pagination rather than manually
   constructing a next-page URL.
3. Store `ETag` per GET URL and send it back with `If-None-Match` when a cached
   view is refreshed.
4. Display `X-Request-Id` when reporting an API issue to support staff.
5. Treat unknown response properties as forward-compatible additions.

## Ownership boundary

- **Routes** define URL and middleware composition.
- **Controllers** validate HTTP input and translate service results to responses.
- **Services** own workflow rules, authorization checks, and cross-resource work.
- **Repositories** own persistence queries and return models to services.
- **Middleware** owns authentication, shared HTTP metadata, and error conversion.

New code should preserve this boundary and should not introduce direct database
queries inside controllers.
