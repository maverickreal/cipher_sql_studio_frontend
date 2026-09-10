import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	api,
	useGetAdminUsersQuery,
	useSetUserRoleMutation,
} from "../../store/api";
import { UsersAdminPage } from "./UsersAdminPage";

vi.mock("../../store/api", async (importOriginal) => {
	const mod = await (
		importOriginal as () => Promise<typeof import("../../store/api")>
	)();
	return {
		...mod,
		useGetAdminUsersQuery: vi.fn(),
		useSetUserRoleMutation: vi.fn(),
	};
});

function createTestStore() {
	return configureStore({
		reducer: {
			[api.reducerPath]: api.reducer,
		},
		middleware: (getDefault) => getDefault().concat(api.middleware),
	});
}

const mockUsers = [
	{ id: "u1", email: "alice@example.com", name: "Alice", role: "admin" },
	{ id: "u2", email: "bob@example.com", name: "Bob", role: "user" },
];

function renderPage() {
	const store = createTestStore();
	return render(
		<Provider store={store}>
			<MemoryRouter>
				<UsersAdminPage />
			</MemoryRouter>
		</Provider>,
	);
}

describe("UsersAdminPage", () => {
	let mockSetRole: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useGetAdminUsersQuery).mockReturnValue({
			data: { items: mockUsers, total: 2 },
			error: undefined,
			isLoading: false,
			refetch: vi.fn(),
		} as any);

		mockSetRole = vi.fn().mockResolvedValue({
			unwrap: vi.fn().mockResolvedValue({}),
		});
		vi.mocked(useSetUserRoleMutation).mockReturnValue([
			mockSetRole,
			{ isLoading: false },
		]);
	});

	afterEach(() => {
		cleanup();
	});

	it("renders users table with email, name, role columns", () => {
		renderPage();

		expect(screen.getByText("Users (2)")).toBeTruthy();
		expect(screen.getByText("alice@example.com")).toBeTruthy();
		expect(screen.getByText("Bob")).toBeTruthy();
		expect(screen.getByText("admin")).toBeTruthy();
	});

	it("shows loading state", () => {
		vi.mocked(useGetAdminUsersQuery).mockReturnValue({
			data: undefined,
			error: undefined,
			isLoading: true,
			refetch: vi.fn(),
		} as any);

		renderPage();
		expect(screen.getByText("Loading users\u2026")).toBeTruthy();
	});

	it("shows error state with retry button", () => {
		vi.mocked(useGetAdminUsersQuery).mockReturnValue({
			data: undefined,
			error: { data: { message: "Failed to load users" } },
			isLoading: false,
			refetch: vi.fn(),
		} as any);

		renderPage();
		expect(screen.getByText(/Failed to load/)).toBeTruthy();
		expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
	});

	it("shows empty state when no users", () => {
		vi.mocked(useGetAdminUsersQuery).mockReturnValue({
			data: { items: [], total: 0 },
			error: undefined,
			isLoading: false,
			refetch: vi.fn(),
		} as any);

		renderPage();
		expect(screen.getByText("No users found.")).toBeTruthy();
	});
});
