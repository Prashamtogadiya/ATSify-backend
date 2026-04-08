# ATSify Backend Testing Guide

## Testing Strategy
ATSify uses a layered testing model:
- unit tests for isolated logic
- integration tests for routes and middleware
- mocked external boundaries for Drive and AI services

## Testing Stack
- Vitest
- Supertest
- mongodb-memory-server
- cross-env

## Test Pyramid

```text
Unit tests
  |
  v
Fast, deterministic, isolated

Integration tests
  |
  v
Express routing + middleware
  |
  v
In-memory MongoDB

External boundaries
  |
  +--> mocked Google Drive service
  +--> mocked AI service
```

## Commands
Run from backend root:
- `npm test`
- `npm run test:watch`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:coverage`

## Folder Structure
```text
tests/
  helpers/
  setup/
  unit/
  integration/
```

## What to Mock
Mock the boundaries that are external, expensive, or unstable:
- Google Drive reads and writes
- AI provider calls
- OCR/PDF conversion if the route test does not need real processing

Keep real:
- authentication middleware
- validation middleware
- controller response shapes
- database persistence

## Drive Era Testing Guidance
Drive should not be called live in test runs.

Mock these functions:
- `ensureUserDriveFolder`
- `uploadBufferToDrive`
- `downloadDriveFileBuffer`
- `getDriveFileStream`

Why:
- avoids secret handling in CI
- avoids quota and network flakes
- keeps tests deterministic

## Critical Coverage Areas
| Area | What to verify |
|---|---|
| Resume upload | Success path, file validation, Drive failure path |
| Resume streaming | 401, 404, successful stream behavior |
| Analysis history | User scoping and ordering |
| Specific analysis lookup | Exact record returned when analysisId is provided |
| Latest analysis lookup | Latest record semantics per job request |
| RBAC | Admin-only access returns 403 for non-admin users |

## Example Integration Pattern
```ts
import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import app from "../../../src/app";
import { setupIntegrationSuite } from "../../setup/integration";

setupIntegrationSuite();

vi.mock("../../../src/services/googleDrive.service", () => ({
  ensureUserDriveFolder: vi.fn().mockResolvedValue("folder-1"),
  uploadBufferToDrive: vi.fn().mockResolvedValue({ id: "file-1" }),
  downloadDriveFileBuffer: vi.fn(),
  getDriveFileStream: vi.fn(),
}));

describe("Resume routes", () => {
  it("rejects unauthenticated access", async () => {
    const response = await request(app).get("/api/v1/resume");
    expect(response.status).toBe(401);
  });
});
```

## Release Gate
Before merging, run:
- `npm run test:integration`
- `npm test`
- `npm run build`

Also confirm the target environment has valid Drive credentials and a writable base folder.
