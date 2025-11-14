// utils/ocr.ts
import Tesseract from "tesseract.js";

export const extractTextFromImages = async (imagePaths: string[]) => {
  let fullText = "";

  for (const img of imagePaths) {
    const result = await Tesseract.recognize(img, "eng");
    fullText += result.data.text + "\n";
  }

  return fullText.trim();
};
