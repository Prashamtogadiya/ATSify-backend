// routes/analysis.routes.ts
import { Router } from "express";
import {authenticate} from "../middleware/auth.middleware";
import {validate} from "../middleware/validate.middleware";
import { analyzeResumeSchema } from "../validations/analysis.validation";
import { analyzeResumeController } from "../controllers/analysis.controller";

const router = Router();

router.post(
  "/analyze",
  authenticate  ,
  validate(analyzeResumeSchema),
  analyzeResumeController
);

export default router;
