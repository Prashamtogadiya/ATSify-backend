import { Request, Response, NextFunction } from "express";
import * as jobService from "../services/jobRequest.service";
import ApiResponse from "../utils/ApiResponse";

export const createJobRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    // remove userId if passed in request body
    const { userId, ...safeBody } = req.body;

    const jobRequest = await jobService.createJobRequest({
  userId: req.userId!,
  ...req.body,
});


    return res
      .status(201)
      .json(new ApiResponse(201, jobRequest, "Job Request created successfully"));
  } catch (error) {
    next(error);
  }
};

export const getMyJobRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
const jobRequests = await jobService.getUserJobRequests(req.userId!);

    return res
      .status(200)
      .json(new ApiResponse(200, jobRequests, "Fetched User Job Requests"));
  } catch (error) {
    next(error);
  }
};
