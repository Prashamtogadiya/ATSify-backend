import { Document, model, Schema, Types } from "mongoose"

export interface IJobRequest extends Document{
    userId:Types.ObjectId;
    resumeId:Types.ObjectId;
    companyName : string;
    jobTitle:string;
    jobDescription:string;
}

const jobRequestSchema = new Schema<IJobRequest>(
    {
        userId:{type:Schema.Types.ObjectId,ref:"User",required:true},
        resumeId:{type:Schema.Types.ObjectId,ref:"Resume",required:true},
        companyName:{type:String,required:true,trim:true},
        jobTitle:{type:String,required:true,trim:true},
        jobDescription:{type:String,required:true,trim:true,maxLength:5000}
    },
    {timestamps:true}
)

jobRequestSchema.index({ userId: 1, _id: -1 });


export default model<IJobRequest>("JobRequest",jobRequestSchema);