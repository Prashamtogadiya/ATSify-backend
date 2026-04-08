// Multer configuration for handling PDF uploads
// - Stores files in memory so they can be uploaded to Google Drive
// - Limits file size to 5 MB
// - Accepts only PDF files

import multer from "multer";
import { Request } from "express";

// Export Multer instance with file size limit and type filter
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed!"));
    }
    cb(null, true);
  },
});
