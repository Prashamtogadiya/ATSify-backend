import { afterAll, beforeAll, beforeEach } from "vitest";
import {
  clearTestDatabase,
  connectToTestDatabase,
  disconnectTestDatabase,
} from "./test-db";

export const setupIntegrationSuite = () => {
  beforeAll(async () => {
    await connectToTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });
};
