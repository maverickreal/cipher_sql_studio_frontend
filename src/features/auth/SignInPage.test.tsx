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
import { SignInPage } from "./SignInPage";

vi.mock("../../services/authClient", () => ({
	authClient: {
		signIn: {
			email: vi.fn(),
			social: vi.fn(),
		},
	},
}));

function renderPage() {
	return render(
		<MemoryRouter>
			<SignInPage />
		</MemoryRouter>,
	);
}

describe("SignInPage", () => {
	beforeEach(() => {
		vi.mocked(authClient.signIn.email).mockReset();
		vi.stubGlobal("location", { ...window.location, reload: vi.fn() });
	});

	afterEach(() => {
		cleanup();
		vi.unstubAllGlobals();
	});

	it("shows validation error and does not call signIn when email is invalid", async () => {
		renderPage();
		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "not-an-email" },
		});
		fireEvent.change(screen.getByLabelText("Password"), {
			target: { value: "secret" },
		});
		fireEvent.submit(
			screen.getByRole("button", { name: "Sign In" }).closest("form")!,
		);
		expect(await screen.findByText("Invalid email address")).toBeTruthy();
		expect(authClient.signIn.email).not.toHaveBeenCalled();
	});

	it("calls authClient.signIn.email with email and password on valid submit", async () => {
		vi.mocked(authClient.signIn.email).mockResolvedValue({
			data: { user: { id: "u1" } },
			error: null,
		} as unknown as Awaited<ReturnType<typeof authClient.signIn.email>>);
		renderPage();
		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "learner@example.com" },
		});
		fireEvent.change(screen.getByLabelText("Password"), {
			target: { value: "secret" },
		});
		fireEvent.submit(
			screen.getByRole("button", { name: "Sign In" }).closest("form")!,
		);
		await waitFor(() => {
			expect(authClient.signIn.email).toHaveBeenCalledWith({
				email: "learner@example.com",
				password: "secret",
			});
		});
	});

	it("shows server error when sign-in fails", async () => {
		vi.mocked(authClient.signIn.email).mockResolvedValue({
			data: null,
			error: { message: "Invalid credentials" },
		} as unknown as Awaited<ReturnType<typeof authClient.signIn.email>>);
		renderPage();
		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "learner@example.com" },
		});
		fireEvent.change(screen.getByLabelText("Password"), {
			target: { value: "wrong" },
		});
		fireEvent.submit(
			screen.getByRole("button", { name: "Sign In" }).closest("form")!,
		);
		expect(await screen.findByText("Invalid credentials")).toBeTruthy();
	});
});
