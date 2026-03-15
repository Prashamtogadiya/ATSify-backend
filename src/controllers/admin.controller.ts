import { Request, Response, NextFunction } from "express";
import {
  getAdminDashboardStats,
  getPaginatedUsersForAdmin,
  updateUserRoleByAdmin,
} from "../services/admin.service";
import logger from "../utils/logger";

export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await getAdminDashboardStats();

    return res.status(200).json({
      success: true,
      message: "Admin dashboard stats fetched successfully",
      data: stats,
    });
  } catch (error) {
    logger.error(
      `Failed to fetch admin dashboard stats: ${(error as Error).message}`
    );
    return next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getPaginatedUsersForAdmin(
      req.query.page,
      req.query.limit
    );

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Failed to fetch admin users: ${(error as Error).message}`);
    return next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedUser = await updateUserRoleByAdmin(
      req.params.userId,
      req.body.role
    );

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    logger.error(`Failed to update user role: ${(error as Error).message}`);
    return next(error);
  }
};