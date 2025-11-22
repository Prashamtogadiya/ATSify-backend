import fs from "fs";
import pdf from "pdf-parse-fork";
import logger from "../utils/logger";

export const extractTextFromPdf = async (pdfPath: string) => {
  logger.info(`Extracting text from PDF: ${pdfPath}`);

  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await (pdf as any)(dataBuffer);
  logger.info(`Extracted text length: ${data.text.length}`);
  return data.text || "";
};