# Resume API

Back to index: `./README.md`

Base path: `/api/v1/resume`

## Purpose

The resume module accepts PDF uploads, converts them into storage-ready assets, stores the files in Google Drive, and exposes authenticated streaming endpoints for the frontend. MongoDB remains the source of truth for ownership and file lookup metadata.

## Why This Module Matters

- It protects resume files from public exposure.
- It gives the analysis pipeline stable file references.
- It lets the frontend retrieve previews and PDFs without direct Drive access.

## Resume Processing Flow

```text
Client        API            Temp Storage      Google Drive      MongoDB
  | POST /resume/upload ->       |                 |               |
  |-----------------------------> |                 |               |
  |                    Authenticate request        |               |
  |-----------------------------> |                 |               |
  |                          Write temp PDF        |               |
  |-----------------------------------------------> |               |
  |                                            Ensure user folder   |
  |---------------------------------------------------------------> |
  |                                            Upload original PDF   |
  |---------------------------------------------------------------> |
  |                          Convert PDF pages to images            |
  |-----------------------------------------------> |               |
  |                                            Upload page images   |
  |---------------------------------------------------------------> |
  |                          Save resume metadata + Drive IDs       |
  |---------------------------------------------------------------->| 
  | <------------------------- Resume metadata response ------------|
```

## Storage Model

```text
Authenticated User -> Resume Record

Resume Record contains:
  - resumeName
  - driveFolderId
  - originalPdfDriveFileId
  - imageDriveFileIds[]
```

## Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/upload` | Upload and process a resume PDF |
| `GET` | `/` | List resumes owned by the current user |
| `GET` | `/:id` | Return one resume and proxy URLs |
| `GET` | `/:id/pdf` | Stream the original PDF |
| `GET` | `/:id/images/:index` | Stream a rendered resume page image |

All resume routes require a bearer access token.

## Contract Summary

| Concern | Current behavior |
|---|---|
| Accepted content type | `application/pdf` only |
| Max upload size | 5 MB |
| Upload handling | In-memory via Multer |
| Binary storage | Google Drive |
| Metadata storage | MongoDB |
| Client file access | Backend proxy URLs only |

## `POST /upload`

Accepts:

- `multipart/form-data`
- file field name: `resume`

Behavior:

1. Verifies the user is authenticated.
2. Reads the uploaded PDF into memory.
3. Resolves or creates the user's Drive folder.
4. Uploads the original PDF to Drive.
5. Converts all pages to JPEG images.
6. Uploads each page image to Drive.
7. Persists a resume record in MongoDB.

Success response shape:

```json
{
  "message": "Resume uploaded and processed successfully",
  "resume": {
    "_id": "65f...",
    "userId": "65e...",
    "resumeName": "resume.pdf",
    "originalPdfDriveFileId": "drive-pdf-id",
    "imageDriveFileIds": ["drive-image-id-1", "drive-image-id-2"],
    "driveFolderId": "drive-folder-id",
    "createdAt": "2026-04-08T00:00:00.000Z",
    "updatedAt": "2026-04-08T00:00:00.000Z"
  }
}
```

Common failures:

- `401` if the user is not authenticated
- `400` if no file is uploaded
- `500` if PDF processing or Drive upload fails

## `GET /`

Returns all resumes belonging to the authenticated user, ordered by newest first.

Success response shape:

```json
{
  "resumes": [
    {
      "_id": "65f...",
      "resumeName": "resume.pdf"
    }
  ]
}
```

## `GET /:id`

Returns the resume metadata plus backend-controlled URLs that the frontend can use for file access.

Additional derived fields:

- `previewImageUrls`
- `pdfViewUrl`
- `pdfDownloadUrl`

Example response:

```json
{
  "resume": {
    "_id": "65f...",
    "resumeName": "resume.pdf",
    "previewImageUrls": [
      "http://localhost:3000/api/v1/resume/65f/images/0"
    ],
    "pdfViewUrl": "http://localhost:3000/api/v1/resume/65f/pdf",
    "pdfDownloadUrl": "http://localhost:3000/api/v1/resume/65f/pdf?download=1"
  }
}
```

If the resume is not owned by the current user, the endpoint returns `404`.

## `GET /:id/pdf`

Streams the original PDF from Google Drive after ownership validation.

Query parameters:

- `download=1` forces `Content-Disposition: attachment`

Default behavior:

- `Content-Type: application/pdf`
- `Content-Disposition: inline`

Possible failures:

- `401` if the user is not authenticated
- `404` if the PDF is not present for that resume in user scope
- `500` if Drive streaming fails

## `GET /:id/images/:index`

Streams a single rendered page image.

Rules:

- `index` is zero-based
- invalid negative or non-numeric indices return `400`
- missing image entries return `404`

## Response and Failure Matrix

| Endpoint | Success | Common failures |
|---|---|---|
| `POST /upload` | `201` | `401`, `400`, `500` |
| `GET /` | `200` | `401`, `500` |
| `GET /:id` | `200` | `401`, `404`, `500` |
| `GET /:id/pdf` | stream `200` | `401`, `404`, `500` |
| `GET /:id/images/:index` | stream `200` | `401`, `400`, `404`, `500` |

## Controlled File Access Pattern

```text
Frontend Requests File -> Authenticate Request -> Check Resume Ownership -> Resolve Stored Drive File Id -> Stream File Through Backend
```

## Ownership Model

The controller always scopes resume lookup by:

- `_id`
- `userId = req.userId`

That means a valid authenticated user still cannot fetch another user's resume metadata or stream another user's file.

## Operational Notes

- User Drive folders are created from the email prefix before `@`.
- Upload processing uses temporary OS storage during PDF conversion.
- Temp files are cleaned up after processing finishes.
- Existing legacy fields such as `originalPdfPath` and `imagesPaths` are still supported by the data model for migration compatibility.

## QA Notes

The current integration tests verify:

- unauthenticated list access is blocked
- authenticated upload succeeds
- list results are user-scoped
- detail lookup returns only the owner's resume
