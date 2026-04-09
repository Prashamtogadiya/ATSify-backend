# ATSify Backend Operations Guide

This guide describes how the backend should be configured, started, and validated in a real environment.

## Runtime Responsibilities

At runtime the backend is responsible for:

- accepting HTTP requests
- connecting to MongoDB
- issuing and validating JWT-based sessions
- uploading and retrieving files from Google Drive
- extracting text from resume inputs
- calling the analysis model

## Startup Sequence

```text
+-----------------------------+
| Load environment variables  |
+-----------------------------+
              |
              v
+-----------------------------+
| Connect to MongoDB          |
+-----------------------------+
              |
              v
+-----------------------------+
| Initialize Express app      |
+-----------------------------+
              |
              v
+-----------------------------+
| Expose API routes/middleware|
+-----------------------------+
              |
              v
+-----------------------------+
| Listen on configured port   |
+-----------------------------+
```

## Required Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | No | HTTP server port, defaults to `3000` |
| `NODE_ENV` | No | Environment mode, affects cookie security behavior |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Yes | Signing secret for access tokens |
| `JWT_REFRESH_SECRET` | Yes | Signing secret for refresh tokens |
| `SALT_ROUND` | Yes | Password hashing cost for bcrypt |
| `GOOGLE_DRIVE_CLIENT_ID` | Yes | Google OAuth client id |
| `GOOGLE_DRIVE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | Yes | Refresh token for Drive access |
| `GOOGLE_DRIVE_BASE_FOLDER_ID` | Yes | Parent Drive folder for user storage |
| `GOOGLE_DRIVE_REDIRECT_URI` | No | OAuth redirect URI override |

## Environment Expectations

The backend assumes the target environment has:

- network access to MongoDB
- valid Google Drive OAuth credentials
- permission to create child folders in the configured Drive base folder
- enough CPU and memory to perform PDF conversion, OCR, and JSON parsing in-process

## Local Development Defaults

Current implementation defaults worth knowing:

- API base path is `/api/v1`
- backend port defaults to `3000`
- CORS currently allows `http://localhost:5173`
- refresh cookie uses `secure: true` only when `NODE_ENV === "production"`

## External Dependency Map

| Dependency | Used For | Mandatory for startup? | Mandatory for all requests? |
|---|---|---|---|
| MongoDB | Core application persistence | Yes | Yes |
| Google Drive | Resume upload, stream, analysis source retrieval | No for process start, yes for resume-dependent features | No |
| Groq model | Analysis generation | No for process start, yes for analysis generation | No |
| OCR / PDF tooling | Resume text extraction | No for process start, yes for analysis generation | No |

## Deployment Readiness Checklist

Before calling an environment production-ready, confirm:

1. `npm run build` succeeds.
2. `npm test` succeeds.
3. MongoDB credentials connect successfully.
4. JWT secrets are present and environment-specific.
5. Google Drive credentials are valid.
6. The configured Drive base folder is accessible and writable.
7. Frontend origin configuration matches the deployed frontend.
8. Monitoring and log retention expectations are defined.

## Production Operational Risks

| Risk | Operational Impact |
|---|---|
| Synchronous PDF conversion and OCR | Slow or bursty requests may increase latency |
| AI provider instability | Analysis feature may degrade independently of the rest of the API |
| Drive outage or quota issues | Resume uploads and file retrieval may fail |
| Non-standardized API envelopes | Client integrations can drift if not tested carefully |

## Recommended Operational Improvements

For a stronger production deployment model, the next improvements should be:

1. Move resume processing and analysis into background jobs.
2. Add structured health checks for MongoDB and key integrations.
3. Externalize CORS and environment-specific frontend origins.
4. Standardize logging around uploads, analysis generation, and admin events.
5. Add explicit alerting for Drive and analysis-provider failures.
