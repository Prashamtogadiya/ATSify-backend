# Authentication API

Back to index: ./README.md

Base path: /api/v1/auth

## Purpose
Own the login session lifecycle for both browser users and admin users. The API uses short-lived access tokens plus long-lived refresh cookies so the frontend never needs to store raw credentials.

## Authentication Model
| Token | Location | Lifetime | Used For |
|---|---|---|---|
| Access token | Authorization header | 15 minutes | API authorization |
| Refresh token | httpOnly cookie | 7 days | Session renewal |

Access token payload includes:
- user id
- role

## Lifecycle Diagram

```text
┌─────────┐         ┌─────────┐         ┌──────────┐
│  Client │         │   API   │         │ Database │
└────┬────┘         └────┬────┘         └────┬─────┘
     │                   │                   │
     │  1. POST /signup  │                   │
     ├──────────────────>│                   │
     │                   │  Save User        │
     │                   ├──────────────────>│
     │                   │                   │
     │  2. POST /login   │                   │
     ├──────────────────>│                   │
     │                   │  Verify           │
     │                   ├──────────────────>│
     │  accessToken +    │                   │
     │  refreshToken     │                   │
     │<──────────────────┤                   │
     │                   │                   │
     │  3. Protected     │                   │
     │     Request       │                   │
     ├──────────────────>│  Verify JWT       │
     │  (with Bearer)    │                   │
     │                   │                   │
     │  4. GET /refresh  │                   │
     ├──────────────────>│  Verify Refresh   │
     │  (when expired)   │  Token            │
     │                   ├──────────────────>│
     │  New accessToken  │                   │
     │<──────────────────┤                   │
```

## Endpoints
| Method | Path | Description |
|---|---|---|
| POST | /signup | Register a new user |
| POST | /login | Authenticate and issue tokens |
| GET | /refresh | Renew access token using refresh cookie |
| POST | /logout | Revoke refresh token |

## POST /signup
Creates a user account.

Request:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongPassword123"
}
```

Response:
```json
{
  "success": true,
  "message": "User created",
  "user": {
    "_id": "...",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

## POST /login
Authenticates the user and returns an access token while setting the refresh cookie.

Request:
```json
{
  "email": "jane@example.com",
  "password": "StrongPassword123"
}
```

Response:
```json
{
  "success": true,
  "accessToken": "<jwt>"
}
```

## GET /refresh
Uses the refresh cookie to mint a new access token. If the cookie is missing, expired, or revoked, the client must sign in again.

## POST /logout
Revokes the stored refresh token and clears the session on the server side.

## Security Notes
- Access tokens are sent only over HTTPS in production
- Refresh tokens are never exposed to JavaScript
- The backend uses role claims for RBAC decisions

## Common Error States
- 400: validation failure or malformed payload
- 401: missing token, invalid token, or expired token
- 403: invalid refresh token or insufficient permission
