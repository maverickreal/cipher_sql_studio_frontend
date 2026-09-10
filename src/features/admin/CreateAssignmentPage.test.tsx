import { configureStore } from "@reduxjs/toolkit";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, useCreateAssignmentMutation } from "../../store/api";
import authReducer from "../auth/authSlice";
import { CreateAssignmentPage } from "./CreateAssignmentPage";

vi.mock("../../store/api", async (importOriginal) => {
	const mod = await (
		importOriginal as () => Promise<typeof import("../../store/api")>
	)();
	return {
		...mod,
		useCreateAssignmentMutation: vi.fn(),
	};
});

function createTestStore() {
	return configureStore({
		reducer: {
			[api.reducerPath]: api.reducer,
			auth: authReducer,
		},
		middleware: (getDefault) => getDefault().concat(api.middleware),
	});
}

function renderPage() {
	const store = createTestStore();
	return render(
		<Provider store={store}>
			<MemoryRouter initialEntries={["/admin/assignments/new"]}>
				<CreateAssignmentPage />
			</MemoryRouter>
		</Provider>,
	);
}

describe("CreateAssignmentPage", () => {
	let mockCreateAssignment: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockCreateAssignment = vi.fn();
		mockCreateAssignment.mockReturnValue({
			unwrap: vi
				.fn()
				.mockResolvedValue({ assignmentId: "new-123", jobId: "job-123" }),
		});
		vi.mocked(useCreateAssignmentMutation).mockReturnValue([
			mockCreateAssignment,
			{ isLoading: false },
		]);
	});

	afterEach(() => {
		cleanup();
	});

	it("renders create assignment form", () => {
		renderPage();

		expect(
			screen.getByRole("heading", { name: "Create Assignment" }),
		).toBeTruthy();
		expect(
			screen.getByText("Add a new SQL assignment for students"),
		).toBeTruthy();
		expect(screen.getByLabelText("Title")).toBeTruthy();
		expect(screen.getByLabelText("Description")).toBeTruthy();
		expect(screen.getByLabelText("Difficulty")).toBeTruthy();
		expect(screen.getByLabelText("Mode")).toBeTruthy();
		expect(screen.getByLabelText("Sample Input")).toBeTruthy();
		expect(screen.getByLabelText("Sample Output")).toBeTruthy();
		expect(screen.getByLabelText("Init SQL")).toBeTruthy();
	});

	it("shows validation errors for empty required fields", async () => {
		renderPage();

		const submitButton = screen.getByRole("button", {
			name: "Create Assignment",
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Title is required")).toBeTruthy();
			expect(screen.getByText("Description is required")).toBeTruthy();
			expect(screen.getByText("Sample input is required")).toBeTruthy();
			expect(screen.getByText("Sample output is required")).toBeTruthy();
			expect(screen.getByText("Init SQL is required")).toBeTruthy();
		});
	});

	it("calls createAssignment mutation with form data on valid submit", async () => {
		renderPage();

		fireEvent.change(screen.getByLabelText("Title"), {
			target: { value: "Test Assignment" },
		});
		fireEvent.change(screen.getByLabelText("Description"), {
			target: { value: "Test description" },
		});
		fireEvent.change(screen.getByLabelText("Difficulty"), {
			target: { value: "medium" },
		});
		fireEvent.change(screen.getByLabelText("Mode"), {
			target: { value: "write" },
		});
		fireEvent.change(screen.getByLabelText("Sample Input"), {
			target: { value: "input1\ninput2" },
		});
		fireEvent.change(screen.getByLabelText("Sample Output"), {
			target: { value: '{"id": 1}' },
		});
		fireEvent.change(screen.getByLabelText("Init SQL"), {
			target: { value: "CREATE TABLE test (id INT);" },
		});

		const submitButton = screen.getByRole("button", {
			name: "Create Assignment",
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(mockCreateAssignment).toHaveBeenCalledWith({
				title: "Test Assignment",
				description: "Test description",
				difficulty: "medium",
				mode: "write",
				sampleInput: ["input1", "input2"],
				sampleOutput: '{"id": 1}',
				solutionSql: undefined,
				validationSql: undefined,
				initSql: "CREATE TABLE test (id INT);",
				orderMatters: false,
			});
		});
	});

	it("shows server error when mutation fails", async () => {
		mockCreateAssignment.mockReturnValueOnce({
			unwrap: vi.fn().mockRejectedValue({ message: "Failed to create" }),
		});

		renderPage();

		fireEvent.change(screen.getByLabelText("Title"), {
			target: { value: "Test" },
		});
		fireEvent.change(screen.getByLabelText("Description"), {
			target: { value: "Desc" },
		});
		fireEvent.change(screen.getByLabelText("Sample Input"), {
			target: { value: "input" },
		});
		fireEvent.change(screen.getByLabelText("Sample Output"), {
			target: { value: "output" },
		});
		fireEvent.change(screen.getByLabelText("Init SQL"), {
			target: { value: "CREATE TABLE t (id INT);" },
		});

		const submitButton = screen.getByRole("button", {
			name: "Create Assignment",
		});
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText("Failed to create")).toBeTruthy();
		});
	});
});
