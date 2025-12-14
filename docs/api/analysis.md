# 🧠 Analysis API

[← Back to API Documentation](./README.md)

## Overview
The Analysis API provides AI-powered resume analysis by comparing resumes against job requirements using Meta's llama-3.3-70b-versatile AI model. It generates comprehensive insights including match scores, strengths, weaknesses, suggestions, and missing skills.

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
| `POST` | `/analyze` | Analyze resume vs job request | ~3-5 seconds |

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

- **AI Model**: llama-3.3-70b-versatile
- **Average Processing Time**: 3-5 seconds
- **Context Window**: Up to 12k tokens / minutes
- **Analysis Depth**: Comprehensive multi-factor evaluation

### Success Response (200 OK)
```json
{
    "success": true,
    "message": "AI Resume Analysis Complete",
    "data": {
        "userId": "69170983146b7c0aaf8ea364",
        "resumeId": "69172b279009960bf9458f75",
        "jobRequestId": "69172bb42009960bf9458f77",
        "extractedText": "59 PRogde2ZEGmallcom 7 4918347133041) Gujarat nda Inkaedin\nETI TECHNICAL SKILLS\n* Languages: Java, JavaScript C, HTML, CSS\npling sore delop Seok) pyaar &. irre: MER Sack (MongeDB, Express.\nmy technical kills in a professional Reacts, Nodejs), Flutter\nSora ep sn « Database ergo sa serve\ndevelopment, and continuous learning.\nTE PROJECTS  Github\nEDUCATION\n+ To-Do List Application (JavaScript): A simple task management\nBachelor of Technology (B.Tech) in 10010 help users organize daily tasks.\nCoaiptte: Saisace 8 knglnesehg, + URL Shortener (MERN): A web application that shortens long URLS for\nDarshan University easier sharing,\n+ Quiz Web Application (MERN): A CRUD application allowing users\n2025. Present (Currently in 2ndyean) © rca wat ao sei dim estons ?\nCurrent CPI: 8.83 Matrimony App (Flutter): An application where users can add, edi,\nsearch,and favourite profiles.\n12TH - Passed with 60% . E-Commerce Website (Ongoing): Developing a ull featured e-\nDholakiya School commerce platform with functonslties such as product listing,\nshopping cart, and user authentication\n10TH - Passed with 7%\nDholakiya School ES Se 2\nBT —— PROFESSIONAL SKILLS\nACHIEVEMENT\n« Ranked in the top 19% on MW Sinlinl\nLeetCode contests with over © [ele Hotener\n235+ problems solved in Data © Apia Dr\nStructwres and Algorithms | goo oon\n(DSA). (Prasham1603) + Problem Solver\n+ Teaching Assistant for Data i i\nStructures in Semester 4.\n2 CANES Semester 4 HOBBIES\nLANGUAGES « Travelling\n+ Coding\ngE + Listening to music\n+ Hindi . Playing outdoor games\n+ Gujarat",
        "overallScore": 73,
        "ATS": {
            "score": 68,
            "tips": [
                {
                    "type": "improve",
                    "tip": "Keyword optimization",
                    "explanation": "Resume text lacks direct mentions of MERN, TS, AI, and LLM, which are crucial keywords from the job description."
                },
                {
                    "type": "good",
                    "tip": "Technical skills section",
                    "explanation": "The resume has a dedicated section for technical skills, making it easier for ATS to parse."
                },
                {
                    "type": "improve",
                    "tip": "Quantify experience",
                    "explanation": "Resume text does not quantify relevant experience in years or specific projects related to MERN, TS, AI, and LLM."
                }
            ]
        },
        "toneAndStyle": {
            "score": 60,
            "tips": [
                {
                    "type": "improve",
                    "tip": "Use a professional tone",
                    "explanation": "Some sections, like hobbies and languages, could be presented in a more formal manner."
                }
            ]
        },
        "content": {
            "score": 80,
            "tips": [
                {
                    "type": "good",
                    "tip": "Project inclusion",
                    "explanation": "The resume includes relevant projects that demonstrate technical skills."
                },
                {
                    "type": "improve",
                    "tip": "Add more detail to projects",
                    "explanation": "While projects are listed, adding more details about each project, such as technologies used and accomplishments, could strengthen the resume."
                }
            ]
        },
        "structure": {
            "score": 70,
            "tips": [
                {
                    "type": "improve",
                    "tip": "Reorganize sections for clarity",
                    "explanation": "Some sections, like education and skills, seem a bit disorganized and could be rearranged for better readability."
                }
            ]
        },
        "skills": {
            "score": 85,
            "tips": [
                {
                    "type": "good",
                    "tip": "Technical skills listed",
                    "explanation": "The resume lists relevant technical skills, such as Java, JavaScript, and React."
                },
                {
                    "type": "improve",
                    "tip": "Update with specialized skills",
                    "explanation": "Adding more specialized skills, especially those directly mentioned in the job description like AI and LLM, could increase the match score."
                }
            ]
        },
        "_id": "693eec2d874fdbc4d760225e",
        "createdAt": "2025-12-14T16:56:13.627Z",
        "updatedAt": "2025-12-14T16:56:13.627Z",
        "__v": 0
    }
}
```

