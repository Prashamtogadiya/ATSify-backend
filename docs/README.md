# ATSify Backend Documentation

This directory contains the production-facing documentation for the ATSify backend. It is written to support engineers, QA, product managers, and technical leadership with a shared understanding of how the backend works, how it should be operated, and how the API should be consumed.

## Recommended Reading Order

| Document | Audience | Why it matters |
|---|---|---|
| `../README.md` | Everyone | High-level backend overview and entry point |
| `./architecture.md` | Engineering leads, CTO, senior ICs | System structure, data flows, and major design decisions |
| `./api/README.md` | Frontend, backend, QA | API landscape, conventions, and endpoint map |
| `./security.md` | Engineering, security, leadership | Auth model, access boundaries, storage protection, and operational risks |
| `./operations.md` | Backend, DevOps, release owners | Environment setup, dependency expectations, release readiness, and runtime behavior |
| `./testing-guide.md` | Backend, QA | What is tested, what is mocked, and which checks gate delivery |

## API Module Docs

| Module | Detailed Doc |
|---|---|
| Authentication | `./api/auth.md` |
| Resume | `./api/resume.md` |
| Job Requests | `./api/job-request.md` |
| Analysis | `./api/analysis.md` |
| Admin / RBAC | `./api/admin-rbac.md` |

## Supporting Platform Docs

| Topic | Detailed Doc |
|---|---|
| Google Drive storage model | `./google-drive-integration.md` |
| Security and access model | `./security.md` |
| Operations and release guidance | `./operations.md` |
| Testing strategy | `./testing-guide.md` |

## Documentation Principles

This documentation set is intentionally aligned to the current implementation, not an idealized future API. Where the backend has quirks or transitional behavior, the docs call that out explicitly so product, QA, and frontend teams can make safe decisions.

That means the docs currently document:

- mixed response envelope shapes across modules
- both Drive-backed and legacy local resume handling in parts of the analysis flow
- current local-development CORS assumptions
- existing rate limit, file size, and validation constraints

## Scope of This Docs Set

The documentation aims to answer five classes of questions:

1. What business capability does the backend own?
2. What does each API endpoint accept, return, and enforce?
3. How do files, analyses, and identities flow through the system?
4. What infrastructure or secrets must exist in each environment?
5. What should engineering and QA verify before shipping changes?
