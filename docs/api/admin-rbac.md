# Admin and RBAC API

Back to index: ./README.md

Base path: /api/v1/admin

## Purpose
Provide admin visibility into platform health and tightly control privileged actions.

## Authorization Rules
All admin routes require:
- authenticate middleware
- requireAdmin middleware

Only users with `role = admin` may access these routes.

## RBAC Enforcement Flow

```text
DECISION TREE

Incoming request
  |
  +-- authenticate()
        |
        +-- invalid token? -> 401 Unauthorized
        |
        +-- valid token -> requireAdmin()
               |
               +-- role != admin? -> 403 Forbidden
               |
               +-- role == admin -> controller -> service -> MongoDB
```

## Administrative Capabilities
| Capability | Description |
|---|---|
| Dashboard stats | Platform-wide totals and score aggregates |
| User listing | Paginated list with per-user activity counts |
| Role updates | Promote or demote a user between user and admin |

## GET /dashboard/stats
Returns:
- totalUsers
- totalAdmins
- totalAnalyses
- totalJobRequests
- totalResumes
- analysesLast7Days
- newUsersLast30Days
- averageOverallScore
- highestOverallScore

## GET /users
Returns a paginated operational user list.

Query params:
- page
- limit

Each record includes:
- profile data excluding password and refresh token
- analysisCount
- jobRequestCount
- resumeCount

## PATCH /users/:userId/role
Request body:
```json
{
  "role": "admin"
}
```

Allowed values:
- user
- admin

Operational effect:
- role is updated immediately
- refresh token is cleared so the user re-authenticates with the new privilege set

## Security Notes
- RBAC decisions are made server-side only
- Admin endpoints are not exposed as separate client-only protections
- Role changes should be treated as security-sensitive events
