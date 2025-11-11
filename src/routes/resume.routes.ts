import express from "express";
import { authenticate } from "../middleware/auth.middleware";
import { upload } from "../utils/file";
import {
  uploadResume,
  getUserResumes,
  getResumeById,
} from "../controllers/resume.controller";

const router = express.Router();

router.post("/upload", authenticate, upload.single("resume"), uploadResume);
router.get("/", authenticate, getUserResumes);
router.get("/:id", authenticate, getResumeById);

export default router;
