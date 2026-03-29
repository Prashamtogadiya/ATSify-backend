import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import { authenticate } from "../../../src/middleware/auth.middleware";

type AuthedRequest = Request & {
  userId?: string;
  userRole?: string;
};

describe("authenticate middleware", () => {
  it("returns 401 when authorization header is missing", () => {
    const req = { headers: {} } as AuthedRequest;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;
    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized token missing",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches userId and userRole when token is valid", () => {
    const token = jwt.sign(
      { id: "user-id-123", role: "admin" },
      process.env.JWT_ACCESS_SECRET as string
    );

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as AuthedRequest;

    const res = {
      status: vi.fn(),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    authenticate(req, res, next);

    expect(req.userId).toBe("user-id-123");
    expect(req.userRole).toBe("admin");
    expect(next).toHaveBeenCalledTimes(1);
  });
});
