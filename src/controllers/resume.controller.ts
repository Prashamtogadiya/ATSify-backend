import { Request, Response } from "express";
import Resume from "../models/Resume.model";
import { processResumeUpload } from "../services/resume.service";
import logger from "../utils/logger";

export const uploadResume = async (req: Request, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    logger.info(`User ${req.userId} is uploading a resume: ${req.file.originalname}`);
    const resume = await processResumeUpload(req.userId, req.file.path);

    res.status(201).json({
      message: "Resume uploaded and processed successfully",
      resume,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Failed to upload resume" });
  }
};

export const getUserResumes = async (req: Request, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const resumes = await Resume.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ resumes });
  } catch (error) {
    console.error("Get resumes error:", error);
    res.status(500).json({ message: "Failed to fetch resumes" });
  }
};

export const getResumeById = async (req: Request, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const resume = await Resume.findOne({ _id: id, userId: req.userId });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.status(200).json({ resume });
  } catch (error) {
    console.error("Get resume by ID error:", error);
    res.status(500).json({ message: "Failed to fetch resume" });
  }
};
