# Google Drive Integration

This document explains how ATSify uses Google Drive as a private binary storage layer for resumes and rendered page images.

## Why Google Drive Is Used

The backend needs durable file storage without making resume assets public. Google Drive currently serves as the file store while MongoDB keeps application metadata and ownership.

## Storage Design

```text
+---------------------------+
| Configured Base Folder    |
+---------------------------+
                  |
                  v
+---------------------------+
| Per-User Folder           |
+---------------------------+
    |            |          |
    v            v          v
Original PDF   Rendered   Rendered
                     Image 1    Image 2
                                  \
                                    v
                                Rendered
                                Image N
```

Folder behavior:

- one base folder is configured by `GOOGLE_DRIVE_BASE_FOLDER_ID`
- each user gets a child folder under that base folder
- the child folder name is derived from the email prefix before `@`

Example:

- `alex@example.com` becomes folder `alex`

## Integration Responsibilities

The Drive service currently does four things:

1. Create or find the user's Drive folder.
2. Upload PDF and image buffers.
3. Download file content as a buffer.
4. Stream file content directly to the API response.

## Backend-Only Access Pattern

```text
Browser -> API: Request authenticated resume asset
API -> API: Validate token and ownership
API -> Drive: Fetch file by stored Drive id
Drive -> API: File stream
API -> Browser: Streamed bytes

The browser never talks to Drive directly.
```

The browser does not receive:

- Google OAuth credentials
- raw Drive API tokens
- public Drive links as the primary access method

## Environment Variables

Required:

- `GOOGLE_DRIVE_CLIENT_ID`
- `GOOGLE_DRIVE_CLIENT_SECRET`
- `GOOGLE_DRIVE_REFRESH_TOKEN`
- `GOOGLE_DRIVE_BASE_FOLDER_ID`

Optional:

- `GOOGLE_DRIVE_REDIRECT_URI`

If no redirect URI is provided, the service defaults to:

- `https://developers.google.com/oauthplayground`

## File Upload Contract

When the backend uploads to Drive, it provides:

- file name
- MIME type
- file buffer
- parent folder id

The service returns:

- Drive file id
- stored name
- MIME type
- `webViewLink`
- `webContentLink`

ATSify stores the file ids in MongoDB and uses those ids for future retrieval.

## Retrieval Modes

| Mode | Used By | Result |
|---|---|---|
| Buffer download | Analysis pipeline | OCR / PDF text extraction |
| Stream retrieval | Resume API | PDF and image responses to frontend |

## Security Characteristics

- Drive credentials are read from environment variables on the backend only.
- Every resume file request is checked against application ownership before Drive is called.
- Stored file ids are application metadata, not public URLs.

## Operational Risks

| Risk | Impact |
|---|---|
| Invalid Drive OAuth credentials | Uploads and downloads fail |
| Missing base folder id | User folder resolution fails |
| Drive quota or API outage | Resume operations degrade |
| User email prefix collisions | Folder naming can become ambiguous operationally |

## Implementation Notes

- Folder names are sanitized to allow only alphanumeric characters, dots, underscores, and hyphens.
- File uploads use `supportsAllDrives: true`.
- File reads use `alt=media` to retrieve raw file contents.
- The integration uses a refresh-token based OAuth2 client.

## Suggested Future Hardening

1. Record stronger folder ownership metadata instead of relying only on email-prefix naming.
2. Add retry and backoff behavior for transient Drive failures.
3. Add periodic health checks or startup validation for critical Drive configuration.
4. Consider a storage abstraction so Drive can be replaced without changing route behavior.
