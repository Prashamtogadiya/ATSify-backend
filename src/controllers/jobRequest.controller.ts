import { Request, Response, NextFunction } from "express";
import * as jobService from "../services/jobRequest.service";
import ApiResponse from "../utils/ApiResponse";
import logger from "../utils/logger";

export const createJobRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(`Creating job request for user ID: ${req.userId} with data: ${JSON.stringify(req.body)}`);
    // remove userId if passed in request body
    const { userId, ...safeBody } = req.body;

    const jobRequest = await jobService.createJobRequest({
      userId: req.userId!,
      ...req.body,
    });

    logger.info(`Job request created successfully for user ID: ${req.userId}`);
    return res
      .status(201)
      .json(
        new ApiResponse(201, jobRequest, "Job Request created successfully")
      );
  } catch (error) {
    logger.error(`Failed to create job request for user ID: ${req.userId} - ${error}`);
    next(error);
  }
};

export const getMyJobRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info(`Fetching job requests for user ID: ${req.userId}`);
    const jobRequests = await jobService.getUserJobRequests(req.userId!);
    logger.info(`Fetched ${jobRequests.length} job requests for user ID: ${req.userId}`);
    return res
      .status(200)
      .json(new ApiResponse(200, jobRequests, "Fetched User Job Requests"));
  } catch (error) {
    logger.error(`Failed to fetch job requests for user ID: ${req.userId} - ${error}`);
    next(error);
  }
};
