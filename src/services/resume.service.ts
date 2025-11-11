import Resume from "../models/Resume.model";
import path from "path";
import fs from "fs";
import pdfPoppler from "pdf-poppler";
import { IMAGE_UPLOAD_DIR } from "../config/paths";

export const processResumeUpload = async (userId: string, filePath: string) => {
  const timestamp = Date.now().toString();
  const outputDir = path.join(IMAGE_UPLOAD_DIR, timestamp);
  fs.mkdirSync(outputDir, { recursive: true });

  const opts = {
    format: "jpeg",
    out_dir: outputDir,
    out_prefix: path.basename(filePath, path.extname(filePath)),
    page: null,
  };

  try {
    await pdfPoppler.convert(filePath, opts);

    const imagesPaths = fs.readdirSync(outputDir).map((file) =>
      path.join("uploads/images", timestamp, file)
    );

    const resumeDoc = await Resume.create({
      userId,
      originalPdfPath: path.join("uploads/pdfs", path.basename(filePath)),
      imagesPaths,
      resumeName: path.basename(filePath),
    });

    return resumeDoc;
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true, force: true });
    console.error("Error processing PDF:", error);
    throw new Error("Failed to process resume file");
  }
};
