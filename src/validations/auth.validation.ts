import { z } from "zod";

/**
 * signUpSchema
 *
 * - Schema for the signup route body.
 * - Validates and provides helpful error messages for frontend/display.
 *
 * Body shape:
 *  { name: string, email: string, password: string }
 *
 * Example:
 *  const parsed = signUpSchema.parse({ name: "A", email: "x", password: "123" });
 *  // throws with readable errors — use `safeParse`/`safeParseAsync` in middleware to avoid throwing.
 */
export const signUpSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be atleast 2 chars"),
    email: z.string().email("Invalid email").trim().toLowerCase(),
    password: z.string().trim().min(6, "Password minimum 6 characters"),
  }),
});

/**
 * loginSchema
 *
 * - Schema for the login route body.
 * - Reuseable for client/server validation to ensure consistent rules.
 *
 * Body shape:
 *  { email: string, password: string }
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email").trim().toLowerCase(),
    password: z.string().trim().min(6, "Password minimum 6 characters"),
  }),
});
