import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authClient } from "../../services/authClient";
import { SocialSignInButtons } from "./SocialSignInButtons";

vi.mock("../../services/authClient", () => ({
	authClient: {
		signIn: {
			social: vi.fn(),
		},
	},
}));

function renderButtons() {
	return render(
		<MemoryRouter>
			<SocialSignInButtons />
		</MemoryRouter>,
	);
}

describe("SocialSignInButtons", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("renders Google and GitHub sign-in buttons", () => {
		renderButtons();

		expect(
			screen.getByRole("button", { name: "Continue with Google" }),
		).toBeTruthy();
		expect(
			screen.getByRole("button", { name: "Continue with GitHub" }),
		).toBeTruthy();
		expect(
			screen
				.getByRole("button", { name: "Continue with Google" })
				.querySelector("svg"),
		).toBeTruthy();
		expect(
			screen
				.getByRole("button", { name: "Continue with GitHub" })
				.querySelector("svg"),
		).toBeTruthy();
	});

	it("calls authClient.signIn.social when Google button clicked", async () => {
		vi.mocked(authClient.signIn.social).mockResolvedValue({
			data: null,
			error: null,
		} as any);

		renderButtons();

		fireEvent.click(
			screen.getByRole("button", { name: "Continue with Google" }),
		);

		await waitFor(() => {
			expect(authClient.signIn.social).toHaveBeenCalledWith({
				provider: "google",
				callbackURL: `${window.location.origin}/`,
			});
		});
	});

	it("calls authClient.signIn.social when GitHub button clicked", async () => {
		vi.mocked(authClient.signIn.social).mockResolvedValue({
			data: null,
			error: null,
		} as any);

		renderButtons();

		fireEvent.click(
			screen.getByRole("button", { name: "Continue with GitHub" }),
		);

		await waitFor(() => {
			expect(authClient.signIn.social).toHaveBeenCalledWith({
				provider: "github",
				callbackURL: `${window.location.origin}/`,
			});
		});
	});

	it("shows error message when sign-in fails", async () => {
		vi.mocked(authClient.signIn.social).mockResolvedValue({
			data: null,
			error: { message: "Sign in failed" },
		} as any);

		renderButtons();

		fireEvent.click(
			screen.getByRole("button", { name: "Continue with Google" }),
		);

		await waitFor(() => {
			expect(screen.getByText("Sign in failed")).toBeTruthy();
		});
	});

	it("shows generic error when sign-in throws", async () => {
		vi.mocked(authClient.signIn.social).mockRejectedValue(
			new Error("Network error"),
		);

		renderButtons();

		fireEvent.click(
			screen.getByRole("button", { name: "Continue with Google" }),
		);

		await waitFor(() => {
			expect(screen.getByText("Sign in with Google failed")).toBeTruthy();
		});
	});
});
