import { z } from "zod";
import { USER_ROLES } from "../models/User.model";

export const updateUserRoleSchema = z.object({
  params: z.object({
    userId: z.string().trim().min(1, "User ID is required"),
  }),
  body: z.object({
    role: z.enum(USER_ROLES),
  }),
  query: z.object({}).optional(),
});