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
  const resume = await Resume.findById(resumeId);
  const job = await JobRequest.findById(jobRequestId);

  if (!resume || !job) throw new Error("Resume or Job not found");

  let resumeText = "";

  if (resume.imagesPaths?.length > 0) {
    resumeText = await extractTextFromImages(resume.imagesPaths);
  } else {
    resumeText = await extractTextFromPdf(resume.originalPdfPath);
  }

  const analysisResult = await analyzeResumeWithGroq(
    resumeText,
    job.jobDescription
  );

  const saved = await Analysis.create({
    userId,
    resumeId,
    jobRequestId,
    extractedText: resumeText,
    ...analysisResult,
  });

  return saved;
};
