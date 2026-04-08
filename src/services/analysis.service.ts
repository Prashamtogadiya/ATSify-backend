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
import { downloadDriveFileBuffer } from "./googleDrive.service";

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
  if (resume.imageDriveFileIds?.length) {
    const imageBuffers = await Promise.all(
      resume.imageDriveFileIds.map((fileId) => downloadDriveFileBuffer(fileId))
    );
    resumeText = await extractTextFromImages(imageBuffers);
  } else if (resume.imagesPaths && resume.imagesPaths.length > 0) {
    resumeText = await extractTextFromImages(resume.imagesPaths);
  } else if (resume.originalPdfDriveFileId) {
    const pdfBuffer = await downloadDriveFileBuffer(resume.originalPdfDriveFileId);
    resumeText = await extractTextFromPdf(pdfBuffer);
  } else {
    if (!resume.originalPdfPath) {
      throw new Error("Resume source file is missing");
    }
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

export const getAnalysisHistoryService = async (userId: string, limit = 20) => {
  return Analysis.find({ userId })
    .populate("jobRequestId", "companyName jobTitle")
    .populate("resumeId", "resumeName")
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 100));
};

export const getLatestAnalysisForJobRequestService = async (
  userId: string,
  jobRequestId: string
) => {
  return Analysis.findOne({ userId, jobRequestId }).sort({ createdAt: -1 });
};
