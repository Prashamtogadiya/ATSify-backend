import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

/**
 * Middleware factory to validate request payloads with a Zod schema.
 *
 * Usage:
 *  - import { validate } from "../middleware/authValidate";
 *  - router.post("/signup", validate(signUpSchema), signUpController);
 *
 * Behavior:
 *  - Calls schema.safeParseAsync on req.body.
 *  - If validation fails: responds 400 with a concise message and an `errors` array.
 *  - If validation succeeds: replaces req.body with the parsed/transformed data and calls next().
 *
 * Notes:
 *  - This only validates req.body. To validate req.query or req.params, call this factory with those values
 *    or create small wrappers that pass req.query / req.params into the schema.
 *  - The middleware mutates req.body to the parsed result — useful when the schema applies transforms.
 *
 * @param schema - A Zod schema describing the expected body shape.
 * @returns Express middleware (req, res, next)
 */
export const validate =
  (schema: ZodTypeAny) =>
  (req:Request, res:Response, next:NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0].message,
      });
    }
    next();
  };
