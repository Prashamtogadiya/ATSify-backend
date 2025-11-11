import { Document, Schema, Types, model } from "mongoose";

export interface IResume extends Document{
    userId:Types.ObjectId;
    originalPdfPath:string;
    imagesPaths:string[];
    resumeName:string;
}

const resumeSchema = new Schema<IResume>(
    {
        userId:{type:Schema.Types.ObjectId,ref:"User",required:true},
        originalPdfPath:{type:String,required:true},
        imagesPaths:{type:[String],default:[]},
        resumeName:{type:String,required:true},
    },
    {
        timestamps:true
    }
)

export default model<IResume>("Resume",resumeSchema);

