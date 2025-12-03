# 💼 Job Request API

[← Back to API Documentation](./README.md)

## Overview
The Job Request API manages job posting details for AI analysis. Users create job requests by providing company information, job titles, and detailed job descriptions that will be compared against their resumes.

### Base Path
```
/api/v1/job-requests
```

### Authentication
🔒 **All endpoints require authentication**

---

## 📋 Endpoints

| HTTP Method | Endpoint | Description |
|------------|----------|-------------|
| `POST` | `/` | Create new job request |
| `GET` | `/` | Get all user job requests |

---

## 🔄 Job Request Workflow

```
┌─────────────────┐
│ User has Resume │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Find Job Posting│ ◄─── Company website, job board
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Job      │ ◄─── POST /job-requests
│ Request         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Analyze Resume  │ ◄─── POST /analysis/analyze
│ vs Job Request  │
└─────────────────┘
```

---

## 1️⃣ Create Job Request

Create a new job request by providing job details for analysis.

### Endpoint
```
POST /api/v1/job-requests
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
  "companyName": "TechCorp Inc.",
  "jobTitle": "Senior Software Engineer",
  "jobDescription": "We are looking for an experienced Senior Software Engineer to join our growing team. The ideal candidate will have 5+ years of experience in full-stack development.\n\nResponsibilities:\n- Design and develop scalable microservices\n- Lead technical discussions and code reviews\n- Mentor junior developers\n- Collaborate with product and design teams\n\nRequirements:\n- 5+ years of professional software development experience\n- Strong proficiency in Node.js and React\n- Experience with AWS cloud services\n- Knowledge of MongoDB and PostgreSQL\n- Excellent problem-solving skills\n- Strong communication abilities\n\nNice to Have:\n- Experience with Kubernetes and Docker\n- Knowledge of CI/CD pipelines\n- Open source contributions\n- Tech blog or speaking experience"
}
```

### Field Descriptions

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `resumeId` | string | ✅ Yes | ID of resume to analyze against | Valid MongoDB ObjectId, must exist and belong to user |
| `companyName` | string | ✅ Yes | Name of hiring company | Min 2 characters |
| `jobTitle` | string | ✅ Yes | Position title | Min 3 characters |
| `jobDescription` | string | ✅ Yes | Full job description including requirements | Min 50 characters |

### Job Description Best Practices

Include the following sections for better analysis:

1. **Company Overview** (optional but helpful)
2. **Role Summary**
3. **Key Responsibilities**
4. **Required Qualifications**
5. **Preferred Skills**
6. **Benefits** (optional)

**Example Structure:**
```
About [Company]:
Brief company description...

Role:
What you'll be doing...

Responsibilities:
- Bullet point 1
- Bullet point 2

Requirements:
- 5+ years experience
- Specific skills

Nice to Have:
- Additional skills
- Certifications
```

### Success Response (201 Created)
```json
{
  "status": 201,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439012",
    "resumeId": "507f1f77bcf86cd799439011",
    "companyName": "TechCorp Inc.",
    "jobTitle": "Senior Software Engineer",
    "jobDescription": "We are looking for an experienced Senior Software Engineer...",
    "createdAt": "2024-12-03T11:00:00.000Z",
    "updatedAt": "2024-12-03T11:00:00.000Z"
  },
  "message": "Job Request created successfully"
}
```

### JobRequest Object Schema
```typescript
{
  _id: string;              // MongoDB ObjectId
  userId: string;           // Reference to authenticated user
  resumeId: string;         // Reference to Resume model
  companyName: string;      // Hiring company name
  jobTitle: string;         // Position title
  jobDescription: string;   // Full job description
  createdAt: Date;          // Creation timestamp
  updatedAt: Date;          // Last update timestamp
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "jobDescription",
      "message": "Job description must be at least 50 characters"
    }
  ]
}
```

#### 400 Bad Request - Missing Fields
```json
{
  "status": 400,
  "message": "All fields are required"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### 404 Not Found - Resume Not Found
```json
{
  "status": 404,
  "message": "Resume not found"
}
```

#### 403 Forbidden - Resume Access Denied
```json
{
  "status": 403,
  "message": "You don't have access to this resume"
}
```

#### 500 Internal Server Error
```json
{
  "status": 500,
  "message": "Failed to create job request"
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/v1/job-requests \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "resumeId": "507f1f77bcf86cd799439011",
    "companyName": "TechCorp Inc.",
    "jobTitle": "Senior Software Engineer",
    "jobDescription": "We are looking for an experienced Senior Software Engineer to join our team. Requirements include 5+ years experience with Node.js, React, and AWS. You will lead technical discussions, mentor junior developers, and build scalable microservices."
  }'
