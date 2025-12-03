# 📄 Resume API

[← Back to API Documentation](./README.md)

## Overview
The Resume API handles resume file uploads, text extraction, and retrieval. It supports PDF and Word document formats with automatic OCR processing for scanned documents.

### Base Path
```
/api/v1/resume
```

### Authentication
🔒 **All endpoints require authentication**

---

## 📋 Endpoints

| HTTP Method | Endpoint | Description | File Upload |
|------------|----------|-------------|-------------|
| `POST` | `/upload` | Upload and process resume | ✅ Required |
| `GET` | `/` | Get all user resumes | ❌ No |
| `GET` | `/:id` | Get specific resume | ❌ No |

---

## 🔄 Resume Processing Pipeline

```
┌──────────────┐
│ File Upload  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Validation   │ ◄─── File type, size checks
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Save to Disk │ ◄─── /uploads/pdfs/
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Text Extract │ ◄─── pdf-parse
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ OCR Process  │ ◄─── Tesseract (if needed)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Save to DB   │ ◄─── MongoDB
└──────────────┘
```

---

## 1️⃣ Upload Resume

Upload a resume file for processing and storage.

### Endpoint
```
POST /api/v1/resume/upload
```

### Authentication
🔒 **Required** - Include access token in Authorization header

### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

### Request Body (Form Data)
```
resume: <file>
```

### File Requirements

| Property | Value |
|----------|-------|
| **Field Name** | `resume` |
| **Accepted Formats** | `.pdf`, `.doc`, `.docx` |
| **Max File Size** | 10 MB |
| **Encoding** | UTF-8 recommended |

### Supported File Formats

#### ✅ Fully Supported
- **PDF**: Text-based and scanned (with OCR)
- **Microsoft Word**: .doc, .docx

#### ⚠️ Limitations
- Scanned PDFs may have reduced accuracy
- Complex formatting might be lost during text extraction
- Images and graphics are not processed

### Success Response (201 Created)
```json
{
  "message": "Resume uploaded and processed successfully",
  "resume": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "fileName": "john_doe_resume.pdf",
    "fileUrl": "/uploads/pdfs/1702896000000-john_doe_resume.pdf",
    "extractedText": "John Doe\nSoftware Engineer\n\nEXPERIENCE\nSenior Developer at TechCorp (2020-Present)\n- Led team of 5 developers\n- Implemented microservices architecture\n...",
    "uploadedAt": "2024-12-03T10:30:00.000Z"
  }
}
```

### Resume Object Schema
```typescript
{
  _id: string;              // MongoDB ObjectId
  userId: string;           // Reference to authenticated user
  fileName: string;         // Original uploaded filename
  fileUrl: string;          // Server path to stored file
  extractedText: string;    // Full text content extracted from resume
  uploadedAt: Date;         // Upload timestamp
}
```

### Error Responses

#### 400 Bad Request - No File Uploaded
```json
{
  "success": false,
  "message": "No resume file uploaded"
}
```

#### 400 Bad Request - Invalid File Format
```json
{
  "success": false,
  "message": "Only PDF and Word documents are allowed"
}
```

#### 401 Unauthorized - Missing Token
```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### 413 Payload Too Large
```json
{
  "success": false,
  "message": "File size exceeds 10MB limit"
}
```

#### 500 Internal Server Error - Processing Failed
```json
{
  "success": false,
  "message": "Failed to process resume",
  "error": "Text extraction failed"
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/v1/resume/upload \
  -H "Authorization: Bearer <access_token>" \
  -F "resume=@/path/to/resume.pdf"
```

### JavaScript Example (with Fetch)
```javascript
const formData = new FormData();
formData.append('resume', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/v1/resume/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});

const data = await response.json();
console.log('Uploaded:', data.resume);
```

### React Example
```jsx
import { useState } from 'react';

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch('/api/v1/resume/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Resume uploaded successfully!');
        console.log('Resume ID:', data.resume._id);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input 
        type="file" 
        accept=".pdf,.doc,.docx"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type="submit" disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload Resume'}
      </button>
    </form>
  );
}
```

---

## 2️⃣ Get All User Resumes

Retrieve all resumes uploaded by the authenticated user.

### Endpoint
```
GET /api/v1/resume
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
  "resumes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "fileName": "john_doe_resume_v1.pdf",
      "fileUrl": "/uploads/pdfs/1702896000000-john_doe_resume_v1.pdf",
      "extractedText": "John Doe\nSoftware Engineer...",
      "uploadedAt": "2024-12-01T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439012",
      "fileName": "john_doe_resume_v2.pdf",
      "fileUrl": "/uploads/pdfs/1702982400000-john_doe_resume_v2.pdf",
      "extractedText": "John Doe\nSenior Software Engineer...",
      "uploadedAt": "2024-12-02T14:20:00.000Z"
    }
  ]
}
```

### Empty Response (200 OK)
```json
{
  "resumes": []
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
  "success": false,
  "message": "Failed to fetch resumes"
}
```

### cURL Example
```bash
curl -X GET http://localhost:3000/api/v1/resume \
  -H "Authorization: Bearer <access_token>"
