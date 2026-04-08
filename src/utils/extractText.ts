// Extracts text from a PDF file
// - Reads PDF from the given path
// - Uses pdf-parse-fork for OCR-free text extraction
// - Logs extraction start and the length of extracted text
// - Returns the extracted text as a string

import pdf from "pdf-parse-fork";
import logger from "../utils/logger";
import fs from "fs";

export const extractTextFromPdf = async (pdfSource: string | Buffer) => {
  logger.info("Extracting text from PDF source");

  const dataBuffer = Buffer.isBuffer(pdfSource)
    ? pdfSource
    : fs.readFileSync(pdfSource);

  // Extract text
  const data = await (pdf as any)(dataBuffer);
  logger.info(`Extracted text length: ${data.text.length}`);

  // Return text or empty string if none
  return data.text || "";
};
