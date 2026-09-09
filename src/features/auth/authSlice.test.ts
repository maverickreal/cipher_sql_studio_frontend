import { describe, expect, it } from "vitest";
import authReducer, { clearSession, setUser } from "./authSlice";

describe("authSlice reducer", () => {
	const initialState = {
		user: null,
		sessionReady: false,
	};

	it("has correct initial state", () => {
		expect(authReducer(undefined, { type: "unknown" })).toEqual(initialState);
	});

	it("setUser action updates user and sets sessionReady to true", () => {
		const testUser = {
			id: "usr_100",
			email: "dev@example.com",
			name: "Dev User",
			role: "admin",
			image: "http://example.com/avatar.png",
		};

		const nextState = authReducer(initialState, setUser(testUser));
		expect(nextState.user).toEqual(testUser);
		expect(nextState.sessionReady).toBe(true);
	});

	it("setUser action with null updates user to null and sets sessionReady to true", () => {
		const stateWithUser = {
			user: {
				id: "usr_100",
				email: "dev@example.com",
				name: "Dev User",
				role: "user",
				image: null,
			},
			sessionReady: false,
		};

		const nextState = authReducer(stateWithUser, setUser(null));
		expect(nextState.user).toBeNull();
		expect(nextState.sessionReady).toBe(true);
	});

	it("clearSession action clears user to null and sets sessionReady to true", () => {
		const activeState = {
			user: {
				id: "usr_200",
				email: "active@example.com",
				name: "Active User",
				role: "user",
				image: null,
			},
			sessionReady: true,
		};

		const nextState = authReducer(activeState, clearSession());
		expect(nextState.user).toBeNull();
		expect(nextState.sessionReady).toBe(true);
	});
});
