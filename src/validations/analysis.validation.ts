import { z } from "zod";

// Validation schema for analyzing a resume
// Ensures that both resume ID and job request ID are provided
// Fields:
//   resumeId     - ID of the resume to analyze (required)
//   jobRequestId - ID of the related job request (required)
export const analyzeResumeSchema = z.object({
  body: z.object({
    resumeId: z.string().min(1, "Resume ID is required"),
    jobRequestId: z.string().min(1, "Job Request ID is required"),
  }),
});

// Type for validated input
export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>["body"];
