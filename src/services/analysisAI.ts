import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
function sanitizeJSON(str: string) {
  return str
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}
export const analyzeResumeWithGroq = async (
  resumeText: string,
  jobDescription: string
) => {
  const prompt = `
You are an ATS-Grade Resume Analysis Model.
Compare the RESUME TEXT with the JOB DESCRIPTION and evaluate keyword match, skill alignment, technical relevance, experience suitability, and seniority fit.
Identify gaps, generate an ATS compatibility score (0–100), and provide precise improvement suggestions that directly increase the match score.

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

  const result = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    prompt: prompt,
  });
  const text = result.text;

  const clean = sanitizeJSON(text);

  return JSON.parse(clean);
};
