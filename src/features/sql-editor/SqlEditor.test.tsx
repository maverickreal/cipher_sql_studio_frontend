import { EditorView } from "@codemirror/view";
import { configureStore } from "@reduxjs/toolkit";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "../../store/api";
import { ThemeProvider } from "../../theme/ThemeProvider";
import { ThemeToggle } from "../../theme/ThemeToggle";
import authReducer from "../auth/authSlice";
import executionReducer from "./executionSlice";
import { SqlEditor } from "./SqlEditor";

vi.mock("../../store/api", async (importOriginal) => {
	const mod = await (
		importOriginal as () => Promise<typeof import("../../store/api")>
	)();
	return {
		...mod,
		useExecuteSqlMutation: vi.fn(() => [
			vi.fn().mockResolvedValue({
				unwrap: vi.fn().mockResolvedValue({ taskId: "task-123" }),
			}),
			{ isLoading: false },
		]),
		useSaveLastSqlMutation: vi.fn(() => [
			vi.fn().mockResolvedValue({ unwrap: vi.fn().mockResolvedValue({}) }),
		]),
	};
});

vi.mock("../../hooks/useJobStatusStream", () => ({
	useJobStatusStream: vi.fn(),
}));

function createTestStore() {
	return configureStore({
		reducer: {
			[api.reducerPath]: api.reducer,
			auth: authReducer,
			execution: executionReducer,
		},
		middleware: (getDefault) => getDefault().concat(api.middleware),
	});
}

const mockAssignment = {
	_id: "a1",
	title: "Test Assignment",
	description: "Test description",
	difficulty: "easy" as const,
	mode: "read" as const,
	sampleInput: [],
	sampleOutput: "",
	pgSchemaReady: true,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
};

function renderEditor() {
	const store = createTestStore();
	return render(
		<Provider store={store}>
			<ThemeProvider>
				<ThemeToggle />
				<MemoryRouter initialEntries={["/assignments/a1"]}>
					<Routes>
						<Route
							path="/assignments/:id"
							element={<SqlEditor assignment={mockAssignment} />}
						/>
					</Routes>
				</MemoryRouter>
			</ThemeProvider>
		</Provider>,
	);
}

describe("SqlEditor", () => {
	afterEach(() => {
		cleanup();
		localStorage.clear();
		document.documentElement.className = "";
		delete document.documentElement.dataset.theme;
	});

	it("renders SQL editor with assignment title and mode", () => {
		renderEditor();

		expect(screen.getByText("SQL Editor")).toBeTruthy();
		expect(screen.getByText("PostgreSQL · Read only")).toBeTruthy();
	});

	it("renders Run Query button", () => {
		renderEditor();

		const runButton = screen.getByRole("button", {
			name: "Run Query",
		}) as HTMLButtonElement;
		expect(runButton).toBeTruthy();
		expect(runButton.disabled).toBe(false);
	});

	it("gives the empty editor a 280px min height", () => {
		renderEditor();
		const host = document.querySelector(".cm-editor-container");
		expect(host).toBeTruthy();
		expect(host?.className).toContain("min-h-[280px]");
	});

	it("keeps typed SQL when the theme toggle fires", () => {
		renderEditor();
		const host = document.querySelector(".cm-editor-container");
		expect(host).toBeTruthy();
		const view = EditorView.findFromDOM(host as HTMLElement);
		expect(view).toBeTruthy();
		const sql = "SELECT 42 AS keep_me;";
		view?.dispatch({
			changes: { from: 0, to: view.state.doc.length, insert: sql },
			selection: { anchor: 7 },
		});
		const head = view?.state.selection.main.head;
		fireEvent.click(
			screen.getByRole("button", { name: "Switch to light theme" }),
		);
		expect(document.documentElement.dataset.theme).toBe("alucard");
		const after = EditorView.findFromDOM(host as HTMLElement);
		expect(after).toBe(view);
		expect(after?.state.doc.toString()).toBe(sql);
		expect(after?.state.selection.main.head).toBe(head);
	});
});
