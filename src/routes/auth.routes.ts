import { Router } from "express";
import { signUp, login, refreshAccessToken, logout } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// PUBLIC routes
router.post("/signup", signUp);
router.post("/login", login);
router.get("/refresh", refreshAccessToken);

// PROTECTED test route
router.get("/me", authenticate, (req, res) => {
  // if `authenticate` passed successfully -> req.userId exist
  return res.json({
    success: true,
    message: "Authenticated route works",
    userId: req.userId,
  });
});

// LOGOUT
router.post("/logout", logout);

export default router;
