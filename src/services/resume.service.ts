// Processes an uploaded resume PDF
// - Uploads source PDF to Google Drive under the user's folder
// - Converts PDF pages to images using pdf-poppler
// - Uploads generated images to Google Drive
// - Saves Drive metadata in MongoDB

import Resume from "../models/Resume.model";
import User from "../models/User.model";
import path from "path";
import fs from "fs";
import os from "os";
import pdfPoppler from "pdf-poppler";
import {
  ensureUserDriveFolder,
  uploadBufferToDrive,
} from "./googleDrive.service";

const makeSafeFileName = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, "_") || `resume-${Date.now()}.pdf`;

export const processResumeUpload = async (
  userId: string,
  file: Express.Multer.File
) => {
  if (!file?.buffer?.length) {
    throw new Error("Uploaded file buffer is empty");
  }

  const user = await User.findById(userId).select("email");
  if (!user?.email) {
    throw new Error("User not found for resume upload");
  }

  const timestamp = Date.now().toString();
  const tempBaseDir = path.join(os.tmpdir(), "atsify", timestamp);
  const outputDir = path.join(tempBaseDir, "images");
  const safeName = makeSafeFileName(file.originalname || `resume-${timestamp}.pdf`);
  const tempPdfPath = path.join(tempBaseDir, safeName);

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(tempPdfPath, file.buffer);

  const driveFolderId = await ensureUserDriveFolder(user.email);

  const uploadedPdf = await uploadBufferToDrive({
    name: `${timestamp}-${safeName}`,
    mimeType: file.mimetype || "application/pdf",
    buffer: file.buffer,
    parentFolderId: driveFolderId,
  });

  const opts = {
    format: "jpeg",
    out_dir: outputDir,
    out_prefix: path.basename(tempPdfPath, path.extname(tempPdfPath)),
    page: null, // Convert all pages
  };

  try {
    // Convert PDF to images
    await pdfPoppler.convert(tempPdfPath, opts);

    const imageDriveFileIds: string[] = [];
    const imageFiles = fs.readdirSync(outputDir);

    for (const imageFile of imageFiles) {
      const imagePath = path.join(outputDir, imageFile);
      const imageBuffer = fs.readFileSync(imagePath);
      const uploadedImage = await uploadBufferToDrive({
        name: imageFile,
        mimeType: "image/jpeg",
        buffer: imageBuffer,
        parentFolderId: driveFolderId,
      });
      imageDriveFileIds.push(uploadedImage.id);
    }

    // Save resume document in DB
    const resumeDoc = await Resume.create({
      userId,
      originalPdfDriveFileId: uploadedPdf.id,
      imageDriveFileIds,
      driveFolderId,
      originalPdfWebViewLink: uploadedPdf.webViewLink,
      resumeName: safeName,
    });

    return resumeDoc;
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw new Error("Failed to process resume file");
  } finally {
    if (fs.existsSync(tempBaseDir)) {
      fs.rmSync(tempBaseDir, { recursive: true, force: true });
    }
  }
};
