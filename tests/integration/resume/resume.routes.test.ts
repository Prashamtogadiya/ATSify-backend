import request from "supertest";
import fs from "fs";
import { describe, expect, it, vi } from "vitest";
import Resume from "../../../src/models/Resume.model";
import { createAndLoginUser } from "../../helpers/auth";
import { setupIntegrationSuite } from "../../setup/integration";

vi.mock("../../../src/services/resume.service", () => {
  return {
    processResumeUpload: vi.fn(async (userId: string, filePath: string) => ({
      _id: "mock-resume-id",
      userId,
      originalPdfPath: filePath,
      imagesPaths: ["uploads/images/mock/page-1.jpeg"],
      resumeName: "resume.pdf",
    })),
  };
});

import app from "../../../src/app";

setupIntegrationSuite();

describe("Resume API", () => {
  it("blocks resume list without token", async () => {
    const response = await request(app).get("/api/v1/resume");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("uploads resume for authenticated user", async () => {
    const authUser = await createAndLoginUser();

    const response = await request(app)
      .post("/api/v1/resume/upload")
      .set("Authorization", `Bearer ${authUser.accessToken}`)
      .attach("resume", Buffer.from("%PDF-1.4 test file"), {
        filename: "resume.pdf",
        contentType: "application/pdf",
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Resume uploaded and processed successfully");
    expect(response.body.resume).toEqual(
      expect.objectContaining({
        userId: expect.any(String),
        imagesPaths: expect.any(Array),
      })
    );

    const uploadedPath = response.body.resume.originalPdfPath as string | undefined;
    if (uploadedPath && fs.existsSync(uploadedPath)) {
      fs.unlinkSync(uploadedPath);
    }
  });

  it("returns only resumes of current user", async () => {
    const firstUser = await createAndLoginUser({ email: "resume-owner@example.com" });
    const secondUser = await createAndLoginUser({ email: "resume-other@example.com" });

    await Resume.create({
      userId: firstUser.userId,
      originalPdfPath: "uploads/pdfs/one.pdf",
      imagesPaths: ["uploads/images/1/p1.jpeg"],
      resumeName: "one.pdf",
    });

    await Resume.create({
      userId: secondUser.userId,
      originalPdfPath: "uploads/pdfs/two.pdf",
      imagesPaths: ["uploads/images/2/p1.jpeg"],
      resumeName: "two.pdf",
    });

    const response = await request(app)
      .get("/api/v1/resume")
      .set("Authorization", `Bearer ${firstUser.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.resumes).toHaveLength(1);
    expect(response.body.resumes[0].resumeName).toBe("one.pdf");
  });

  it("returns resume by id for owner", async () => {
    const authUser = await createAndLoginUser({ email: "resume-id-owner@example.com" });

    const resume = await Resume.create({
      userId: authUser.userId,
      originalPdfPath: "uploads/pdfs/owner.pdf",
      imagesPaths: ["uploads/images/3/p1.jpeg"],
      resumeName: "owner.pdf",
    });
    const resumeId = String((resume as { _id: unknown })._id);

    const response = await request(app)
      .get(`/api/v1/resume/${resumeId}`)
      .set("Authorization", `Bearer ${authUser.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.resume.resumeName).toBe("owner.pdf");
  });
});
