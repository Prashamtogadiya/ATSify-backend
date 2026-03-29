import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { describe, expect, it, vi } from "vitest";
import { validate } from "../../../src/middleware/validate.middleware";

describe("validate middleware", () => {
  const schema = z.object({
    body: z.object({
      email: z.string().email("Invalid email"),
    }),
    params: z.object({}).optional(),
    query: z.object({}).optional(),
  });

  it("returns 400 on invalid payload", () => {
    const req = {
      body: { email: "invalid-email" },
      params: {},
      query: {},
    } as Request;

    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;
    const next = vi.fn() as NextFunction;

    validate(schema)(req, res, next);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next on valid payload", () => {
    const req = {
      body: { email: "valid@example.com" },
      params: {},
      query: {},
    } as Request;

    const res = {
      status: vi.fn(),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
