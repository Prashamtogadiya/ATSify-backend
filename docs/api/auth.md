# 🔐 Authentication API

[← Back to API Documentation](./README.md)

## Overview
The Authentication API handles user registration, login, token management, and logout functionality. All authentication uses JWT (JSON Web Tokens) with a dual-token system for enhanced security.

### Base Path
```
/api/v1/auth
```

---

## 🔄 Authentication Flow

```
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

---

## 📋 Endpoints

| HTTP Method | Endpoint | Description | Authentication |
|------------|----------|-------------|----------------|
| `POST` | `/signup` | Register new user | ❌ Not Required |
| `POST` | `/login` | User login | ❌ Not Required |
| `GET` | `/refresh` | Refresh access token | 🔒 Refresh Token |
| `POST` | `/logout` | User logout | ❌ Not Required |

---

## 1️⃣ Register User

Create a new user account in the system.

### Endpoint
```
POST /api/v1/auth/signup
```

### Authentication
❌ **Not Required**

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

### Field Validation

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | ✅ Yes | Min 2 characters |
| `email` | string | ✅ Yes | Valid email format, unique |
| `password` | string | ✅ Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "User created",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

#### 409 Conflict - Email Already Exists
```json
{
  "success": false,
  "message": "User already exists"
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

### JavaScript Example
```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
console.log(data.user);
```

---

## 2️⃣ Login User

Authenticate user and receive access and refresh tokens.

### Endpoint
```
POST /api/v1/auth/login
```

### Authentication
❌ **Not Required**

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

### Field Validation

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `email` | string | ✅ Yes | Valid email format |
| `password` | string | ✅ Yes | Min 8 characters |

### Success Response (200 OK)
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTg..."
}
```

### Response Cookies
```
refreshToken=<jwt_token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

### Token Details

| Token Type | Storage | Expiry | Usage |
|------------|---------|--------|-------|
| **accessToken** | Client (memory/state) | 15 minutes | Include in Authorization header |
| **refreshToken** | HttpOnly cookie | 7 days | Automatic cookie handling |

### Error Responses

#### 400 Bad Request - Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### 401 Unauthorized - Authentication Failed
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

### JavaScript Example
```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    email: 'john.doe@example.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
localStorage.setItem('accessToken', data.accessToken); // Store token
```

---

## 3️⃣ Refresh Access Token

Get a new access token using the refresh token when the current access token expires.

### Endpoint
```
GET /api/v1/auth/refresh
```

### Authentication
🔒 **Requires Refresh Token** (in cookie)

### Request Headers
```
Cookie: refreshToken=<refresh_token>
```

### Success Response (200 OK)
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTg..."
}
```

### Error Responses

#### 403 Forbidden - Invalid Refresh Token
```json
{
  "success": false,
  "message": "Invalid refresh token"
}
```

#### 401 Unauthorized - Missing Refresh Token
```json
{
  "success": false,
  "message": "Refresh token required"
}
```

### cURL Example
```bash
curl -X GET http://localhost:3000/api/v1/auth/refresh \
  -b cookies.txt
```

### JavaScript Example
```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/refresh', {
  method: 'GET',
  credentials: 'include' // Important for cookies
});

const data = await response.json();
localStorage.setItem('accessToken', data.accessToken);
```

### Auto-Refresh Pattern
```javascript
// Intercept 401 errors and auto-refresh
async function fetchWithAuth(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    }
  });

  // If unauthorized, try to refresh
  if (response.status === 401) {
    const refreshResponse = await fetch('/api/v1/auth/refresh', {
      credentials: 'include'
    });
    
    if (refreshResponse.ok) {
      const { accessToken } = await refreshResponse.json();
      localStorage.setItem('accessToken', accessToken);
      
      // Retry original request
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`
        }
      });
    }
  }

  return response;
}
```

---

## 4️⃣ Logout User

Invalidate tokens and clear user session.

### Endpoint
```
POST /api/v1/auth/logout
```

### Authentication
❌ **Not Required** (but clears cookies if present)

### Request Headers
```
(None required)
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Logout Successful"
}
```

### Response Cookies
The `refreshToken` cookie will be cleared:
```
refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -b cookies.txt
```

### JavaScript Example
```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/logout', {
  method: 'POST',
  credentials: 'include'
});

// Clear local storage
localStorage.removeItem('accessToken');

// Redirect to login
window.location.href = '/login';
```

---

## 🔒 Security Considerations

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Special characters recommended but not required

### Token Security

#### Access Token
- **Storage**: Store in memory or React state (preferred)
- **Lifetime**: Short-lived (15 minutes)
- **Exposure**: Sent in Authorization header
- **Vulnerability**: XSS attacks if stored in localStorage

#### Refresh Token
- **Storage**: HttpOnly cookie (cannot be accessed by JavaScript)
- **Lifetime**: Long-lived (7 days)
- **Exposure**: Automatically sent with requests
- **Vulnerability**: CSRF (mitigated by SameSite=Strict)

### Best Practices

1. **Never store refresh tokens in localStorage**
2. **Always use HTTPS in production**
3. **Implement rate limiting** on login attempts
4. **Use secure password hashing** (bcrypt with high cost factor)
5. **Validate tokens on every request**
6. **Implement token blacklisting** for logout
7. **Monitor failed login attempts**

---

## 🧪 Testing Scenarios

### Test Case 1: Successful Registration
```bash
# Register new user
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123456!"
  }'

# Expected: 201 Created with user object
```

### Test Case 2: Duplicate Email
```bash
# Try to register with same email
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another User",
    "email": "test@example.com",
    "password": "Test123456!"
  }'

# Expected: 409 Conflict
```

### Test Case 3: Login and Use Token
```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!"
  }' | jq -r '.accessToken' > token.txt

# Use token for protected route
curl -X GET http://localhost:3000/api/v1/resume \
  -H "Authorization: Bearer $(cat token.txt)" \
  -b cookies.txt
```

---

## 🐛 Common Issues

### Issue: "Invalid refresh token"
**Cause**: Refresh token expired or invalid  
**Solution**: User must login again

### Issue: "Access token required"
**Cause**: Missing Authorization header  
**Solution**: Include `Authorization: Bearer <token>` header

### Issue: "User already exists"
**Cause**: Email already registered  
**Solution**: Use different email or login with existing credentials

---

[← Back to API Documentation](./README.md) | [Next: Resume API →](./resume.md)