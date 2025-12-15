// Service for analyzing a resume against a job request
// - Fetches resume and job request records
// - Extracts resume text (OCR for images, PDF parse otherwise)
// - Runs AI-based analysis using Groq
// - Persists analysis result and extracted text

import Analysis from "../models/Analysis";
import Resume from "../models/Resume.model";
import JobRequest from "../models/JobRequest";
import { extractTextFromPdf } from "../utils/extractText";
import { extractTextFromImages } from "../utils/ocr";
import { analyzeResumeWithGroq } from "./analysisAI";

export const analyzeResumeService = async (
  userId: string,
  resumeId: string,
  jobRequestId: string
) => {
  // Fetch required entities
  const resume = await Resume.findById(resumeId);
  const job = await JobRequest.findById(jobRequestId);

  if (!resume || !job) throw new Error("Resume or Job not found");

  let resumeText = "";

  // Prefer OCR text if resume was converted to images
  if (resume.imagesPaths?.length > 0) {
    resumeText = await extractTextFromImages(resume.imagesPaths);
  } else {
    resumeText = await extractTextFromPdf(resume.originalPdfPath);
  }

  // Run AI analysis against job description
  const analysisResult = await analyzeResumeWithGroq(
    resumeText,
    job.jobDescription
  );

  // Persist analysis result
  const saved = await Analysis.create({
    userId,
    resumeId,
    jobRequestId,
    extractedText: resumeText,
    ...analysisResult,
  });

  return saved;
};
