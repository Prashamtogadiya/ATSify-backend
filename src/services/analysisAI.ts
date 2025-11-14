// services/analysisAI.ts
import { geminiModel } from "../utils/gemini";
function sanitizeJSON(str: string) {
  return str
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}
export const analyzeResumeWithGemini = async (
  resumeText: string,
  jobDescription: string
) => {
  const prompt = `
You are an AI Resume Evaluation Engine. 
Compare the following RESUME TEXT with the JOB DESCRIPTION.

Return a JSON ONLY. NO extra text.

JSON Format:
{
  "overallScore": number,
  "ATS": {
    "score": number,
    "tips": [
      { "type": "good" | "improve", "tip": string, "explanation": string }
    ]
  },
  "toneAndStyle": {
    "score": number,
    "tips": []
  },
  "content": {
    "score": number,
    "tips": []
  },
  "structure": {
    "score": number,
    "tips": []
  },
  "skills": {
    "score": number,
    "tips": []
  }
}

RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;

  const result = await geminiModel.generateContent([{ text: prompt }]);
  const text = result.response.text();

  const clean = sanitizeJSON(text);

  return JSON.parse(clean);
};
