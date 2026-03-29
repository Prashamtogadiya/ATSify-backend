import request from "supertest";
import app from "../../src/app";
import User, { type UserRole } from "../../src/models/User.model";

type CreateAuthUserOptions = {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
};

export const createAndLoginUser = async (options: CreateAuthUserOptions = {}) => {
  const name = options.name ?? "Test User";
  const email = options.email ?? `test-${Date.now()}-${Math.random()}@example.com`;
  const password = options.password ?? "Password123";

  const signUpResponse = await request(app).post("/api/v1/auth/signup").send({
    name,
    email,
    password,
  });

  if (signUpResponse.status !== 201) {
    throw new Error(`Failed to create user in test: ${JSON.stringify(signUpResponse.body)}`);
  }

  if (options.role && options.role !== "user") {
    await User.findOneAndUpdate({ email }, { role: options.role });
  }

  const loginResponse = await request(app).post("/api/v1/auth/login").send({
    email,
    password,
  });

  const setCookieHeader = loginResponse.headers["set-cookie"];
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : setCookieHeader
      ? [setCookieHeader]
      : undefined;

  return {
    userId: String(signUpResponse.body.user?._id ?? ""),
    email,
    password,
    accessToken: loginResponse.body.accessToken as string,
    cookies,
  };
};
