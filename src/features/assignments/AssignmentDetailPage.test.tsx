import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	api,
	useGetAssignmentByIdQuery,
	useGetLastSqlQuery,
} from "../../store/api";
import type { AssignmentDetail } from "../../types";
import { AssignmentDetailPage } from "./AssignmentDetailPage";

vi.mock("../../store/api", async (importOriginal) => {
	const mod = await (
		importOriginal as () => Promise<typeof import("../../store/api")>
	)();
	return {
		...mod,
		useGetAssignmentByIdQuery: vi.fn(),
		useGetLastSqlQuery: vi.fn(),
	};
});

function renderDetailPage(id: string) {
	const store = configureStore({
		reducer: {
			[api.reducerPath]: api.reducer,
			auth: (state = { user: null, sessionReady: true }) => state,
			execution: (state = { phase: "idle", result: null, error: null }) =>
				state,
		},
	});

	return render(
		<Provider store={store}>
			<MemoryRouter initialEntries={[`/assignments/${id}`]}>
				<Routes>
					<Route path="/assignments/:id" element={<AssignmentDetailPage />} />
				</Routes>
			</MemoryRouter>
		</Provider>,
	);
}

const baseAssignment: AssignmentDetail = {
	_id: "a1",
	title: "Test Assignment",
	description: "A test assignment",
	difficulty: "easy",
	mode: "read",
	sampleInput: [],
	sampleOutput: "",
	pgSchemaReady: true,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("AssignmentDetailPage community info", () => {
	afterEach(() => {
		cleanup();
		vi.mocked(useGetAssignmentByIdQuery).mockClear();
		vi.mocked(useGetLastSqlQuery).mockClear();
	});

	it("shows community badge and contributor when origin=community", () => {
		const assignment: AssignmentDetail = {
			...baseAssignment,
			origin: "community",
			contributor: "contributorhandle",
		};
		vi.mocked(useGetAssignmentByIdQuery).mockReturnValue({
			data: { assignment },
			isLoading: false,
			isError: false,
			error: undefined,
			refetch: vi.fn(),
		} as unknown as ReturnType<typeof useGetAssignmentByIdQuery>);
		vi.mocked(useGetLastSqlQuery).mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: false,
			error: undefined,
			refetch: vi.fn(),
		} as unknown as ReturnType<typeof useGetLastSqlQuery>);

		renderDetailPage("a1");

		expect(screen.getByText("Community")).toBeTruthy();
		expect(screen.getByText(/by contributorhandle/)).toBeTruthy();
	});

	it("does not show community badge when origin=first-party", () => {
		const assignment: AssignmentDetail = {
			...baseAssignment,
			origin: "first-party",
		};
		vi.mocked(useGetAssignmentByIdQuery).mockReturnValue({
			data: { assignment },
			isLoading: false,
			isError: false,
			error: undefined,
			refetch: vi.fn(),
		} as unknown as ReturnType<typeof useGetAssignmentByIdQuery>);
		vi.mocked(useGetLastSqlQuery).mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: false,
			error: undefined,
			refetch: vi.fn(),
		} as unknown as ReturnType<typeof useGetLastSqlQuery>);

		renderDetailPage("a1");

		expect(screen.queryByText("Community")).toBeNull();
	});

	it("does not show community badge when origin is undefined", () => {
		vi.mocked(useGetAssignmentByIdQuery).mockReturnValue({
			data: { assignment: baseAssignment },
			isLoading: false,
			isError: false,
			error: undefined,
			refetch: vi.fn(),
		} as unknown as ReturnType<typeof useGetAssignmentByIdQuery>);
		vi.mocked(useGetLastSqlQuery).mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: false,
			error: undefined,
			refetch: vi.fn(),
		} as unknown as ReturnType<typeof useGetLastSqlQuery>);

		renderDetailPage("a1");

		expect(screen.queryByText("Community")).toBeNull();
	});

	it("renders markdown in description and sample I/O instead of raw source", () => {
		const assignment: AssignmentDetail = {
			...baseAssignment,
			description: "Join **customers** with orders.\n\n```sql\nSELECT 1;\n```",
			sampleInput: [
				"| name | total |\n| --- | --- |\n| Alice | 150 |",
			],
			sampleOutput: "| name |\n| --- |\n| Alice |",
		};
		vi.mocked(useGetAssignmentByIdQuery).mockReturnValue({
			data: { assignment },
			isLoading: false,
			isError: false,
			error: undefined,
			refetch: vi.fn(),
		} as unknown as ReturnType<typeof useGetAssignmentByIdQuery>);
		vi.mocked(useGetLastSqlQuery).mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: false,
			error: undefined,
			refetch: vi.fn(),
		} as unknown as ReturnType<typeof useGetLastSqlQuery>);

		renderDetailPage("a1");

		expect(screen.queryByText(/\*\*customers\*\*/)).toBeNull();
		expect(screen.getByText("customers").tagName).toBe("STRONG");
		expect(document.querySelectorAll("table").length).toBeGreaterThan(0);
		expect(document.querySelector("pre")).toBeTruthy();
	});
});
