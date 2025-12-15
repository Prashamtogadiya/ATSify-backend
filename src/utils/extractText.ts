// Extracts text from a PDF file
// - Reads PDF from the given path
// - Uses pdf-parse-fork for OCR-free text extraction
// - Logs extraction start and the length of extracted text
// - Returns the extracted text as a string

import fs from "fs";
import pdf from "pdf-parse-fork";
import logger from "../utils/logger";

export const extractTextFromPdf = async (pdfPath: string) => {
  logger.info(`Extracting text from PDF: ${pdfPath}`);

  // Read PDF file into buffer
  const dataBuffer = fs.readFileSync(pdfPath);

  // Extract text
  const data = await (pdf as any)(dataBuffer);
  logger.info(`Extracted text length: ${data.text.length}`);

  // Return text or empty string if none
  return data.text || "";
};
