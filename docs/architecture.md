# ATSify Backend Architecture

This document explains how the ATSify backend is organized, how data moves through the platform, and which design choices matter most for engineering leadership, product stakeholders, and future contributors.

## System Intent

The backend exists to solve five platform problems:

1. Authenticate users and maintain secure sessions.
2. Store resumes privately without exposing storage credentials to the browser.
3. Persist job requests as the analysis context.
4. Generate and retain ATS analysis history.
5. Provide admin-only operational visibility and user management.

## Architecture at a Glance

```mermaid
flowchart LR
    FE["Frontend Client"] --> API["Express API"]

    subgraph Backend["ATSify Backend"]
        MW["Middleware"]
        ROUTES["Routes"]
        CTRL["Controllers"]
        SVC["Services"]
        MODELS["Mongoose Models"]
    end

    API --> MW
    API --> ROUTES
    ROUTES --> CTRL
    CTRL --> SVC
    SVC --> MODELS
    MODELS --> MDB["MongoDB"]
    SVC --> DRIVE["Google Drive"]
    SVC --> AI["Groq Model"]
    SVC --> OCR["PDF / OCR Utilities"]
```

## Responsibility Breakdown

| Layer | Responsibility | Representative Files |
|---|---|---|
| App wiring | Middleware, route mounting, global error handling | `src/app.ts` |
| Routes | Endpoint definitions and middleware composition | `src/routes/*.ts` |
| Controllers | HTTP request orchestration and response shaping | `src/controllers/*.ts` |
| Services | Business logic, persistence orchestration, external integrations | `src/services/*.ts` |
| Models | MongoDB document schemas | `src/models/*.ts` |
| Middleware | Auth, validation, error handling, rate limiting | `src/middleware/*.ts` |
| Utilities | Logging, OCR, PDF extraction, upload helper, API helpers | `src/utils/*.ts` |

## Primary Domain Entities

```mermaid
flowchart TD
    USER["User"]
    RESUME["Resume"]
    JOB["Job Request"]
    ANALYSIS["Analysis"]

    USER -->|"owns"| RESUME
    USER -->|"creates"| JOB
    USER -->|"receives"| ANALYSIS
    RESUME -->|"selected by"| JOB
    JOB -->|"drives"| ANALYSIS
    RESUME -->|"is evaluated in"| ANALYSIS

    USER_META["Fields: id, email, role"] -.-> USER
    RESUME_META["Fields: id, userId, resumeName, originalPdfDriveFileId"] -.-> RESUME
    JOB_META["Fields: id, userId, resumeId, companyName, jobTitle"] -.-> JOB
    ANALYSIS_META["Fields: id, userId, resumeId, jobRequestId, overallScore"] -.-> ANALYSIS
```

## Request Lifecycle

```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant Controller
    participant Service
    participant DB as MongoDB
    participant External

    Client->>Middleware: HTTP request
    Middleware->>Middleware: Auth / validation / rate limit
    Middleware->>Controller: Validated request
    Controller->>Service: Business operation
    Service->>DB: Read / write metadata
    Service->>External: Drive / AI / OCR as needed
    Service-->>Controller: Result
    Controller-->>Client: JSON or stream response
```

## Authentication and Authorization

The platform uses two separate credential types:

- Access token: short-lived JWT sent in `Authorization: Bearer <token>`
- Refresh token: long-lived `httpOnly` cookie stored in MongoDB and used to mint a new access token

Role-based authorization is currently simple and explicit:

- `user` can access user-scoped business routes
- `admin` can access admin routes through `requireAdmin`

```mermaid
flowchart TD
    A["Incoming protected request"] --> B["authenticate middleware"]
    B -->|Missing or invalid token| C["401 Unauthorized"]
    B -->|Valid token| D["req.userId + req.userRole set"]
    D --> E{"Admin route?"}
    E -->|No| F["Controller execution"]
    E -->|Yes| G["requireAdmin"]
    G -->|role != admin| H["403 Forbidden"]
    G -->|role = admin| F
```

## Resume Storage Architecture

Resume storage is intentionally split:

- MongoDB stores ownership, metadata, and Drive file identifiers.
- Google Drive stores the original PDF and generated page images.
- Backend streaming endpoints hide Drive internals from the client.

```mermaid
flowchart TD
    U["User uploads PDF"] --> INTAKE["In-memory intake"]
    INTAKE --> TEMP["Temporary working file"]

    TEMP --> CONVERT["Convert PDF to page images"]
    INTAKE --> PDFUP["Upload original PDF to Drive"]
    CONVERT --> IMGUP["Upload page images to Drive"]

    PDFUP --> META["Create resume metadata record"]
    IMGUP --> META
    META --> RESP["Return proxy URLs to client"]
```

## Analysis Architecture

Analysis is a multi-stage orchestration pipeline:

```mermaid
flowchart LR
    A["Analyze request"] --> B["Load resume and job request"]
    B --> C{"Available source"}
    C -->|Drive images or local images| D["Extract text with OCR"]
    C -->|Drive PDF or local PDF| E["Extract text from PDF"]
    D --> F["Build analysis prompt"]
    E --> F
    F --> G["Call Groq model"]
    G --> H["Parse structured JSON result"]
    H --> I["Persist analysis snapshot"]
    I --> J["Return analysis response"]
```

## API Boundary Decisions

| Decision | Why it matters |
|---|---|
| Backend-owned file streaming | Prevents the browser from receiving raw Drive credentials or direct Drive URLs |
| Refresh token stored in DB | Allows refresh token invalidation on logout and role change |
| Historical analysis persistence | Supports auditability, product history views, and exact replay of past results |
| User-scoped queries in controllers/services | Reduces accidental data leakage across tenants |
| Admin RBAC handled in middleware | Keeps authorization explicit and consistent |

## Operational Dependencies

| Dependency | Used For | Failure Impact |
|---|---|---|
| MongoDB | Users, resumes, job requests, analyses | Core platform unavailable |
| Google Drive API | Resume PDF and image storage / retrieval | Upload and file streaming unavailable |
| Groq model | ATS analysis generation | Analysis endpoint degraded or unavailable |
| OCR / PDF tooling | Text extraction from resumes | Analysis quality or availability degraded |

## Security Boundary

```mermaid
flowchart TD
    Browser["Browser"] --> API["Authenticated Backend API"]
    API --> DB["MongoDB"]
    API --> Drive["Google Drive"]

    Browser -. no direct access .-> Drive
    Browser -. no secret access .-> DB
```

## Known Architectural Constraints

- CORS origin is currently hard-coded for local development.
- API response envelopes are not fully standardized across all modules.
- Resume upload processing performs PDF conversion synchronously inside the request path, which may become a scale bottleneck for larger files or higher concurrency.
- The analysis service trusts overall flow ownership assumptions; future hardening could enforce ownership again at service level.

## Recommended Next Evolution

1. Move long-running resume processing and analysis into background jobs.
2. Standardize response envelopes across every module.
3. Externalize CORS, cookie, and frontend-origin configuration.
4. Add stronger audit logging for admin actions.
5. Introduce storage abstraction so Drive can be replaced without controller changes.
