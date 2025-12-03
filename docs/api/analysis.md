# 🧠 Analysis API

[← Back to API Documentation](./README.md)

## Overview
The Analysis API provides AI-powered resume analysis by comparing resumes against job requirements using Google's Gemini AI model. It generates comprehensive insights including match scores, strengths, weaknesses, suggestions, and missing skills.

### Base Path
```
/api/v1/analysis
```

### Authentication
🔒 **All endpoints require authentication**

---

## 📋 Endpoints

| HTTP Method | Endpoint | Description | Processing Time |
|------------|----------|-------------|-----------------|
| `POST` | `/analyze` | Analyze resume vs job request | ~10-30 seconds |

---

## 🔄 Analysis Pipeline

```
┌─────────────┐
│ API Request │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Validate    │ ◄─── Check resumeId & jobRequestId
│ Input       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Fetch Resume│ ◄─── Get extractedText from DB
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Fetch Job   │ ◄─── Get job details from DB
│ Request     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Gemini AI   │ ◄─── Send to AI for analysis
│ Processing  │      (10-30 seconds)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Parse AI    │ ◄─── Extract structured data
│ Response    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Save to DB  │ ◄─── Store analysis results
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Return      │
│ Results     │
└─────────────┘
```

---

## 1️⃣ Analyze Resume Against Job

Run AI-powered analysis to evaluate resume-job compatibility.

### Endpoint
```
POST /api/v1/analysis/analyze
```

### Authentication
🔒 **Required** - Include access token in Authorization header

### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body
```json
{
  "resumeId": "507f1f77bcf86cd799439011",
  "jobRequestId": "507f1f77bcf86cd799439014"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resumeId` | string | ✅ Yes | MongoDB ObjectId of the resume to analyze |
| `jobRequestId` | string | ✅ Yes | MongoDB ObjectId of the job request |

### Processing Details

- **AI Model**: Google Gemini 1.5 Pro
- **Average Processing Time**: 10-30 seconds
- **Context Window**: Up to 1M tokens
- **Analysis Depth**: Comprehensive multi-factor evaluation

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "AI Resume Analysis Complete",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "userId": "507f1f77bcf86cd799439012",
    "resumeId": "507f1f77bcf86cd799439011",
    "jobRequestId": "507f1f77bcf86cd799439014",
    "matchScore": 78,
    "strengths": [
      "Strong technical foundation in Node.js and React with 5+ years of experience",
      "Demonstrated leadership experience managing development teams",
      "Proven track record with microservices architecture implementation",
      "Solid cloud deployment experience using AWS services",
      "Excellent problem-solving skills evidenced by project outcomes"
    ],
    "weaknesses": [
      "Limited recent experience with container orchestration (Kubernetes)",
      "No specific mention of CI/CD pipeline implementation<!-- filepath: c:\Users\PRASHAM\Desktop\ATSify\docs\api\analysis.md -->
# 🧠 Analysis API

[← Back to API Documentation](./README.md)

## Overview
The Analysis API provides AI-powered resume analysis by comparing resumes against job requirements using Google's Gemini AI model. It generates comprehensive insights including match scores, strengths, weaknesses, suggestions, and missing skills.

### Base Path
```
/api/v1/analysis
```

### Authentication
🔒 **All endpoints require authentication**

---

## 📋 Endpoints

| HTTP Method | Endpoint | Description | Processing Time |
|------------|----------|-------------|-----------------|
| `POST` | `/analyze` | Analyze resume vs job request | ~10-30 seconds |

---

## 🔄 Analysis Pipeline

```
┌─────────────┐
│ API Request │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Validate    │ ◄─── Check resumeId & jobRequestId
│ Input       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Fetch Resume│ ◄─── Get extractedText from DB
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Fetch Job   │ ◄─── Get job details from DB
│ Request     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Gemini AI   │ ◄─── Send to AI for analysis
│ Processing  │      (10-30 seconds)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Parse AI    │ ◄─── Extract structured data
│ Response    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Save to DB  │ ◄─── Store analysis results
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Return      │
│ Results     │
└─────────────┘
```