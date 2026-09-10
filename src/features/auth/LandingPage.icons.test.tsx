import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import authReducer from "./authSlice";
import { LandingPage } from "./LandingPage";

describe("LandingPage lucide icons", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders lucide SVGs on feature cards", () => {
		const store = configureStore({
			reducer: { auth: authReducer },
			preloadedState: {
				auth: { user: null, sessionReady: true },
			},
		});
		const { container } = render(
			<Provider store={store}>
				<MemoryRouter>
					<LandingPage />
				</MemoryRouter>
			</Provider>,
		);
		const icons = container.querySelectorAll("svg.lucide");
		expect(icons.length).toBeGreaterThanOrEqual(3);
	});
});
