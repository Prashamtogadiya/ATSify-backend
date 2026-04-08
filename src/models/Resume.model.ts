import { Document, Schema, Types, model } from "mongoose";

export interface IResume extends Document{
    userId:Types.ObjectId;
    originalPdfPath?:string;
    imagesPaths?:string[];
    originalPdfDriveFileId?: string;
    imageDriveFileIds?: string[];
    driveFolderId?: string;
    originalPdfWebViewLink?: string;
    resumeName:string;
}

const resumeSchema = new Schema<IResume>(
    {
        userId:{type:Schema.Types.ObjectId,ref:"User",required:true},
        originalPdfPath:{type:String},
        imagesPaths:{type:[String],default:[]},
        originalPdfDriveFileId:{type:String},
        imageDriveFileIds:{type:[String],default:[]},
        driveFolderId:{type:String},
        originalPdfWebViewLink:{type:String},
        resumeName:{type:String,required:true},
    },
    {
        timestamps:true
    }
)

export default model<IResume>("Resume",resumeSchema);

