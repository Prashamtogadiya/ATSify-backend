# Resume API

Back to index: ./README.md

Base path: /api/v1/resume

## Purpose
Store resumes as private Drive assets while keeping MongoDB as the metadata source of truth.

## Architecture Summary

```text
[Stage 1] Intake
  Browser multipart upload

[Stage 2] Security Gate
  JWT validation + ownership resolution

[Stage 3] Binary Processing
  Memory buffer -> original PDF upload
               -> page render
               -> page image uploads

[Stage 4] Metadata Commit
  MongoDB stores resume + Drive file IDs

[Stage 5] Controlled Access
  Backend proxy endpoints stream PDF/images
```

## Folder Strategy
Drive hierarchy:
- one base folder configured by `GOOGLE_DRIVE_BASE_FOLDER_ID`
- one child folder per user
- child folder name = email prefix before `@`

Example:
- `test123@gmail.com` becomes folder `test123`

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| POST | /upload | Upload and process resume |
| GET | / | List current user's resumes |
| GET | /:id | Get resume metadata and proxy URLs |
| GET | /:id/pdf | Stream original PDF from Drive |
| GET | /:id/images/:index | Stream a rendered page image from Drive |

## POST /upload
Uploads a PDF, stores it in Drive, converts pages to images, stores those images in Drive, and saves metadata in MongoDB.

Request:
- multipart/form-data
- field name: `resume`

Response:
```json
{
  "message": "Resume uploaded and processed successfully",
  "resume": {
    "_id": "...",
    "resumeName": "resume.pdf",
    "originalPdfDriveFileId": "...",
    "imageDriveFileIds": ["..."],
    "driveFolderId": "...",
    "pdfDownloadUrl": "http://localhost:3000/api/v1/resume/.../pdf?download=1",
    "previewImageUrls": ["http://localhost:3000/api/v1/resume/.../images/0"]
  }
}
```

## GET /:id
Returns metadata plus backend proxy URLs. The frontend should use these URLs rather than raw Drive links.

## GET /:id/pdf
Streams the original PDF from Drive.
- default content disposition: inline
- `download=1` forces attachment download

```text
REQUEST LINEAR TRACE
Frontend GET /resume/:id/pdf?download=1
  => auth middleware
  => ownership check
  => Drive fetch by fileId
  => response stream (inline or attachment)
```

## GET /:id/images/:index
Streams a specific rendered page from Drive. The index is zero-based.

```text
REQUEST LINEAR TRACE
Frontend GET /resume/:id/images/:index
  => auth middleware
  => ownership check
  => Drive fetch by fileId
  => image byte stream
```

## Ownership Model
Every resume route validates that the record belongs to the authenticated user before any Drive I/O occurs.

## Failure Modes
- missing Drive credentials: upload and retrieval fail fast
- invalid or revoked refresh token: Drive calls fail and must be re-authorized
- ownership mismatch: backend returns 404 or unauthorized access response
