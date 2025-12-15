// Data access helpers for JobRequest
// - Create a new job request
// - Fetch all job requests for a user (latest first)
// - Fetch a specific job request scoped to a user

import JobRequest from "../models/JobRequest";

export const createJobRequest = async(data:any)=>{
    return await JobRequest.create(data);
}

export const getUserJobRequests = async (userId: string) => {
  return await JobRequest.find({ userId }).sort({ createdAt: -1 });
};

export const getJobRequestById = async (id: string, userId: string) => {
  return await JobRequest.findOne({ _id: id, userId });
};