### Response Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Unique identifier for the analysis record |
| `userId` | string | ID of the user who requested the analysis |
| `resumeId` | string | ID of the analyzed resume |
| `jobRequestId` | string | ID of the job request used for comparison |
| `matchScore` | number | Overall compatibility score (0-100) |
| `strengths` | string[] | List of candidate's strong points relative to job |
| `weaknesses` | string[] | Areas where candidate falls short |
| `suggestions` | string[] | Actionable recommendations for improvement |
| `missingSkills` | string[] | Key skills required but not found in resume |
| `createdAt` | string | ISO 8601 timestamp of analysis creation |
| `updatedAt` | string | ISO 8601 timestamp of last update |

### Error Responses

#### 400 Bad Request - Missing Fields
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": {
    "resumeId": "Resume ID is required",
    "jobRequestId": "Job Request ID is required"
  }
}
```

#### 400 Bad Request - Invalid ObjectId
```json
{
  "success": false,
  "message": "Invalid resumeId or jobRequestId format"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### 404 Not Found - Resume
```json
{
  "success": false,
  "message": "Resume not found"
}
```

#### 404 Not Found - Job Request
```json
{
  "success": false,
  "message": "Job request not found"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "You don't have permission to access this resume"
}
```

#### 500 Internal Server Error - AI Processing
```json
{
  "success": false,
  "message": "Failed to analyze resume with AI",
  "error": "AI service temporarily unavailable"
}
```

#### 500 Internal Server Error - Database
```json
{
  "success": false,
  "message": "Failed to save analysis results",
  "error": "Database error"
}
```

---

## 📝 Example Usage

### cURL
```bash
curl -X POST https://api.atsify.com/api/v1/analysis/analyze \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "resumeId": "507f1f77bcf86cd799439011",
    "jobRequestId": "507f1f77bcf86cd799439014"
  }'
```

### JavaScript (Fetch)
```javascript
const analyzeResume = async (resumeId, jobRequestId) => {
  try {
    const response = await fetch('https://api.atsify.com/api/v1/analysis/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeId,
        jobRequestId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Analysis complete:', data);
    return data;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
};

// Usage
analyzeResume('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439014');
```

### Python
```python
import requests

def analyze_resume(resume_id, job_request_id, access_token):
    url = 'https://api.atsify.com/api/v1/analysis/analyze'
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    payload = {
        'resumeId': resume_id,
        'jobRequestId': job_request_id
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Analysis failed: {e}')
        raise

# Usage
result = analyze_resume(
    '507f1f77bcf86cd799439011',
    '507f1f77bcf86cd799439014',
    'your_access_token_here'
)
print(f"Match Score: {result['data']['matchScore']}%")
```

---

## 🎯 Match Score Interpretation

| Score Range | Rating | Description |
|------------|--------|-------------|
| 90-100 | Excellent | Outstanding match, highly recommended candidate |
| 75-89 | Good | Strong match with minor gaps |
| 60-74 | Fair | Decent match, some skill gaps to address |
| 40-59 | Poor | Significant gaps, major improvements needed |
| 0-39 | Very Poor | Not a suitable match for this position |

---

## 📌 Notes & Best Practices

### ⚡ Performance Considerations
- **Processing Time**: Analysis typically takes 3-5 seconds due to AI processing
- **Rate Limiting**: Maximum 10 analyses per minute per user
- **Concurrent Requests**: Avoid submitting multiple analyses simultaneously
- **Timeout**: Request will timeout after 60 seconds

### 🔍 Quality Tips
- **Resume Quality**: Ensure resume has clear, extracted text for better analysis
- **Job Description**: Provide detailed job descriptions for more accurate matching
- **Re-analysis**: You can re-analyze the same resume-job pair for updated insights
- **Context**: AI analyzes both explicit skills and contextual experience

### 💾 Data Persistence
- Analysis results are permanently stored in the database
- Historical analyses can be retrieved via the Resumes API
- Each analysis is immutable once created
- Re-running analysis creates a new record

### 🔐 Security & Privacy
- Only the resume owner can request analysis
- Analysis results are private to the user
- Resume text is never stored in AI service logs
- All data transmission is encrypted (HTTPS)

### 🚨 Common Issues

**Issue**: Analysis returns low match score unexpectedly
- **Solution**: Verify resume extraction quality and completeness

**Issue**: Request times out
- **Solution**: Check resume and job description length 

**Issue**: Missing skills list is empty
- **Solution**: Job description may lack specific technical requirements

**Issue**: AI service unavailable
- **Solution**: Retry after a few seconds; check service status page

---

## 🔗 Related APIs

- [Resume API](./resumes.md) - Upload and manage resumes
- [Job Requests API](./job-requests.md) - Create and manage job requests
- [Authentication API](./auth.md) - Get access tokens

---

[← Back to API Documentation](./README.md)