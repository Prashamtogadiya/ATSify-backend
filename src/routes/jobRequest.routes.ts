import { Router } from "express";
import { createJobRequest, getJobRequestById, getMyJobRequests } from "../controllers/jobRequest.controller";
import { validate } from "../middleware/validate.middleware";
import { createJobRequestSchema } from "../validations/jobRequest.validation";
import {authenticate} from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, validate(createJobRequestSchema), createJobRequest);
router.get("/", authenticate, getMyJobRequests);
router.get("/:id", authenticate, getJobRequestById);
export default router;
