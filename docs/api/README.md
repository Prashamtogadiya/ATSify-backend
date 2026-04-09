# ATSify API Reference

This document is the entry point for the backend API. It summarizes the platform contract, shows how the modules fit together, and links to the detailed module-level docs.

## Base URL

- Development: `http://localhost:3000/api/v1`

## API Goals

The API is designed to support four product flows:

1. Create and maintain authenticated user sessions.
2. Upload and privately access resumes.
3. Save job requests that define analysis context.
4. Generate, retrieve, and manage ATS analysis results.

## Module Map

| Module | Base Path | Purpose | Detailed Doc |
|---|---|---|---|
| Authentication | `/auth` | Session creation, renewal, logout | `./auth.md` |
| Resume | `/resume` | Upload, metadata retrieval, file streaming | `./resume.md` |
| Job Requests | `/job-requests` | Persist analysis context per user | `./job-request.md` |
| Analysis | `/analysis` | Generate ATS analysis and browse history | `./analysis.md` |
| Admin / RBAC | `/admin` | Admin metrics, user listing, role changes | `./admin-rbac.md` |

## Complete Endpoint Inventory

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/auth/signup` | Public | Create a user and start a session |
| `POST` | `/auth/login` | Public | Authenticate and start a session |
| `GET` | `/auth/refresh` | Refresh cookie | Renew access token |
| `POST` | `/auth/logout` | Public session context | Revoke refresh token and clear cookie |
| `POST` | `/resume/upload` | Bearer token | Upload and process a resume PDF |
| `GET` | `/resume` | Bearer token | List current user's resumes |
| `GET` | `/resume/:id` | Bearer token | Get resume metadata and backend proxy URLs |
| `GET` | `/resume/:id/pdf` | Bearer token | Stream the stored PDF |
| `GET` | `/resume/:id/images/:index` | Bearer token | Stream a rendered resume page image |
| `POST` | `/job-requests` | Bearer token | Create a job request |
| `GET` | `/job-requests` | Bearer token | List current user's job requests |
| `GET` | `/job-requests/:id` | Bearer token | Get one job request in user scope |
| `POST` | `/analysis/analyze` | Bearer token | Generate and save a new analysis |
| `GET` | `/analysis/history` | Bearer token | Get recent analysis history |
| `GET` | `/analysis/job-request/:jobRequestId/latest` | Bearer token | Get latest analysis for a job request |
| `GET` | `/analysis/:analysisId` | Bearer token | Get a specific historical analysis |
| `GET` | `/admin/dashboard/stats` | Bearer token + admin role | Get platform dashboard metrics |
| `GET` | `/admin/users` | Bearer token + admin role | List users with activity counts |
| `PATCH` | `/admin/users/:userId/role` | Bearer token + admin role | Change a user's role |

## End-to-End Platform Flow

```text
Auth -> Resume Upload -> Job Request -> Run Analysis -> Save Snapshot -> Read Latest or Historical Result
```

## Cross-Cutting Conventions

### Authentication

Protected endpoints expect:

- `Authorization: Bearer <access_token>`

Session renewal expects:

- `refreshToken` cookie set by the backend

### Content Types

- `application/json` for most endpoints
- `multipart/form-data` for resume upload

### Current Upload Constraints

- resume upload accepts PDF only
- maximum upload size is 5 MB

### Current Rate Limits

- `POST /analysis/analyze` is limited to 3 requests per minute per IP

### Current Response Styles

The implementation currently exposes more than one response envelope style. The docs preserve the current behavior rather than pretending the API is fully standardized.

| Pattern | Used By | Example |
|---|---|---|
| `success`, `message`, `data` | Analysis, admin, many auth responses | `{ "success": true, "message": "...", "data": {} }` |
| Direct object with resource key | Resume routes | `{ "message": "...", "resume": {} }` |
| `ApiResponse` shape | Job request routes | `{ "statusCode": 200, "data": {}, "message": "..." }` |

This is important for frontend integration, test expectations, and future API cleanup work.

## Error Behavior

Most failures resolve to one of these classes:

| Status | Meaning | Typical Sources |
|---|---|---|
| `400` | Validation or bad input | Zod validation, duplicate signup, malformed body |
| `401` | Missing or invalid authentication | Missing bearer token, expired access token, missing refresh cookie |
| `403` | Valid identity but not permitted | Invalid refresh token, admin-only route accessed by non-admin |
| `404` | Record or file not found in user scope | Missing job request, missing analysis, missing resume asset |
| `429` | Rate limited | Analysis endpoint |
| `500` | Unhandled server or dependency failure | Drive, AI, OCR, or database issues |

## Current Standard Error Sources

| Source | Typical Shape |
|---|---|
| Validation middleware | `{ "success": false, "message": "..." }` |
| Auth middleware | `{ "success": false, "message": "..." }` |
| Global error handler | `{ "success": false, "message": "..." }` |
| Not found middleware | `{ "error": "Not Found", "message": "...", "path": "..." }` |

## Middleware Pipeline

```text
Request -> Compression -> CORS -> JSON Parser -> HTTP Logger -> Cookie Parser -> Route Handlers -> 404 Handler -> Global Error Handler
```

## Dependency View by API Area

```text
Auth API     -> User Model
Resume API   -> Resume Model -> Google Drive -> PDF Conversion
Job Request  -> JobRequest Model
Analysis API -> Analysis Model -> Resume Model / JobRequest Model / Google Drive / OCR and Text Extraction / Groq Model
Admin API    -> User Model / Resume Model / JobRequest Model / Analysis Model
```

## Recommended Reading Order

- Start with `../architecture.md` for the system model.
- Read `./auth.md` and `./resume.md` first for core user flows.
- Use `./job-request.md` and `./analysis.md` for product behavior.
- Use `./admin-rbac.md` for operational/admin concerns.
- Use `../google-drive-integration.md` for storage specifics.
- Use `../security.md` for the security boundary and access model.
- Use `../operations.md` for runtime and deployment guidance.

## Change Management Note

If the team wants a more executive-ready platform contract, the next documentation milestone should be an OpenAPI spec or Postman collection generated from the same source of truth. This Markdown set is structured to make that migration straightforward.
