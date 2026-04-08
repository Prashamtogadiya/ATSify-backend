import { Request, Response, NextFunction } from "express";
import {
  analyzeResumeService,
  getAnalysisHistoryService,
  getLatestAnalysisForJobRequestService,
} from "../services/analysis.service";
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

export const getAnalysisHistoryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId as string;
    const limit = Number(req.query.limit || 20);
    const history = await getAnalysisHistoryService(userId, limit);

    res.status(200).json({
      success: true,
      message: "Analysis history fetched successfully",
      data: history,
    });
  } catch (error) {
    logger.error(`Error fetching analysis history: ${(error as Error).message}`);
    next(error);
  }
};

export const getLatestAnalysisForJobRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId as string;
    const { jobRequestId } = req.params;

    const analysis = await getLatestAnalysisForJobRequestService(
      userId,
      jobRequestId
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "No analysis found for this job request",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Latest analysis fetched successfully",
      data: analysis,
    });
  } catch (error) {
    logger.error(
      `Error fetching latest analysis for job request: ${(error as Error).message}`
    );
    next(error);
  }
};

export const getSpecificAnalysisController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId as string;
    const { analysisId } = req.params;

    const Analysis = require("../models/Analysis").default;
    const analysis = await Analysis.findOne({
      _id: analysisId,
      userId,
    })
      .populate("jobRequestId", "companyName jobTitle")
      .populate("resumeId", "resumeName");

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Analysis fetched successfully",
      data: analysis,
    });
  } catch (error) {
    logger.error(
      `Error fetching specific analysis: ${(error as Error).message}`
    );
    next(error);
  }
};
