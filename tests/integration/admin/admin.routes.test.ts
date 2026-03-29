import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../../src/app";
import { createAndLoginUser } from "../../helpers/auth";
import { setupIntegrationSuite } from "../../setup/integration";

setupIntegrationSuite();

describe("Admin API", () => {
  it("blocks dashboard access without token", async () => {
    const response = await request(app).get("/api/v1/admin/dashboard/stats");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Unauthorized token missing");
  });

  it("blocks dashboard access for non-admin user", async () => {
    const authUser = await createAndLoginUser({ role: "user" });

    const response = await request(app)
      .get("/api/v1/admin/dashboard/stats")
      .set("Authorization", `Bearer ${authUser.accessToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Forbidden: insufficient permissions");
  });

  it("returns dashboard stats for admin user", async () => {
    const adminUser = await createAndLoginUser({ role: "admin" });

    const response = await request(app)
      .get("/api/v1/admin/dashboard/stats")
      .set("Authorization", `Bearer ${adminUser.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        totalUsers: expect.any(Number),
        totalAdmins: expect.any(Number),
        totalAnalyses: expect.any(Number),
        totalJobRequests: expect.any(Number),
        totalResumes: expect.any(Number),
        analysesLast7Days: expect.any(Number),
        newUsersLast30Days: expect.any(Number),
        averageOverallScore: expect.any(Number),
        highestOverallScore: expect.any(Number),
      })
    );
  });
});
