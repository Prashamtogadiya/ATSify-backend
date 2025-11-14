import { Router } from "express";
import { signUp, login, refreshAccessToken, logout } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { signUpSchema, loginSchema } from "../validations/auth.validation";
const router = Router();

// PUBLIC routes
router.post("/signup", validate(signUpSchema), signUp);
router.post("/login", validate(loginSchema), login);
router.get("/refresh", refreshAccessToken);

// LOGOUT
router.post("/logout", logout);

// PROTECTED test route
// router.get("/me", authenticate, (req, res) => {
//   return res.json({
//     success: true,
//     message: "Authenticated route works",
//     userId: req.userId,
//   });
// });


export default router;
