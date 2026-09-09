import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import authReducer from "../auth/authSlice";
import { ADMIN_BLOCK_MESSAGE, AdminLayout } from "./AdminLayout";

interface TestUser {
	id: string;
	email: string;
	name: string;
	role: string | null;
	image: string | null;
}

afterEach(() => {
	cleanup();
});

function renderAdminLayout(user: TestUser | null, sessionReady = true) {
	const store = configureStore({
		reducer: { auth: authReducer },
		preloadedState: {
			auth: { user, sessionReady },
		},
	});

	const wrapper = ({ children }: { children: ReactNode }) => (
		<Provider store={store}>
			<MemoryRouter initialEntries={["/admin/users"]}>
				<Routes>
					<Route path="/admin" element={children}>
						<Route path="users" element={<div>Users Outlet Content</div>} />
					</Route>
				</Routes>
			</MemoryRouter>
		</Provider>
	);

	return render(<AdminLayout />, { wrapper });
}

describe("AdminLayout security guard", () => {
	it("blocks non-admin user when session is ready showing ADMIN_BLOCK_MESSAGE", () => {
		renderAdminLayout({
			id: "user-1",
			email: "user@example.com",
			name: "Regular User",
			role: "user",
			image: null,
		});

		expect(screen.getByText(new RegExp(ADMIN_BLOCK_MESSAGE))).toBeTruthy();
		expect(screen.queryByText("Users Outlet Content")).toBeNull();
	});

	it("blocks unauthenticated user when session is ready", () => {
		renderAdminLayout(null, true);

		expect(screen.getByText(new RegExp(ADMIN_BLOCK_MESSAGE))).toBeTruthy();
		expect(screen.queryByText("Users Outlet Content")).toBeNull();
	});

	it("renders admin navigation tabs and outlet for admin user", () => {
		renderAdminLayout({
			id: "admin-1",
			email: "admin@example.com",
			name: "Admin User",
			role: "admin",
			image: null,
		});

		expect(screen.queryByText(new RegExp(ADMIN_BLOCK_MESSAGE))).toBeNull();
		expect(screen.getByText("Assignments")).toBeTruthy();
		expect(screen.getByText("Users")).toBeTruthy();
		expect(screen.getByText("Audit")).toBeTruthy();
		expect(screen.getByText("Users Outlet Content")).toBeTruthy();
	});
});
