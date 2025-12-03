# 🚀 ATSify Backend API Documentation

## 📝 Overview
ATSify is an AI-powered Applicant Tracking System that helps users optimize their resumes for specific job postings. This API provides services for:

- **User Authentication**: Secure registration, login, and token management
- **Resume Management**: Upload, store, and retrieve resume documents
- **Job Request Management**: Create and manage job posting details
- **AI Analysis**: Get intelligent insights on resume-job fit with improvement suggestions

---

## 🌐 Base URL
```
Production: https://your-api-domain.com/api/v1
Development: http://localhost:3000/api/v1
```

---

## 🏗️ Architecture Overview
```
Client → API Routes → Controllers → Services → Database/AI
                ↓
          Middleware (Auth, Validation, Error Handling)
```

---

## 📚 API Documentation Index

### 🔐 [Authentication API](./auth.md)
User registration, login, token refresh, and logout functionality.
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `GET /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### 📄 [Resume API](./resume.md)
Resume upload, processing, and retrieval endpoints.
- `POST /resume/upload` - Upload resume file
- `GET /resume` - Get all user resumes
- `GET /resume/:id` - Get specific resume

### 💼 [Job Request API](./job-request.md)
Job posting management for analysis purposes.
- `POST /job-requests` - Create job request
- `GET /job-requests` - Get all user job requests

### 🧠 [Analysis API](./analysis.md)
AI-powered resume analysis against job requirements.
- `POST /analysis/analyze` - Analyze resume vs job request

---

## 🔑 Authentication Overview

### Authentication Flow
1. User registers or logs in to receive an `accessToken` (JWT)
2. Server sets an `httpOnly` cookie containing `refreshToken`
3. Client includes `accessToken` in the `Authorization` header for protected routes
4. When `accessToken` expires, use `/auth/refresh` endpoint to get a new one

### Token Details
- **Access Token**: Short-lived JWT (expires in 15 minutes)
- **Refresh Token**: Long-lived token stored in httpOnly cookie (expires in 7 days)
- **Header Format**: 
  ```
  Authorization: Bearer <access_token>
  ```

### Protected Routes
Most endpoints require authentication. Protected routes will show:
- 🔒 **Authentication Required** badge
- Returns `401 Unauthorized` if token is missing or invalid

---

## ⚠️ Global Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message"
    }
  ]
}
```

### HTTP Status Codes

| Status Code | Meaning | Common Causes |
|------------|---------|---------------|
| **400 Bad Request** | Invalid request data | Missing required fields, validation failed, invalid file format |
| **401 Unauthorized** | Authentication failed | Missing/invalid/expired access token |
| **403 Forbidden** | Access denied | Invalid refresh token, unauthorized resource access |
| **404 Not Found** | Resource doesn't exist | Invalid ID, resource deleted |
| **409 Conflict** | Resource conflict | Email already registered, duplicate entry |
| **413 Payload Too Large** | Request too large | File exceeds size limit (10MB) |
| **500 Internal Server Error** | Server error | Database failure, unexpected exception |
| **503 Service Unavailable** | Service down | AI service timeout, external API unavailable |

---

## 🔄 Complete User Flow Example

Here's a typical end-to-end workflow:

```bash
# 1. Register
POST /api/v1/auth/signup

# 2. Login (receive accessToken)
POST /api/v1/auth/login

# 3. Upload Resume
POST /api/v1/resume/upload

# 4. Create Job Request
POST /api/v1/job-requests

# 5. Analyze Resume
POST /api/v1/analysis/analyze

# 6. Logout
POST /api/v1/auth/logout
```

For detailed examples with request/response data, see individual API documentation pages.

---

## 📊 Data Models

### User Model
```typescript
{
  _id: ObjectId;
  name: string;
  email: string;          // Unique
  password: string;       // Hashed
  refreshToken : string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Resume Model
```typescript
{
  _id: ObjectId;
  userId: ObjectId;       // Reference to User
  originalPdfPath: string;
  imagesPaths: string;
  resumeName: string;
  createdAt: Date;
  uploadedAt: Date;
}
```

### JobRequest Model
```typescript
{
  _id: ObjectId;
  userId: ObjectId;       // Reference to User
  resumeId: ObjectId;     // Reference to Resume
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Analysis Model
```typescript
{
  _id: ObjectId;
  userId: ObjectId;       // Reference to User
  resumeId: ObjectId;     // Reference to Resume
  jobRequestId: ObjectId; // Reference to JobRequest
  extractedText: string;
  overallScore: number;     // 0-100
  ATS: string[];
  toneAndStyle: string[];
  content: string[];
  structure: string[];
  skills: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🛠️ Technical Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **File Processing**: Multer, pdf-parse, Tesseract OCR
- **AI Integration**: Groq API
- **Validation**: Zod schemas
- **Logging**: Winston

---

## 🔒 Security Best Practices

1. Always use HTTPS in production
2. Store access tokens securely (never in localStorage)
3. Refresh tokens are httpOnly cookies
4. Implement rate limiting on auth endpoints
5. Validate file types and sizes before upload
6. Sanitize user inputs before processing
7. Use environment variables for sensitive data

---

## 🧪 Testing the API

### Using cURL
```bash
# Set base URL
BASE_URL="http://localhost:3000/api/v1"

# Example: Login and save token
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt

# Use token in subsequent requests
curl -X GET $BASE_URL/resume \
  -H "Authorization: Bearer <token>" \
  -b cookies.txt
```

### Using Postman
1. Import the [Postman Collection](./postman_collection.json)
2. Set environment variables: `base_url`, `access_token`
3. Use collection variables for automatic token management

---

## 📞 Support & Resources

- **GitHub Repository**: [https://github.com/Prashamtogadiya/ATSify-backend)
- **Email Support**: prashamtogadiya@gmail.com

---

## 📝 Version History

### Version 1.0.0 (Current)
- Initial API release
- User authentication with JWT
- Resume upload and management
- Job request creation
- AI-powered resume analysis

---

**Last Updated:** December 2025  
**API Version:** 1.0.0  
**Maintained by:** ATSify Development Team