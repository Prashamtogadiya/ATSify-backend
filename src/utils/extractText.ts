import fs from "fs";
import pdf from "pdf-parse-fork";

export const extractTextFromPdf = async (pdfPath: string) => {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await (pdf as any)(dataBuffer);
  return data.text || "";
};