import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import authReducer from "../features/auth/authSlice";
import { api } from "../store/api";
import { Navbar } from "./Navbar";

vi.mock("../services/authClient", () => ({
	authClient: { signOut: vi.fn() },
}));

vi.mock("../store/api", async (importOriginal) => {
	const mod = await (importOriginal as () => Promise<typeof import("../store/api")>)();
	return {
		...mod,
		useGetMyProfileQuery: vi.fn(() => ({
			data: undefined,
			isLoading: false,
		})),
	};
});

function renderNavbar(
	user: null | {
		id: string;
		email: string;
		name: string;
		role: string | null;
		image: string | null;
	},
) {
	const store = configureStore({
		reducer: {
			auth: authReducer,
			[api.reducerPath]: api.reducer,
		},
		middleware: (getDefault) => getDefault().concat(api.middleware),
		preloadedState: {
			auth: { user, sessionReady: true },
		},
	});
	return render(
		<Provider store={store}>
			<MemoryRouter>
				<Navbar />
			</MemoryRouter>
		</Provider>,
	);
}

describe("Navbar", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows Get Started when signed out", () => {
    renderNavbar(null);
    expect(screen.getByText("Get Started")).toBeTruthy();
  });

  it("hides Get Started when signed in", () => {
    renderNavbar({
      id: "u1",
      email: "a@b.c",
      name: "Ada",
      role: "user",
      image: null,
    });
    expect(screen.queryByText("Get Started")).toBeNull();
  });
});
