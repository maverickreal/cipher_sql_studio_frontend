import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { api } from "../../store/api";
import authReducer, { setUser } from "../auth/authSlice";
import { AdminLayout } from "./AdminLayout";

function createTestStore() {
	return configureStore({
		reducer: {
			[api.reducerPath]: api.reducer,
			auth: authReducer,
		},
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(api.middleware),
	});
}

afterEach(() => {
	cleanup();
});

describe("AdminLayout", () => {
	it("shows ADMIN_BLOCK_MESSAGE when user is non-admin after sessionReady", () => {
		const store = createTestStore();
		store.dispatch(
			setUser({
				id: "u1",
				email: "a@b.com",
				name: "A",
				role: "user",
				image: null,
			}),
		);
		render(
			<Provider store={store}>
				<BrowserRouter>
					<AdminLayout />
				</BrowserRouter>
			</Provider>,
		);
		expect(screen.getByText(/Admin access required/)).toBeTruthy();
	});

	it("renders admin tabs and outlet when user is admin", () => {
		const store = createTestStore();
		store.dispatch(
			setUser({
				id: "u1",
				email: "a@b.com",
				name: "A",
				role: "admin",
				image: null,
			}),
		);
		render(
			<Provider store={store}>
				<BrowserRouter>
					<AdminLayout />
				</BrowserRouter>
			</Provider>,
		);
		expect(screen.getByText("Admin")).toBeTruthy();
		expect(screen.getByText("Assignments")).toBeTruthy();
		expect(screen.getByText("Users")).toBeTruthy();
		expect(screen.getByText("Audit")).toBeTruthy();
	});

	it("does not block when session is not ready yet", () => {
		const store = createTestStore();
		render(
			<Provider store={store}>
				<BrowserRouter>
					<AdminLayout />
				</BrowserRouter>
			</Provider>,
		);
		expect(screen.queryByText(/Admin access required/)).toBeNull();
	});
});
