# ATSify Architecture and Workflow

## Audience
This document is intended for engineering leads, product managers, architects, and CTO-level stakeholders.

## Platform Summary
ATSify is a browser-based resume analysis system with three core responsibilities:
- identity and access control
- private resume file orchestration
- AI-powered scoring and historical analysis tracking

Frontend and backend are separated. Binary resume assets are stored in Google Drive and only exposed through authenticated backend routes.

## Component Model

```text
			 +----------------------+
			 |      React UI        |
			 |    Redux / Axios     |
			 +----------+-----------+
					|
					v
			 +----------+-----------+
			 |     Express API      |
			 | Auth / Resume / AI   |
			 +----+----+----+-------+
				|    |    |
				v    v    v
			+-----+  +---+  +----------------+
			|DB   |  |GD |  | AI Provider    |
			|Mongo|  |Drv|  | (analysis)     |
			+-----+  +---+  +----------------+
```

| Layer | Responsibility |
|---|---|
| Client | Capture user intent and render protected data |
| API | Enforce access control and orchestrate workflows |
| Data | Persist metadata, ownership, and analysis history |
| Storage | Store binary resume assets privately |
| Intelligence | Score resumes against job descriptions |

## Resume Lifecycle

```text
PIPELINE SWIMLANE

CLIENT LANE:
  upload form submit -> POST /resume/upload

API LANE:
  validate token + payload -> memory buffer -> page render orchestration

STORAGE LANE:
  create/resolve user folder -> store PDF -> store page images

DATA LANE:
  commit resume metadata + Drive IDs -> return proxy URLs
```

## Analysis Lifecycle

```text
PROCESS CHAIN
[Start] analyze request
   -> load resume/job metadata
   -> load Drive assets
   -> extract normalized text
   -> execute AI scoring
   -> save analysis snapshot
   -> return score payload
```

## Retrieval Model

```text
CONTROLLED READ PATH
Client asks for proxy URL resource
  => backend auth check
  => ownership lookup
  => Drive fetch by fileId
  => stream response body
```

The browser never gets raw Drive credentials or a public Drive URL. It only receives backend proxy routes that are validated against user ownership before streaming.

## Design Decisions
| Decision | Reason |
|---|---|
| In-memory upload handling | Avoid unnecessary local file persistence before Drive upload |
| Backend file proxying | Preserve authorization control and hide Drive internals |
| User folder per email prefix | Makes Drive content operationally readable and organized |
| Analysis history persistence | Enables auditability and replay of earlier scoring runs |
| Specific-analysis lookup | Lets the UI render an exact historical result instead of latest-only semantics |

## Operational Requirements
- MongoDB must be reachable for all metadata operations
- Drive OAuth credentials must be configured for file orchestration
- AI service availability directly affects analysis latency
- backend auth secrets must remain server-side only

## Ownership Rules
- Users can only access their own resumes, job requests, and analyses
- Admins can access only admin routes, dashboard stats, and role management views
- File access is always mediated by the backend
