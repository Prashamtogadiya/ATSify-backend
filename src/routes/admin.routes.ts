import { Router } from "express";
import {
  getDashboardStats,
  getUsers,
  updateUserRole,
} from "../controllers/admin.controller";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateUserRoleSchema } from "../validations/admin.validation";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/dashboard/stats", getDashboardStats);
router.get("/users", getUsers);
router.patch("/users/:userId/role", validate(updateUserRoleSchema), updateUserRole);

export default router;