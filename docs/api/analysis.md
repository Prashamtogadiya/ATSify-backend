# Analysis API

Back to index: `./README.md`

Base path: `/api/v1/analysis`

## Purpose

The analysis module compares a stored resume against a saved job request, generates structured ATS-style feedback through an AI model, and stores every run as a historical snapshot.

## What the Analysis Produces

Each analysis record contains:

- `overallScore`
- `ATS`
- `toneAndStyle`
- `content`
- `structure`
- `skills`
- `extractedText`
- references to the source resume and job request

Each scored category includes:

- `score`
- `tips[]`

Each tip includes:

- `type`: `good` or `improve`
- `tip`
- optional `explanation`

## Analysis Generation Flow

```text
Client -> API -> MongoDB -> Google Drive -> OCR/PDF Tools -> Groq Model -> MongoDB -> Client

1. Client submits POST /analysis/analyze.
2. API loads resume and job request.
3. API downloads resume assets if needed.
4. OCR/PDF tools extract resume text.
5. Groq Model returns JSON analysis data.
6. API saves the analysis snapshot.
7. API returns the structured analysis response.
```

## Source Selection Order

The service chooses the best available resume source in this order:

1. Drive-backed page images
2. Legacy local page images
3. Drive-backed original PDF
4. Legacy local PDF path

This ordering favors OCR-compatible image inputs while maintaining backward compatibility with older resume records.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/analyze` | Generate and save a new analysis |
| `GET` | `/history` | Return recent analysis history for the current user |
| `GET` | `/job-request/:jobRequestId/latest` | Return the most recent analysis for a job request |
| `GET` | `/:analysisId` | Return one exact historical analysis record |

All analysis routes require authentication.

## Contract Summary

| Concern | Current behavior |
|---|---|
| Auth model | Bearer token required |
| Rate limiting | `POST /analyze` limited to 3 per minute per IP |
| Persistence model | Every analysis run is saved as a new record |
| History ordering | Newest first |
| Latest lookup | By `jobRequestId` and `createdAt desc` |
| Exact lookup | By `analysisId` in user scope |

## `POST /analyze`

Middleware chain:

1. `authenticate`
2. `analyzeRateLimiter`
3. `validate(analyzeResumeSchema)`

Request body:

```json
{
  "resumeId": "507f191e810c19729de860ea",
  "jobRequestId": "507f191e810c19729de860eb"
}
```

Rate limit policy:

- window: 1 minute
- max: 3 requests per IP

Success response:

```json
{
  "success": true,
  "message": "AI Resume Analysis Complete",
  "data": {
    "_id": "65f...",
    "userId": "65e...",
    "resumeId": "507f191e810c19729de860ea",
    "jobRequestId": "507f191e810c19729de860eb",
    "extractedText": "....",
    "overallScore": 82,
    "ATS": { "score": 80, "tips": [] },
    "toneAndStyle": { "score": 81, "tips": [] },
    "content": { "score": 85, "tips": [] },
    "structure": { "score": 79, "tips": [] },
    "skills": { "score": 86, "tips": [] }
  }
}
```

Common failures:

- `400` if request validation fails
- `401` if the bearer token is missing or invalid
- `429` if the rate limit is exceeded
- `500` if retrieval, extraction, or AI processing fails

## `GET /history`

Returns the current user's analysis records ordered by newest first.

Query parameters:

- `limit`: optional, clamped between `1` and `100`, default `20`

Population behavior:

- `jobRequestId` is populated with `companyName` and `jobTitle`
- `resumeId` is populated with `resumeName`

This endpoint powers an analysis history view and lets the frontend deep-link into exact previous runs.

## `GET /job-request/:jobRequestId/latest`

Returns the newest stored analysis for the current user and the specified job request.

Use this endpoint when the product wants:

- "show me the latest answer for this job request"

Not found response:

```json
{
  "success": false,
  "message": "No analysis found for this job request"
}
```

## `GET /:analysisId`

Returns a specific historical analysis record in user scope.

This is the correct endpoint when the product wants:

- "show exactly the analysis that was generated earlier"

Population behavior:

- `jobRequestId` includes `companyName` and `jobTitle`
- `resumeId` includes `resumeName`

## Retrieval Decision Model

```text
Need Analysis Result
    |
    v
Specific analysis id available?
    |Yes                     |No
    v                        v
GET /analysis/:analysisId   Need only the newest result?
                |Yes                           |No
                v                              v
        GET /analysis/job-request/:jobRequestId/latest   GET /analysis/history
```

## Prompting and AI Contract

The analysis service currently:

- uses the Groq model `llama-3.3-70b-versatile`
- sends resume text plus job description
- requests a strict JSON-only response
- sanitizes markdown fences before `JSON.parse`

This means the AI integration depends on the model returning machine-readable JSON consistently.

## Product and Audit Value

Storing every analysis run creates a useful audit trail:

- users can compare old versus new resume iterations
- PMs can reason about repeat usage
- engineering can debug extraction or scoring differences over time

## Response and Failure Matrix

| Endpoint | Success | Common failures |
|---|---|---|
| `POST /analyze` | `200` | `400`, `401`, `429`, `500` |
| `GET /history` | `200` | `401`, `500` |
| `GET /job-request/:jobRequestId/latest` | `200` | `401`, `404`, `500` |
| `GET /:analysisId` | `200` | `401`, `404`, `500` |

## QA Notes

Current integration coverage verifies:

- unauthenticated analyze calls are blocked
- validation failures return `400`
- valid requests return a structured analysis payload
