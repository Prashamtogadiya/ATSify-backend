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
      ...safeBody,
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
    const { cursor, limit } = req.query;
    const parsedLimit = limit ? parseInt(limit as string, 10) : 10;

    // Validate limit
    const safeLimit = Math.min(Math.max(parsedLimit, 1), 100); // Between 1 and 100

    logger.info(`Fetching job requests for user ID: ${req.userId} with cursor: ${cursor}, limit: ${safeLimit}`);

    const result = await jobService.getUserJobRequests({
      userId: req.userId!,
      cursor: cursor as string | undefined,
      limit: safeLimit,
    });

    logger.info(`Fetched ${result.data.length} job requests for user ID: ${req.userId}`);

    return res.status(200).json(
      new ApiResponse(200, {
        jobRequests: result.data,
        pagination: {
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
          limit: safeLimit,
        },
      }, "Fetched User Job Requests")
    );
  } catch (error) {
    logger.error(`Failed to fetch job requests for user ID: ${req.userId} - ${error}`);
    next(error);
  }
};