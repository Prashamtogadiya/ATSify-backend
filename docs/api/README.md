# ATSify Backend API Documentation

## Overview
ATSify is an AI-assisted resume optimization platform. The backend owns authentication, file security, job request persistence, resume storage orchestration, analysis generation, and admin visibility.

Base URL:
- Development: http://localhost:3000/api/v1

## Product Intent
The API is designed around three user outcomes:
- Upload and protect resumes without exposing raw storage credentials
- Compare resumes against job descriptions with repeatable analysis history
- Give admins operational visibility into platform usage and role management

## System Boundary

```text
BOUNDARY MAP

[Frontend]
   sends authenticated HTTP requests to
      -> [Express API]

[Express API] internal control planes:
  - AuthN/AuthZ (JWT + RBAC)
  - Persistence adapter (MongoDB)
  - Binary storage adapter (Google Drive)
  - Analysis engine adapter (AI services)
```

Authenticated file streaming sits behind the API boundary. The browser never talks directly to Drive.

## Request and Response Conventions
All protected endpoints expect:
- `Authorization: Bearer <access_token>`
- `Content-Type: application/json` unless file upload is required

Common response shape:
```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Common error shape:
```json
{
  "success": false,
  "message": "..."
}
```

## API Modules
| Module | Purpose | Doc |
|---|---|---|
| Authentication | Sign up, sign in, refresh, logout | ./auth.md |
| Resume | Drive-backed upload, stream, metadata | ./resume.md |
| Job Requests | Store job descriptions and link resumes | ./job-request.md |
| Analysis | Run AI analysis and read history | ./analysis.md |
| Admin / RBAC | Admin dashboard, user role control | ./admin-rbac.md |

## Primary Execution Flow

```text
TIMELINE VIEW
T0  Resume upload accepted
T1  JWT + file policy checks pass
T2  PDF/pages written to Drive
T3  Drive file IDs committed to MongoDB
T4  Job request created
T5  Analysis generated
T6  Analysis persisted
T7  Client fetches latest or exact historical record
```

## Operational Guarantees
- Resume assets are private by default
- Ownership is enforced at the backend boundary
- Drive credentials are never exposed to the browser
- History retrieval is user-scoped; admin visibility is separate

## Version Notes
- Resume storage migrated from local uploads to Google Drive
- Resume PDFs and page images are streamed through backend routes
- Analysis history now supports both latest and specific-record access
- Admin and RBAC guidance is documented separately for operational clarity
