import Tesseract from "tesseract.js";

// Extracts text from one or more images using OCR (Tesseract.js)
// Loops through each image path, recognizes text, and combines results
// Parameters:
//   imagePaths - array of file paths or URLs of images to process
// Returns:
//   string - concatenated text extracted from all images
export const extractTextFromImages = async (
  imageSources: Array<string | Buffer>
) => {
  let fullText = "";

  for (const img of imageSources) {
    const result = await Tesseract.recognize(img, "eng");
    fullText += result.data.text + "\n";
  }

  return fullText.trim();
};
