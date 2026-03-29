import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createAndLoginUser } from "../../helpers/auth";
import { setupIntegrationSuite } from "../../setup/integration";

vi.mock("../../../src/services/analysis.service", () => {
  return {
    analyzeResumeService: vi.fn(async (userId: string, resumeId: string, jobRequestId: string) => ({
      _id: "analysis-mock-id",
      userId,
      resumeId,
      jobRequestId,
      extractedText: "mocked extracted text",
      overallScore: 82,
      ATS: { score: 80, tips: [] },
      toneAndStyle: { score: 81, tips: [] },
      content: { score: 85, tips: [] },
      structure: { score: 79, tips: [] },
      skills: { score: 86, tips: [] },
    })),
  };
});

import app from "../../../src/app";

setupIntegrationSuite();

describe("Analysis API", () => {
  it("blocks analyze endpoint without token", async () => {
    const response = await request(app).post("/api/v1/analysis/analyze").send({
      resumeId: "507f191e810c19729de860ea",
      jobRequestId: "507f191e810c19729de860eb",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("returns validation error when fields are missing", async () => {
    const authUser = await createAndLoginUser({ email: "analysis-invalid@example.com" });

    const response = await request(app)
      .post("/api/v1/analysis/analyze")
      .set("Authorization", `Bearer ${authUser.accessToken}`)
      .send({
        resumeId: "",
        jobRequestId: "",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(typeof response.body.message).toBe("string");
  });

  it("returns analysis result for valid request", async () => {
    const authUser = await createAndLoginUser({ email: "analysis-ok@example.com" });

    const response = await request(app)
      .post("/api/v1/analysis/analyze")
      .set("Authorization", `Bearer ${authUser.accessToken}`)
      .send({
        resumeId: "507f191e810c19729de860ea",
        jobRequestId: "507f191e810c19729de860eb",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("AI Resume Analysis Complete");
    expect(response.body.data).toEqual(
      expect.objectContaining({
        overallScore: 82,
        userId: expect.any(String),
      })
    );
  });
});
