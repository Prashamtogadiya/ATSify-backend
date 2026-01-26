// Data access helpers for JobRequest
// - Create a new job request
// - Fetch all job requests for a user (latest first) with cursor-based pagination
// - Fetch a specific job request scoped to a user

import { Types } from "mongoose";
import JobRequest from "../models/JobRequest";

export const createJobRequest = async (data: any) => {
  return await JobRequest.create(data);
};

export interface PaginationParams {
  userId: string;
  cursor?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const getUserJobRequests = async ({
  userId,
  cursor,
  limit = 10,
}: PaginationParams): Promise<PaginatedResult<any>> => {
  const query: Record<string, any> = { userId };

  if (cursor && Types.ObjectId.isValid(cursor)) {
    query._id = { $lt: new Types.ObjectId(cursor) };
  }

  const jobRequests = await JobRequest.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean<Array<{ _id: Types.ObjectId }>>();

  const hasMore = jobRequests.length > limit;
  const data = hasMore ? jobRequests.slice(0, limit) : jobRequests;
  const nextCursor =
    data.length > 0 && hasMore ? data[data.length - 1]._id.toString() : null;

  return {
    data,
    nextCursor,
    hasMore,
  };
};

export const getJobRequestById = async (id: string, userId: string) => {
  return await JobRequest.findOne({ _id: id, userId });
};