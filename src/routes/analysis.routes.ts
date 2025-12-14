import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { analyzeResumeSchema } from "../validations/analysis.validation";
import { analyzeResumeController } from "../controllers/analysis.controller";
import { analyzeRateLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.post(
  "/analyze",
  authenticate,
  analyzeRateLimiter,
  validate(analyzeResumeSchema),
  analyzeResumeController
);

export default router;