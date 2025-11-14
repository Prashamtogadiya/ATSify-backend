import { z } from "zod";

export const analyzeResumeSchema = z.object({
  body: z.object({
    resumeId: z.string().min(1, "Resume ID is required"),
    jobRequestId: z.string().min(1, "Job Request ID is required"),
  }),
});

export type AnalyzeResumeInput = z.infer<typeof analyzeResumeSchema>["body"];
