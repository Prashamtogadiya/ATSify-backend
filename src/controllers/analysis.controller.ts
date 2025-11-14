import { Request, Response, NextFunction } from "express";
import { analyzeResumeService } from "../services/analysis.service";

export const analyzeResumeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId as string;
    const { resumeId, jobRequestId } = req.body;

    const result = await analyzeResumeService(
      userId,
      resumeId,
      jobRequestId
    );

    res.status(200).json({
      success: true,
      message: "AI Resume Analysis Complete",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
