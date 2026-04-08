import { Request, Response } from "express";
import Resume from "../models/Resume.model";
import { processResumeUpload } from "../services/resume.service";
import logger from "../utils/logger";
import { getDriveFileStream } from "../services/googleDrive.service";

const buildResumeUrls = (req: Request, resumeId: string, imageCount: number) => {
  const base = `${req.protocol}://${req.get("host")}`;
  const imageUrls = Array.from({ length: imageCount }, (_, index) =>
    `${base}/api/v1/resume/${resumeId}/images/${index}`
  );

  return {
    pdfViewUrl: `${base}/api/v1/resume/${resumeId}/pdf`,
    pdfDownloadUrl: `${base}/api/v1/resume/${resumeId}/pdf?download=1`,
    imageUrls,
  };
};

export const uploadResume = async (req: Request, res: Response) => {
  try {
    logger.info(`User ${req.userId} is attempting to upload a resume: ${req.file?.originalname}`);
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    logger.info(`User ${req.userId} is uploading a resume: ${req.file.originalname}`);
    const resume = await processResumeUpload(req.userId, req.file);
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

    const imageCount = resume.imageDriveFileIds?.length || resume.imagesPaths?.length || 0;
    const urls = buildResumeUrls(req, resume.id, imageCount);

    logger.info(`Fetched resume ID ${id} for user ${req.userId}`);
    res.status(200).json({
      resume: {
        ...resume.toObject(),
        previewImageUrls: urls.imageUrls,
        pdfViewUrl: urls.pdfViewUrl,
        pdfDownloadUrl: urls.pdfDownloadUrl,
      },
    });
  } catch (error) {
    logger.error(`Failed to fetch resume ID ${req.params.id} for user ${req.userId}: ${error}`);
    res.status(500).json({ message: "Failed to fetch resume" });
  }
};

export const streamResumePdf = async (req: Request, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const shouldDownload = req.query.download === "1";
    const resume = await Resume.findOne({ _id: id, userId: req.userId });

    if (!resume?.originalPdfDriveFileId) {
      return res.status(404).json({ message: "Resume PDF not found in Drive" });
    }

    const stream = await getDriveFileStream(resume.originalPdfDriveFileId);

    res.setHeader("Content-Type", "application/pdf");
    const disposition = shouldDownload ? "attachment" : "inline";
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${resume.resumeName || "resume.pdf"}"`
    );

    stream.on("error", () => {
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to stream resume PDF" });
      }
    });

    stream.pipe(res);
  } catch (error) {
    logger.error(
      `Failed to stream resume PDF ${req.params.id} for user ${req.userId}: ${error}`
    );
    res.status(500).json({ message: "Failed to stream resume PDF" });
  }
};

export const streamResumeImage = async (req: Request, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { id, index } = req.params;
    const imageIndex = Number(index);
    if (Number.isNaN(imageIndex) || imageIndex < 0) {
      return res.status(400).json({ message: "Invalid image index" });
    }

    const resume = await Resume.findOne({ _id: id, userId: req.userId });
    const fileId = resume?.imageDriveFileIds?.[imageIndex];

    if (!resume || !fileId) {
      return res.status(404).json({ message: "Resume image not found in Drive" });
    }

    const stream = await getDriveFileStream(fileId);
    res.setHeader("Content-Type", "image/jpeg");
    stream.on("error", () => {
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to stream resume image" });
      }
    });
    stream.pipe(res);
  } catch (error) {
    logger.error(
      `Failed to stream resume image ${req.params.id}#${req.params.index} for user ${req.userId}: ${error}`
    );
    res.status(500).json({ message: "Failed to stream resume image" });
  }
};
