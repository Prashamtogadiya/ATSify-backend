import {z} from "zod";

// Validation for creating a job request
// Makes sure all required fields are present and within expected limits
// Fields:
//   resumeId       - ID of the resume
//   companyName    - Name of the company (1–200 chars)
//   jobTitle       - Job title/position (1–200 chars)
//   jobDescription - Full job description (1–5000 chars)


export const createJobRequestSchema  = z.object({
    body:z.object({
        resumeId:z.string(),
        companyName:z.string().min(1).max(200),
        jobTitle:z.string().min(1).max(200),
        jobDescription:z.string().min(1).max(5000)
    })
}) 