import { configureStore } from "@reduxjs/toolkit";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, useGetAssignmentsQuery } from "../../store/api";
import { AssignmentListPage } from "./AssignmentListPage";

vi.mock("../../store/api", async (importOriginal) => {
	const mod = await (
		importOriginal as () => Promise<typeof import("../../store/api")>
	)();
	return {
		...mod,
		useGetAssignmentsQuery: vi.fn(),
	};
});

const mockAssignments = [
	{
		_id: "a1",
		title: "Basic Select Query",
		description: "Select all records from users",
		difficulty: "easy",
		mode: "read",
		createdAt: "2026-01-01T00:00:00.000Z",
	},
];

function renderPage(initialUrl = "/assignments") {
	const store = configureStore({
		reducer: { [api.reducerPath]: api.reducer },
	});

	return render(
		<Provider store={store}>
			<MemoryRouter initialEntries={[initialUrl]}>
				<Routes>
					<Route path="/assignments" element={<AssignmentListPage />} />
				</Routes>
			</MemoryRouter>
		</Provider>,
	);
}

describe("AssignmentListPage", () => {
	beforeEach(() => {
		vi.mocked(useGetAssignmentsQuery).mockClear();
		vi.mocked(useGetAssignmentsQuery).mockReturnValue({
			data: {
				assignments: mockAssignments,
				page: 1,
				limit: 20,
				total: 1,
				totalPages: 3,
			},
			isLoading: false,
			isError: false,
			error: undefined,
		} as unknown as ReturnType<typeof useGetAssignmentsQuery>);
	});

	afterEach(() => {
		cleanup();
	});

	it("renders search box and updates query params when user types search term", () => {
		renderPage();

		const searchInput = screen.getByPlaceholderText("Search assignments…");
		expect(searchInput).toBeTruthy();

		fireEvent.change(searchInput, { target: { value: "Select" } });

		expect(vi.mocked(useGetAssignmentsQuery)).toHaveBeenLastCalledWith(
			expect.objectContaining({
				q: "Select",
				page: 1,
			}),
		);
	});

	it("passes difficulty as query param when intensity gauge clicked", () => {
		renderPage();

		const easyButton = screen.getByRole("button", { name: "Easy" });
		fireEvent.click(easyButton);

		expect(vi.mocked(useGetAssignmentsQuery)).toHaveBeenLastCalledWith(
			expect.objectContaining({
				difficulty: "easy",
				page: 1,
			}),
		);
	});

	it("passes origin as query param when origin dropdown changes", () => {
	  renderPage();

	  const originSelect = screen.getByLabelText("Origin");
	  fireEvent.change(originSelect, { target: { value: "community" } });

	  expect(vi.mocked(useGetAssignmentsQuery)).toHaveBeenLastCalledWith(
	    expect.objectContaining({
	      origin: "community",
	      page: 1,
	    }),
	  );
	});

	it("shows community badge on community assignment", () => {
	  const communityAssignment = {
	    _id: "a2",
	    title: "Community Problem",
	    description: "A community-contributed problem",
	    difficulty: "easy",
	    mode: "read",
	    origin: "community",
	    contributor: "contributorhandle",
	    createdAt: "2026-01-01T00:00:00.000Z",
	  };

	  vi.mocked(useGetAssignmentsQuery).mockReturnValue({
	    data: {
	      assignments: [communityAssignment],
	      page: 1,
	      limit: 20,
	      total: 1,
	      totalPages: 1,
	    },
	    isLoading: false,
	    isError: false,
	    error: undefined,
	  } as unknown as ReturnType<typeof useGetAssignmentsQuery>);

	  renderPage();

	  expect(screen.getByText("Community")).toBeTruthy();
	  expect(screen.getByText("by contributorhandle")).toBeTruthy();
	});

	it("does not show community badge on first-party assignment", () => {
	  const firstPartyAssignment = {
	    _id: "a3",
	    title: "First Party Problem",
	    description: "A first-party problem",
	    difficulty: "easy",
	    mode: "read",
	    origin: "first-party",
	    createdAt: "2026-01-01T00:00:00.000Z",
	  };

	  vi.mocked(useGetAssignmentsQuery).mockReturnValue({
	    data: {
	      assignments: [firstPartyAssignment],
	      page: 1,
	      limit: 20,
	      total: 1,
	      totalPages: 1,
	    },
	    isLoading: false,
	    isError: false,
	    error: undefined,
	  } as unknown as ReturnType<typeof useGetAssignmentsQuery>);

	  renderPage();

	  expect(screen.queryByText("Community")).toBeNull();
	});

	it("uses totalPages from response in pager and handles page navigation", () => {
		vi.mocked(useGetAssignmentsQuery).mockReturnValue({
			data: {
				assignments: mockAssignments,
				page: 1,
				limit: 20,
				total: 50,
				totalPages: 3,
			},
			isLoading: false,
			isError: false,
			error: undefined,
		} as unknown as ReturnType<typeof useGetAssignmentsQuery>);

		renderPage("/assignments?page=1");

		expect(screen.getByText("Page 1 of 3")).toBeTruthy();

		const prevButton = screen.getByRole("button", {
			name: "Previous",
		}) as HTMLButtonElement;
		const nextButton = screen.getByRole("button", {
			name: "Next",
		}) as HTMLButtonElement;

		expect(prevButton.disabled).toBe(true);
		expect(nextButton.disabled).toBe(false);

		fireEvent.click(nextButton);

		expect(vi.mocked(useGetAssignmentsQuery)).toHaveBeenLastCalledWith(
			expect.objectContaining({
				page: 2,
			}),
		);
	});

	it("disables next button when current page reaches totalPages", () => {
		vi.mocked(useGetAssignmentsQuery).mockReturnValue({
			data: {
				assignments: mockAssignments,
				page: 3,
				limit: 20,
				total: 50,
				totalPages: 3,
			},
			isLoading: false,
			isError: false,
			error: undefined,
		} as unknown as ReturnType<typeof useGetAssignmentsQuery>);

		renderPage("/assignments?page=3");

		expect(screen.getByText("Page 3 of 3")).toBeTruthy();

		const prevButton = screen.getByRole("button", {
			name: "Previous",
		}) as HTMLButtonElement;
		const nextButton = screen.getByRole("button", {
			name: "Next",
		}) as HTMLButtonElement;

		expect(prevButton.disabled).toBe(false);
		expect(nextButton.disabled).toBe(true);
	});
});