```

### JavaScript Example
```javascript
const jobRequest = {
  resumeId: '507f1f77bcf86cd799439011',
  companyName: 'TechCorp Inc.',
  jobTitle: 'Senior Software Engineer',
  jobDescription: `
We are looking for an experienced Senior Software Engineer...

Responsibilities:
- Design scalable systems
- Lead code reviews
- Mentor team members

Requirements:
- 5+ years experience
- Node.js, React
- AWS cloud services
  `.trim()
};

const response = await fetch('http://localhost:3000/api/v1/job-requests', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(jobRequest)
});

const data = await response.json();
console.log('Job Request ID:', data.data._id);
```

### React Form Example
```jsx
import { useState } from 'react';

function CreateJobRequest({ resumeId }) {
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    jobDescription: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/v1/job-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeId,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Job request created! ID: ' + data.data._id);
        // Navigate to analysis page
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to create job request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Company Name"
        value={formData.companyName}
        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
        required
        minLength={2}
      />
      
      <input
        type="text"
        placeholder="Job Title"
        value={formData.jobTitle}
        onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
        required
        minLength={3}
      />
      
      <textarea
        placeholder="Paste full job description here..."
        value={formData.jobDescription}
        onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
        required
        minLength={50}
        rows={15}
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Job Request'}
      </button>
    </form>
  );
}
```

---

## 2️⃣ Get All Job Requests

Retrieve all job requests created by the authenticated user.

### Endpoint
```
GET /api/v1/job-requests
```

### Authentication
🔒 **Required** - Include access token in Authorization header

### Request Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
None

### Success Response (200 OK)
```json
{
  "status": 200,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439012",
      "resumeId": "507f1f77bcf86cd799439011",
      "companyName": "TechCorp Inc.",
      "jobTitle": "Senior Software Engineer",
      "jobDescription": "We are looking for an experienced software engineer...",
      "createdAt": "2024-12-01T11:00:00.000Z",
      "updatedAt": "2024-12-01T11:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "userId": "507f1f77bcf86cd799439012",
      "resumeId": "507f1f77bcf86cd799439011",
      "companyName": "StartupXYZ",
      "jobTitle": "Full Stack Developer",
      "jobDescription": "Join our innovative team as a Full Stack Developer...",
      "createdAt": "2024-12-02T09:30:00.000Z",
      "updatedAt": "2024-12-02T09:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439016",
      "userId": "507f1f77bcf86cd799439012",
      "resumeId": "507f1f77bcf86cd799439013",
      "companyName": "Google",
      "jobTitle": "Software Engineer III",
      "jobDescription": "Google is seeking a Software Engineer III...",
      "createdAt": "2024-12-03T14:15:00.000Z",
      "updatedAt": "2024-12-03T14:15:00.000Z"
    }
  ],
  "message": "Fetched User Job Requests"
}
```

### Empty Response (200 OK)
```json
{
  "status": 200,
  "data": [],
  "message": "Fetched User Job Requests"
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### 500 Internal Server Error
```json
{
  "status": 500,
  "message": "Failed to fetch job requests"
}
```

### cURL Example
```bash
curl -X GET http://localhost:3000/api/v1/job-requests \
  -H "Authorization: Bearer <access_token>"
```

### JavaScript Example
```javascript
const response = await fetch('http://localhost:3000/api/v1/job-requests', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const result = await response.json();

console.log(`Total job requests: ${result.data.length}`);

result.data.forEach(job => {
  console.log(`${job.companyName} - ${job.jobTitle}`);
  console.log(`Created: ${new Date(job.createdAt).toLocaleDateString()}`);
});
```

### React Component Example
```jsx
import { useEffect, useState } from 'react';

function JobRequestsList() {
  const [jobRequests, setJobRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobRequests();
  }, []);

  const fetchJobRequests = async () => {
    try {
      const response = await fetch('/api/v1/job-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const result = await response.json();
      setJobRequests(result.data);
    } catch (error) {
      console.error('Failed to fetch job requests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="job-requests-list">
      <h2>My Job Requests ({jobRequests.length})</h2>
      
      {jobRequests.length === 0 ? (
        <p>No job requests yet. Create one to start analyzing!</p>
      ) : (
        <ul>
          {jobRequests.map(job => (
            <li key={job._id}>
              <h3>{job.jobTitle}</h3>
              <p>{job.companyName}</p>
              <small>{new Date(job.createdAt).toLocaleDateString()}</small>
              <button onClick={() => analyzeJob(job._id)}>
                Analyze
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 📊 Usage Patterns

### Pattern 1: Quick Job Analysis
```javascript
// 1. Upload resume
const { resume } = await uploadResume(file);

// 2. Create job request immediately
const { data: jobRequest } = await createJobRequest({
  resumeId: resume._id,
  companyName: 'Google',
  jobTitle: 'Software Engineer',
  jobDescription: jobDescriptionText
});

// 3. Run analysis
const analysis = await analyzeResume(resume._id, jobRequest._id);
```

### Pattern 2: Multiple Job Applications
```javascript
// Upload resume once
const { resume } = await uploadResume(file);

// Create multiple job requests
const jobs = [
  { company: 'Google', title: 'SWE', description: '...' },
  { company: 'Microsoft', title: 'SDE', description: '...' },
  { company: 'Amazon', title: 'Software Engineer', description: '...' }
];

for (const job of jobs) {
  await createJobRequest({
    resumeId: resume._id,
    companyName: job.company,
    jobTitle: job.title,
    jobDescription: job.description
  });
}

// Get all job requests
const { data: jobRequests } = await getAllJobRequests();
```

### Pattern 3: Resume Version Comparison
```javascript
// Upload different resume versions
const resumeV1 = await uploadResume(generalResume);
const resumeV2 = await uploadResume(tailoredResume);

// Create job request
const jobRequest = await createJobRequest({
  resumeId: resumeV1._id,
  companyName: 'TechCorp',
  jobTitle: 'Senior Engineer',
  jobDescription: '...'
});

// Compare both resumes against same job
const analysisV1 = await analyzeResume(resumeV1._id, jobRequest._id);
const analysisV2 = await analyzeResume(resumeV2._id, jobRequest._id);

console.log('General Resume Score:', analysisV1.matchScore);
console.log('Tailored Resume Score:', analysisV2.matchScore);
```

---

## 💡 Tips for Better Job Descriptions

### ✅ DO Include:
- Complete requirements list
- Detailed responsibilities
- Required years of experience
- Specific technologies and tools
- Team structure information
- Company culture details

### ❌ DON'T Include:
- Salary information (won't affect analysis)
- Application instructions
- Company legal disclaimers
- Duplicate information
- Irrelevant details

### Example: Good Job Description
```
Senior Backend Engineer

We're seeking an experienced Backend Engineer to build scalable APIs.

Responsibilities:
- Design and implement RESTful APIs
- Optimize database queries
- Lead architecture decisions
- Mentor junior developers

Requirements:
- 5+ years backend development
- Expert in Node.js and TypeScript
- Strong SQL and NoSQL experience
- Microservices architecture
- AWS or GCP experience

Nice to Have:
- Kubernetes/Docker
- GraphQL
- System design experience
```

---

## 🐛 Common Issues

### Issue: "Resume not found"
**Cause**: Invalid or non-existent resumeId

**Solution**: 
```javascript
// Verify resume exists first
const { resumes } = await getAllResumes();
const validResumeId = resumes[0]._id;
```

### Issue: "Validation failed - jobDescription too short"
**Cause**: Job description less than 50 characters

**Solution**: Ensure full job description is included, not just title

### Issue: Analysis not comprehensive
**Cause**: Vague or incomplete job description

**Solution**: Include detailed requirements, responsibilities, and qualifications

---

## 🧪 Testing Checklist

- [ ] Create job request with valid resume ID
- [ ] Create job request with minimal description (50 chars)
- [ ] Create job request with comprehensive description
- [ ] Try invalid resume ID
- [ ] Try accessing another user's resume
- [ ] Get all job requests for user
- [ ] Verify createdAt/updatedAt timestamps
- [ ] Test special characters in description
- [ ] Test very long job descriptions
- [ ] Create multiple job requests for same resume

---

[← Previous: Resume API](./resume.md) | [Next: Analysis API →](./analysis.md)