import { Request, Response } from "express";
import Resume from "../models/Resume.model";
import { processResumeUpload } from "../services/resume.service";
import logger from "../utils/logger";

export const uploadResume = async (req: Request, res: Response) => {
  try {
    logger.info(`User ${req.userId} is attempting to upload a resume: ${req.file?.originalname}`);
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    logger.info(`User ${req.userId} is uploading a resume: ${req.file.originalname}`);
    const resume = await processResumeUpload(req.userId, req.file.path);
    logger.info(`Resume uploaded and processed successfully for user ${req.userId}: ${req.file.originalname}`);
    res.status(201).json({
      message: "Resume uploaded and processed successfully",
      resume,
    });
  } catch (error) {
    logger.error(`Resume upload failed for user ${req.userId}: ${error}`);
    res.status(500).json({ message: "Failed to upload resume" });
  }
};

export const getUserResumes = async (req: Request, res: Response) => {
  try {
    logger.info(`Fetching resumes for user ${req.userId}`);
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const resumes = await Resume.find({ userId: req.userId }).sort({ createdAt: -1 });
    logger.info(`Fetched ${resumes.length} resumes for user ${req.userId}`);
    res.status(200).json({ resumes });
  } catch (error) {
    logger.error(`Failed to fetch resumes for user ${req.userId}: ${error}`);
    res.status(500).json({ message: "Failed to fetch resumes" });
  }
};

export const getResumeById = async (req: Request, res: Response) => {
  try {
    logger.info(`Fetching resume ID ${req.params.id} for user ${req.userId}`);
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const resume = await Resume.findOne({ _id: id, userId: req.userId });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    logger.info(`Fetched resume ID ${id} for user ${req.userId}`);
    res.status(200).json({ resume });
  } catch (error) {
    logger.error(`Failed to fetch resume ID ${req.params.id} for user ${req.userId}: ${error}`);
    res.status(500).json({ message: "Failed to fetch resume" });
  }
};
