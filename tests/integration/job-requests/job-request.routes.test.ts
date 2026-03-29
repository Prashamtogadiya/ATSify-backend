import request from "supertest";
import { describe, expect, it } from "vitest";
import JobRequest from "../../../src/models/JobRequest";
import { createAndLoginUser } from "../../helpers/auth";
import { setupIntegrationSuite } from "../../setup/integration";

import app from "../../../src/app";

setupIntegrationSuite();

describe("Job Request API", () => {
  it("creates a job request for authenticated user", async () => {
    const authUser = await createAndLoginUser({ email: "job-create@example.com" });

    const response = await request(app)
      .post("/api/v1/job-requests")
      .set("Authorization", `Bearer ${authUser.accessToken}`)
      .send({
        resumeId: "507f191e810c19729de860ea",
        companyName: "Acme Corp",
        jobTitle: "Backend Engineer",
        jobDescription: "Need a backend engineer with Node.js and MongoDB experience.",
      });

    expect(response.status).toBe(201);
    expect(response.body.statusCode).toBe(201);
    expect(response.body.message).toBe("Job Request created successfully");
    expect(response.body.data.companyName).toBe("Acme Corp");
  });

  it("returns validation error for invalid payload", async () => {
    const authUser = await createAndLoginUser({ email: "job-invalid@example.com" });

    const response = await request(app)
      .post("/api/v1/job-requests")
      .set("Authorization", `Bearer ${authUser.accessToken}`)
      .send({
        resumeId: "",
        companyName: "",
        jobTitle: "",
        jobDescription: "",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(typeof response.body.message).toBe("string");
  });

  it("returns only current user job requests", async () => {
    const firstUser = await createAndLoginUser({ email: "job-owner@example.com" });
    const secondUser = await createAndLoginUser({ email: "job-other@example.com" });

    await JobRequest.create({
      userId: firstUser.userId,
      resumeId: "507f191e810c19729de860ea",
      companyName: "First Co",
      jobTitle: "Developer",
      jobDescription: "A long enough job description for the first user.",
    });

    await JobRequest.create({
      userId: secondUser.userId,
      resumeId: "507f191e810c19729de860eb",
      companyName: "Second Co",
      jobTitle: "Developer",
      jobDescription: "A long enough job description for the second user.",
    });

    const response = await request(app)
      .get("/api/v1/job-requests")
      .set("Authorization", `Bearer ${firstUser.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.jobRequests).toHaveLength(1);
    expect(response.body.data.jobRequests[0].companyName).toBe("First Co");
  });

  it("returns 404 for unknown job request id", async () => {
    const authUser = await createAndLoginUser({ email: "job-notfound@example.com" });

    const response = await request(app)
      .get("/api/v1/job-requests/507f191e810c19729de860ff")
      .set("Authorization", `Bearer ${authUser.accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Job request not found");
  });
});
