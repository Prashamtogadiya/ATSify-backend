import { Router } from "express";
import { signUp, login, refreshAccessToken, logout } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// PUBLIC routes
router.post("/signup", signUp);
router.post("/login", login);
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
