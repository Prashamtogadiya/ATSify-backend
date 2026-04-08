# Job Request API

Back to index: ./README.md

Base path: /api/v1/job-requests

## Purpose
Persist job descriptions that the platform can compare against a specific resume. A job request is the analysis anchor that binds a user, a resume, and a job posting together.

## Lifecycle

```text
STATE TRANSITION VIEW

[Draft Input]
   |
   | submit
   v
[Request Received]
   |
   | validate payload + resume ownership
   v
[Validated]
   |
   | persist
   v
[Stored in MongoDB]
   |
   | respond
   v
[Job Request ID Returned]
```

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| POST | / | Create a job request |
| GET | / | List current user's job requests |
| GET | /:id | Get one job request by id |

## Create Job Request Contract
Request body:
```json
{
  "resumeId": "<resumeObjectId>",
  "companyName": "Acme Inc",
  "jobTitle": "Backend Engineer",
  "jobDescription": "Detailed role description"
}
```

Validation rules:
- resumeId is required and must belong to the user
- companyName is required
- jobTitle is required
- jobDescription is required and trimmed
- jobDescription must stay within schema limits

## Pagination Behavior
The list endpoint accepts:
- cursor
- limit

The backend clamps the limit to a safe range to avoid oversized requests.

Response shape:
```json
{
  "status": 200,
  "data": {
    "jobRequests": [],
    "pagination": {
      "nextCursor": null,
      "hasMore": false,
      "limit": 10
    }
  },
  "message": "Fetched User Job Requests"
}
```

## Ownership Rules
- The request is always tied to the authenticated user
- A user cannot attach someone else’s resume
- The detail endpoint only returns records in the current user scope

## Why This Matters
Job requests are the stable context used by analysis history, latest analysis lookup, and the UI’s resume comparison flow.
