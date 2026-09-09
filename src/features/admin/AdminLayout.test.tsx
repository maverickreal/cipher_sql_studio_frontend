import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import authReducer from "../auth/authSlice";
import { ADMIN_BLOCK_MESSAGE, AdminLayout } from "./AdminLayout";

interface TestUser {
	id: string;
	email: string;
	name: string;
	role: string | null;
	image: string | null;
}

function renderWithAuth(user: TestUser | null) {
	const store = configureStore({
		reducer: { auth: authReducer },
		preloadedState: {
			auth: { user, sessionReady: true },
		},
	});
	const wrapper = ({ children }: { children: ReactNode }) => (
		<Provider store={store}>
			<MemoryRouter initialEntries={["/admin/users"]}>{children}</MemoryRouter>
		</Provider>
	);
	return render(<AdminLayout />, { wrapper });
}

describe("AdminLayout guard", () => {
	it("blocks non-admin with Admin access required", () => {
		renderWithAuth({
			id: "u1",
			email: "user@test.com",
			name: "User",
			role: "user",
			image: null,
		});
		expect(screen.getByText(new RegExp(ADMIN_BLOCK_MESSAGE))).toBeTruthy();
	});

	it("shows admin nav for admin users", () => {
		renderWithAuth({
			id: "a1",
			email: "admin@test.com",
			name: "Admin",
			role: "admin",
			image: null,
		});
		expect(screen.getByText("Users")).toBeTruthy();
		expect(screen.getByText("Audit")).toBeTruthy();
		expect(screen.getByText("Assignments")).toBeTruthy();
	});
});
