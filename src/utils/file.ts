// Multer configuration for handling PDF uploads
// - Saves files to a configured directory (PDF_UPLOAD_DIR)
// - Ensures unique filenames to prevent overwrites
// - Limits file size to 5 MB
// - Accepts only PDF files

import multer, { StorageEngine } from "multer";
import path from "path";
import fs from "fs";
import { PDF_UPLOAD_DIR } from "../config/paths";
import { Request } from "express";

// Define storage engine for Multer
const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    // Ensure upload directory exists
    fs.mkdirSync(PDF_UPLOAD_DIR, { recursive: true });
    cb(null, PDF_UPLOAD_DIR);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    // Sanitize filename and add a unique timestamp + random suffix
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

// Export Multer instance with file size limit and type filter
export const upload = multer({
  storage,
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
