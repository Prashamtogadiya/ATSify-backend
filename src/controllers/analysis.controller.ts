import { Request, Response, NextFunction } from "express";
import { analyzeResumeService } from "../services/analysis.service";
import logger from "../utils/logger";
export const analyzeResumeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(`Analyzing resume for user: ${req.userId}`);
    const userId = req.userId as string;
    const { resumeId, jobRequestId } = req.body;

    const result = await analyzeResumeService(
      userId,
      resumeId,
      jobRequestId
    );
    logger.info(`Analysis result for user ${userId}: ${JSON.stringify(result)}`);

    res.status(200).json({
      success: true,
      message: "AI Resume Analysis Complete",
      data: result,
    });
  } catch (error) {
    logger.error(`Error analyzing resume: ${(error as Error).message}`);
    next(error);
  }
};
