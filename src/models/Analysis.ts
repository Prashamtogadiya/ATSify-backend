import { Schema, model, Document, Types } from "mongoose";

interface Tip {
  type: "good" | "improve";
  tip: string;
  explanation?: string;
}

export interface IAnalysis extends Document {
  userId: Types.ObjectId;
  resumeId: Types.ObjectId;
  jobRequestId: Types.ObjectId;

  extractedText: string;
  overallScore: number;

  ATS: {
    score: number;
    tips: Tip[];
  };

  toneAndStyle: {
    score: number;
    tips: Tip[];
  };

  content: {
    score: number;
    tips: Tip[];
  };

  structure: {
    score: number;
    tips: Tip[];
  };

  skills: {
    score: number;
    tips: Tip[];
  };
}

const tipSchema = new Schema<Tip>(
  {
    type: { type: String, enum: ["good", "improve"], required: true },
    tip: { type: String, required: true },
    explanation: { type: String },
  },
  { _id: false }
);

const analysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true },
    jobRequestId: { type: Schema.Types.ObjectId, ref: "JobRequest", required: true },

    extractedText: { type: String, required: true },
    overallScore: { type: Number, default: 0 },

    ATS: {
      score: { type: Number, default: 0 },
      tips: { type: [tipSchema], default: [] },
    },
    toneAndStyle: {
      score: { type: Number, default: 0 },
      tips: { type: [tipSchema], default: [] },
    },
    content: {
      score: { type: Number, default: 0 },
      tips: { type: [tipSchema], default: [] },
    },
    structure: {
      score: { type: Number, default: 0 },
      tips: { type: [tipSchema], default: [] },
    },
    skills: {
      score: { type: Number, default: 0 },
      tips: { type: [tipSchema], default: [] },
    },
  },
  { timestamps: true }
);

export default model<IAnalysis>("Analysis", analysisSchema);
