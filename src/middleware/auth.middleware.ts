import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "../models/User.model";
import type { AccessTokenPayload } from "../services/auth.service";
import logger from "../utils/logger";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

/**
 * Express middleware that protects routes by validating a Bearer access token.
 *
 * Behavior:
 *  - Reads the Authorization header and expects the value "Bearer <token>".
 *  - Verifies the token using process.env.JWT_ACCESS_SECRET.
 *  - On success: attaches the token's `id` claim to req.userId and calls next().
 *  - On failure or missing header: responds with 401 and a JSON error body.
 *
 * Requirements:
 *  - Environment: JWT_ACCESS_SECRET must be set to the JWT signing secret for access tokens.
 *
 * Request:
 *  - Header: Authorization: "Bearer <accessToken>"
 *
 * Response on error:
 *  - 401 Unauthorized with JSON: { success: false, message: string }
 *
 * Note:
 *  - This middleware mutates req by adding `userId`. If you want TypeScript support for req.userId,
 *    extend the Express Request interface in a global.d.ts or similar declaration file.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info(
    `Authenticating request with Authorization header: ${req.headers.authorization}`
  );
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized token missing" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
    req.userId = decoded.id;
    req.userRole = decoded.role;
    logger.info(`Authenticated user ID successfully: ${req.userId}`);
    next();
  } catch (err: any) {
    logger.error(`Authentication failed: ${err.message}`);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized role missing" });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};

export const requireAdmin = requireRole("admin");
