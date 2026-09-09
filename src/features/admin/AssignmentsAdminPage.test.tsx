import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../store/api";
import { useGetAdminAssignmentsQuery } from "../../store/api";
import { AssignmentsAdminPage } from "./AssignmentsAdminPage";

vi.mock("../../store/api", async (importOriginal) => {
  const mod = await (importOriginal as () => Promise<typeof import("../../store/api")>)();
  return {
    ...mod,
    useGetAdminAssignmentsQuery: vi.fn(),
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

const mockAssignments = [
  { _id: "a1", title: "Test Assignment", difficulty: "easy", mode: "read", createdAt: "2026-01-01T00:00:00.000Z" },
];

function renderPage() {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <AssignmentsAdminPage />
      </MemoryRouter>
    </Provider>,
  );
}

describe("AssignmentsAdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders assignments table with title, difficulty, mode columns", () => {
    vi.mocked(useGetAdminAssignmentsQuery).mockReturnValue({
      data: { items: mockAssignments, total: 1 },
      error: undefined,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderPage();

    expect(screen.getByText("Assignments (1)")).toBeTruthy();
    expect(screen.getByText("Test Assignment")).toBeTruthy();
    expect(screen.getByText("easy")).toBeTruthy();
    expect(screen.getByText("read")).toBeTruthy();
  });

  it("shows loading state", () => {
    vi.mocked(useGetAdminAssignmentsQuery).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      refetch: vi.fn(),
    } as any);

    renderPage();
    expect(screen.getByText("Loading assignments\u2026")).toBeTruthy();
  });

  it("shows error state with retry button", () => {
    vi.mocked(useGetAdminAssignmentsQuery).mockReturnValue({
      data: undefined,
      error: { data: { message: "Failed to load assignments" } },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderPage();
    expect(screen.getByText("Failed to load assignments")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("shows empty state when no assignments", () => {
    vi.mocked(useGetAdminAssignmentsQuery).mockReturnValue({
      data: { items: [], total: 0 },
      error: undefined,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderPage();
    expect(screen.getByText("No assignments yet.")).toBeTruthy();
  });
});