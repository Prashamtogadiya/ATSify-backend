import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../../src/app";
import { setupIntegrationSuite } from "../../setup/integration";

setupIntegrationSuite();

describe("Auth API", () => {
  it("creates a user and returns access token + refresh cookie", async () => {
    const response = await request(app).post("/api/v1/auth/signup").send({
      name: "Alice Tester",
      email: "alice@example.com",
      password: "Password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("User created");
    expect(response.body.user.email).toBe("alice@example.com");
    expect(typeof response.body.accessToken).toBe("string");
    const setCookieHeader = response.headers["set-cookie"];
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [];
    expect(cookies.some((cookie) => cookie.includes("refreshToken="))).toBe(true);
  });

  it("rejects duplicate signup", async () => {
    const payload = {
      name: "Bob Tester",
      email: "bob@example.com",
      password: "Password123",
    };

    await request(app).post("/api/v1/auth/signup").send(payload);
    const secondResponse = await request(app).post("/api/v1/auth/signup").send(payload);

    expect(secondResponse.status).toBe(400);
    expect(secondResponse.body.success).toBe(false);
    expect(secondResponse.body.message).toBe("User already exists");
  });

  it("logs in an existing user", async () => {
    await request(app).post("/api/v1/auth/signup").send({
      name: "Chris Tester",
      email: "chris@example.com",
      password: "Password123",
    });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: "chris@example.com",
      password: "Password123",
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    expect(typeof loginResponse.body.accessToken).toBe("string");
    const setCookieHeader = loginResponse.headers["set-cookie"];
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [];
    expect(cookies.some((cookie) => cookie.includes("refreshToken="))).toBe(true);
  });

  it("returns 401 on refresh without cookie", async () => {
    const refreshResponse = await request(app).get("/api/v1/auth/refresh");

    expect(refreshResponse.status).toBe(401);
    expect(refreshResponse.body.success).toBe(false);
    expect(refreshResponse.body.message).toBe("No refresh token");
  });
});
