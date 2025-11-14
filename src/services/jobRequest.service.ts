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