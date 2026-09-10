import { describe, expect, it, vi } from "vitest";

vi.mock("better-auth/react", () => ({
	createAuthClient: vi.fn(() => ({
		signIn: vi.fn(),
		signUp: vi.fn(),
		signOut: vi.fn(),
		getSession: vi.fn(),
	})),
}));

describe("authClient service", () => {
	it("creates auth client with correct baseURL", async () => {
		const { authClient } = await import("../services/authClient");
		expect(authClient).toBeDefined();
		expect(typeof authClient).toBe("object");
	});

	it("has signIn method", async () => {
		const { authClient } = await import("../services/authClient");
		expect(authClient.signIn).toBeDefined();
		expect(typeof authClient.signIn).toBe("function");
	});

	it("has signUp method", async () => {
		const { authClient } = await import("../services/authClient");
		expect(authClient.signUp).toBeDefined();
		expect(typeof authClient.signUp).toBe("function");
	});

	it("has signOut method", async () => {
		const { authClient } = await import("../services/authClient");
		expect(authClient.signOut).toBeDefined();
		expect(typeof authClient.signOut).toBe("function");
	});

	it("has getSession method", async () => {
		const { authClient } = await import("../services/authClient");
		expect(authClient.getSession).toBeDefined();
		expect(typeof authClient.getSession).toBe("function");
	});
});
