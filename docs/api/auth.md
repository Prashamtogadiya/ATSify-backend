# Authentication API

Back to index: `./README.md`

Base path: `/api/v1/auth`

## Purpose

The authentication module creates user accounts, issues session credentials, renews access tokens, and revokes refresh tokens. It is the entry point for both regular users and admins.

## Session Model

| Credential | Stored In | Lifetime | Used For |
|---|---|---|---|
| Access token | Frontend-managed bearer token | 15 minutes | Authenticated API calls |
| Refresh token | `httpOnly` cookie and MongoDB user record | 7 days | Access token renewal |

The access token payload contains:

- `id`
- `role`

## Auth Lifecycle

```text
Client        API              MongoDB
  | POST /signup ->             |
  |--------------------------->  |
  |                    Create user
  |                    Persist refresh token
  | <--- accessToken + refresh cookie

  | POST /login  ->             |
  |--------------------------->  |
  |                    Validate user
  |                    Replace refresh token
  | <--- accessToken + refresh cookie

  | GET /refresh  ->             |
  |--------------------------->  |
  |                    Find user by refresh token
  | <--- new accessToken        |

  | POST /logout  ->             |
  |--------------------------->  |
  |                    Clear stored refresh token
  | <--- cleared cookie + success response
```

## Endpoints

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/signup` | No | Create a new user and start a session |
| `POST` | `/login` | No | Validate credentials and start a session |
| `GET` | `/refresh` | Refresh cookie only | Renew access token |
| `POST` | `/logout` | No | Revoke refresh token and clear cookie |

## Contract Summary

| Concern | Current behavior |
|---|---|
| Access token TTL | 15 minutes |
| Refresh token TTL | 7 days |
| Refresh token storage | `httpOnly` cookie plus MongoDB user record |
| Role propagation | Included in access token payload |
| Refresh token revocation | Logout and admin role change |

## `POST /signup`

Creates a new user, generates access and refresh tokens, stores the refresh token on the user record, and sets the `refreshToken` cookie.

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongPassword123"
}
```

Validation rules:

- `name`: minimum 2 characters
- `email`: valid email, trimmed, lowercased
- `password`: minimum 6 characters

Success response:

```json
{
  "success": true,
  "message": "User created",
  "user": {
    "_id": "65f...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "createdAt": "2026-04-08T00:00:00.000Z",
    "updatedAt": "2026-04-08T00:00:00.000Z"
  },
  "accessToken": "<jwt>"
}
```

Common failures:

- `400` if the user already exists
- `400` if validation fails

## `POST /login`

Authenticates an existing user and issues a fresh access token plus refresh cookie.

Request body:

```json
{
  "email": "jane@example.com",
  "password": "StrongPassword123"
}
```

Success response:

```json
{
  "success": true,
  "accessToken": "<jwt>"
}
```

Common failures:

- `400` if the user does not exist
- `400` if the password is invalid

## `GET /refresh`

Reads the `refreshToken` cookie, verifies that it is both:

- cryptographically valid
- still present in the stored user record

Success response:

```json
{
  "success": true,
  "accessToken": "<jwt>"
}
```

Failure behavior:

- `401` with `No refresh token` when the cookie is absent
- `403` with invalid refresh messaging when the token is invalid, expired, or revoked

## `POST /logout`

Clears the refresh token from the database if present and clears the cookie in the response.

Success response:

```json
{
  "success": true,
  "message": "Logout Successful"
}
```

## Cookie Behavior

The refresh cookie is configured with:

- `httpOnly: true`
- `sameSite: strict`
- `path: /`
- `secure: true` only in production mode

## Security Notes

- Refresh tokens are not exposed to browser JavaScript.
- Role is embedded in the access token and is used by RBAC middleware.
- A refresh token is replaced on login and cleared on logout.
- Admin role changes also clear the stored refresh token so the user must re-authenticate.

## Response and Failure Matrix

| Endpoint | Success | Common failures |
|---|---|---|
| `POST /signup` | `201` | `400` validation failure, duplicate email |
| `POST /login` | `200` | `400` user not found, invalid credentials |
| `GET /refresh` | `200` | `401` no refresh token, `403` invalid refresh token |
| `POST /logout` | `200` | `500` unexpected logout failure |

## Example Protected Call Pattern

```text
User logs in
  |
  v
Frontend stores access token
  |
  v
Frontend calls protected endpoint with Bearer token
  |
  v
Access token valid?
  |Yes                     |No
  v                        v
Request succeeds      Frontend calls GET /auth/refresh
                    |
                    v
                Refresh cookie valid?
                |Yes                |No
                v                   v
          New access token returned   User must log in again
                |
                v
         Frontend retries protected call
```

## QA Notes

The integration tests currently verify:

- successful signup issues access token and refresh cookie
- duplicate signup is rejected
- login returns a new access token and cookie
- refresh without a cookie returns `401`
