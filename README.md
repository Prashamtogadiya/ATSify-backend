# ATSify Backend

Production backend for ATSify resume analysis, access control, and Drive-backed file orchestration.

## What This Backend Owns
- Authentication and session renewal
- User/admin RBAC enforcement
- Resume upload, storage, and streaming
- Job request persistence
- ATS analysis generation and history retrieval
- Admin dashboards and role management

## Quick Start
```powershell
npm install
npm run dev
```

Build:
```powershell
npm run build
```

## Documentation Map
| Document | What it covers |
|---|---|
| docs/api/README.md | API index and platform overview |
| docs/architecture.md | System design and workflow diagrams |
| docs/google-drive-integration.md | Drive auth, folder strategy, and retrieval model |
| docs/testing-guide.md | Test strategy and release gates |

## Required Environment Variables
- MONGODB_URI
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- GOOGLE_DRIVE_CLIENT_ID
- GOOGLE_DRIVE_CLIENT_SECRET
- GOOGLE_DRIVE_REFRESH_TOKEN
- GOOGLE_DRIVE_BASE_FOLDER_ID

Optional:
- GOOGLE_DRIVE_REDIRECT_URI

## Production Notes
- Resume files are not served from the local uploads directory
- Every file read is mediated by authenticated backend routes
- Drive credentials are backend-only secrets
- Analysis history supports both latest and exact historical retrieval
