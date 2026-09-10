import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import authReducer from "./authSlice";
import { LandingPage } from "./LandingPage";

type AuthUser = {
	id: string;
	email: string;
	name: string;
	role: string | null;
	image: string | null;
};

function renderLanding(auth?: {
	user: AuthUser | null;
	sessionReady: boolean;
}) {
	const store = configureStore({
		reducer: { auth: authReducer },
		preloadedState: {
			auth: auth ?? { user: null, sessionReady: true },
		},
	});
	return render(
		<Provider store={store}>
			<MemoryRouter>
				<LandingPage />
			</MemoryRouter>
		</Provider>,
	);
}

describe("LandingPage", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders landing page with app name and description", () => {
		renderLanding();

		expect(screen.getByText("Master SQL with")).toBeTruthy();
		expect(screen.getByText("Interactive SQL Learning")).toBeTruthy();
		expect(screen.getByText("Browse Assignments")).toBeTruthy();
		expect(screen.getByText("Create Free Account")).toBeTruthy();
	});

	it("hides Create Free Account when signed in", () => {
		renderLanding({
			sessionReady: true,
			user: {
				id: "u1",
				email: "a@b.c",
				name: "Ada",
				role: "user",
				image: null,
			},
		});

		expect(screen.queryByText("Create Free Account")).toBeNull();
		expect(screen.getByText("Browse Assignments")).toBeTruthy();
	});

	it("renders feature cards", () => {
		renderLanding();

		expect(screen.getAllByText("Write SQL").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Execute Instantly").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Track Progress").length).toBeGreaterThan(0);
	});

	it("renders feature descriptions", () => {
		renderLanding();

		expect(
			screen.getAllByText(/built-in CodeMirror editor/).length,
		).toBeGreaterThan(0);
		expect(
			screen.getAllByText(/real PostgreSQL databases/).length,
		).toBeGreaterThan(0);
		expect(
			screen.getAllByText(/Solve assignments at your own pace/).length,
		).toBeGreaterThan(0);
	});
});
