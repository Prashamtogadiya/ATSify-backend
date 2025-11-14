import {z} from "zod";
export const createJobRequestSchema  = z.object({
    body:z.object({
        resumeId:z.string(),
        companyName:z.string().min(1).max(200),
        jobTitle:z.string().min(1).max(200),
        jobDescription:z.string().min(1).max(5000)
    })
}) 