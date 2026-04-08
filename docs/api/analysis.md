# Analysis API

Back to index: ./README.md

Base path: /api/v1/analysis

## Purpose
Compute structured ATS feedback, store every run, and support both history browsing and latest-result retrieval.

## Analysis Lifecycle

```text
FLOW CIRCUIT
[Trigger] POST /analysis/analyze
   -> [Context Load] resume + job request from MongoDB
   -> [Asset Fetch] Drive download by fileId
   -> [Extraction] OCR/PDF text extraction
   -> [Intelligence] AI scoring pipeline
   -> [Persistence] save Analysis record
   -> [Response] structured analysis payload
```

## Analysis Lookup Model

```text
ENTRYPOINT DECISION MAP

Analysis History Page
  GET /analysis/history
      |
      +-- user selects one card --> GET /analysis/:analysisId

Job Request Detail Page
  [analysisId in URL?]
      | yes -> GET /analysis/:analysisId (exact historical run)
      | no  -> GET /analysis/job-request/:jobRequestId/latest
```

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| POST | /analyze | Generate a new analysis |
| GET | /history | List analysis runs for the authenticated user |
| GET | /job-request/:jobRequestId/latest | Return latest analysis for a job request |
| GET | /:analysisId | Return one specific saved analysis |

## POST /analyze
Request:
```json
{
  "resumeId": "...",
  "jobRequestId": "..."
}
```

The response contains:
- extractedText
- overallScore
- ATS
- toneAndStyle
- content
- structure
- skills

## GET /history
Returns analysis records ordered by newest first.

Population rules:
- `jobRequestId` includes companyName and jobTitle
- `resumeId` includes resumeName

This endpoint powers the Analysis History page and lets the UI link to a specific previous run.

## GET /job-request/:jobRequestId/latest
Returns the most recent analysis for that job request and current user. Use this when the product wants “latest result” semantics.

## GET /:analysisId
Returns the exact stored analysis record, subject to user ownership. Use this when the UI must show an old run exactly as it was saved.

## Data Rules
- History is user-scoped
- Old analyses remain valid even if newer analyses exist for the same job request
- Drive-backed resumes and legacy local-path resumes are both supported during migration

## Extraction Order
1. page images from Drive
2. legacy page images on disk
3. Drive PDF buffer
4. legacy local PDF path

That order prioritizes OCR-friendly inputs and preserves backward compatibility.
