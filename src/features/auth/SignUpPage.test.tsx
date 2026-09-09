import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authClient } from "../../services/authClient";
import { SignUpPage } from "./SignUpPage";

vi.mock("../../services/authClient", () => ({
	authClient: {
		signUp: {
			email: vi.fn(),
		},
		signIn: {
			social: vi.fn(),
		},
	},
}));

function renderPage() {
	return render(
		<MemoryRouter>
			<SignUpPage />
		</MemoryRouter>,
	);
}

describe("SignUpPage", () => {
	beforeEach(() => {
		vi.mocked(authClient.signUp.email).mockReset();
		vi.stubGlobal("location", { ...window.location, reload: vi.fn() });
	});

	afterEach(() => {
		cleanup();
		vi.unstubAllGlobals();
	});

	it("shows validation error and does not call signUp when password is too short", async () => {
		renderPage();
		fireEvent.change(screen.getByLabelText("Name"), {
			target: { value: "Ada" },
		});
		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "ada@example.com" },
		});
		fireEvent.change(screen.getByLabelText("Password"), {
			target: { value: "short" },
		});
		fireEvent.submit(screen.getByRole("button", { name: "Create Account" }).closest("form")!);
		expect(await screen.findByText("Must be at least 8 characters")).toBeTruthy();
		expect(authClient.signUp.email).not.toHaveBeenCalled();
	});

	it("calls authClient.signUp.email with name, email, and password on valid submit", async () => {
		vi.mocked(authClient.signUp.email).mockResolvedValue({
			data: { user: { id: "u1" } },
			error: null,
		} as unknown as Awaited<ReturnType<typeof authClient.signUp.email>>);
		renderPage();
		fireEvent.change(screen.getByLabelText("Name"), {
			target: { value: "Ada" },
		});
		fireEvent.change(screen.getByLabelText("Email"), {
			target: { value: "ada@example.com" },
		});
		fireEvent.change(screen.getByLabelText("Password"), {
			target: { value: "longenough" },
		});
		fireEvent.submit(screen.getByRole("button", { name: "Create Account" }).closest("form")!);
		await waitFor(() => {
			expect(authClient.signUp.email).toHaveBeenCalledWith({
				name: "Ada",
				email: "ada@example.com",
				password: "longenough",
			});
		});
	});
});