```

### JavaScript Example
```javascript
const response = await fetch('http://localhost:3000/api/v1/resume', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const data = await response.json();
console.log('Total resumes:', data.resumes.length);
data.resumes.forEach(resume => {
  console.log(`${resume.fileName} - ${resume.uploadedAt}`);
});
```

---

## 3️⃣ Get Resume by ID

Retrieve a specific resume by its unique identifier.

### Endpoint
```
GET /api/v1/resume/:id
```

### Authentication
🔒 **Required** - Include access token in Authorization header

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ✅ Yes | MongoDB ObjectId of the resume |

### Request Headers
```
Authorization: Bearer <access_token>
```

### Success Response (200 OK)
```json
{
  "resume": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "fileName": "john_doe_resume.pdf",
    "fileUrl": "/uploads/pdfs/1702896000000-john_doe_resume.pdf",
    "extractedText": "John Doe\nSoftware Engineer\n\nEXPERIENCE\nSenior Developer at TechCorp (2020-Present)\n- Led team of 5 developers\n- Implemented microservices architecture\n\nSKILLS\n- JavaScript, TypeScript, Node.js\n- React, Angular\n- MongoDB, PostgreSQL\n- AWS, Docker, Kubernetes",
    "uploadedAt": "2024-12-01T10:30:00.000Z"
  }
}
```

### Error Responses

#### 400 Bad Request - Invalid ID Format
```json
{
  "success": false,
  "message": "Invalid resume ID format"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### 403 Forbidden - Not Authorized
```json
{
  "success": false,
  "message": "You don't have access to this resume"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Resume not found"
}
```

### cURL Example
```bash
curl -X GET http://localhost:3000/api/v1/resume/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer <access_token>"
```

### JavaScript Example
```javascript
const resumeId = '507f1f77bcf86cd799439011';

const response = await fetch(`http://localhost:3000/api/v1/resume/${resumeId}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

if (response.ok) {
  const data = await response.json();
  console.log('Resume:', data.resume.fileName);
  console.log('Text length:', data.resume.extractedText.length);
} else if (response.status === 404) {
  console.log('Resume not found');
} else if (response.status === 403) {
  console.log('Access denied');
}
```

---

## 🛠️ Text Extraction Details

### Extraction Methods

#### 1. PDF Text Extraction
```
pdf-parse library → extractedText
```
- Extracts embedded text from PDF documents
- Preserves basic formatting
- Fast processing for text-based PDFs

#### 2. OCR Processing (Scanned Documents)
```
pdf-poppler → Convert to images
       ↓
Tesseract OCR → extractedText
```
- Automatically triggered for scanned PDFs
- Slower processing time
- May have reduced accuracy

### Extracted Text Format

The `extractedText` field contains:
- **Headings and sections** (EXPERIENCE, EDUCATION, SKILLS)
- **Contact information**
- **Work history** with dates and descriptions
- **Educational background**
- **Skills and technologies**
- **Certifications**

Example structure:
```
John Doe
john.doe@example.com | (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years...

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2020 - Present
- Led development of microservices architecture
- Managed team of 5 developers
...
```

---

## 📊 Usage Patterns

### Pattern 1: Single Resume Upload
```javascript
// Upload resume
const uploadResponse = await uploadResume(file);
const resumeId = uploadResponse.resume._id;

// Use immediately for analysis
const analysisResponse = await analyzeResume(resumeId, jobRequestId);
```

### Pattern 2: Multiple Resume Management
```javascript
// Get all resumes
const { resumes } = await getAllResumes();

// Let user select which resume to use
const selectedResume = resumes.find(r => r.fileName === userSelection);

// Create job request with selected resume
await createJobRequest({
  resumeId: selectedResume._id,
  companyName: 'TechCorp',
  jobTitle: 'Software Engineer',
  jobDescription: '...'
});
```

### Pattern 3: Resume Version Control
```javascript
// Upload new version
const newVersion = await uploadResume(updatedFile);

// Compare with previous versions
const allVersions = await getAllResumes();
const sortedByDate = allVersions.sort((a, b) => 
  new Date(b.uploadedAt) - new Date(a.uploadedAt)
);

console.log('Latest version:', sortedByDate[0].fileName);
```

---

## 🐛 Common Issues

### Issue: "Text extraction failed"
**Causes**:
- Corrupted PDF file
- Password-protected document
- Unsupported PDF version

**Solutions**:
- Re-save PDF using a different tool
- Remove password protection
- Convert to standard PDF format

### Issue: "File size exceeds limit"
**Cause**: File larger than 10MB

**Solutions**:
- Compress PDF using online tools
- Reduce image quality in document
- Remove unnecessary pages

### Issue: "Poor OCR accuracy"
**Causes**:
- Low-resolution scan
- Poor image quality
- Handwritten content

**Solutions**:
- Re-scan at higher resolution (300 DPI minimum)
- Use text-based PDF instead of scanned image
- Clean up document before scanning

---

## 🧪 Testing Checklist

- [ ] Upload PDF resume successfully
- [ ] Upload Word document successfully
- [ ] Verify text extraction accuracy
- [ ] Test file size limit (> 10MB)
- [ ] Test invalid file format (.txt, .jpg)
- [ ] Get all resumes for user
- [ ] Get specific resume by ID
- [ ] Verify authorization (access other user's resume)
- [ ] Test with scanned PDF (OCR)
- [ ] Handle multiple file uploads

---

[← Back to API Documentation](./README.md) | [Next: Job Request API →](./job-request.md)