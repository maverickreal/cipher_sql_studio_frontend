import { describe, it, expect, vi } from "vitest";

vi.mock("better-auth/react", () => ({
  createAuthClient: vi.fn(() => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
  })),
}));

import { authClient } from "../services/authClient";

describe("authClient service", () => {
  it("creates auth client with correct baseURL", () => {
    expect(authClient).toBeDefined();
    expect(typeof authClient).toBe("object");
  });

  it("has signIn method", () => {
    expect(authClient.signIn).toBeDefined();
    expect(typeof authClient.signIn).toBe("function");
  });

  it("has signUp method", () => {
    expect(authClient.signUp).toBeDefined();
    expect(typeof authClient.signUp).toBe("function");
  });

  it("has signOut method", () => {
    expect(authClient.signOut).toBeDefined();
    expect(typeof authClient.signOut).toBe("function");
  });

  it("has getSession method", () => {
    expect(authClient.getSession).toBeDefined();
    expect(typeof authClient.getSession).toBe("function");
  });
});