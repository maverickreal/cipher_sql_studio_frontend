import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../store/api";
import { useGetAdminAuditQuery } from "../../store/api";
import { AuditAdminPage } from "./AuditAdminPage";

vi.mock("../../store/api", async (importOriginal) => {
  const mod = await (importOriginal as () => Promise<typeof import("../../store/api")>)();
  return {
    ...mod,
    useGetAdminAuditQuery: vi.fn(),
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

const mockAuditItems = [
  { at: "2026-01-01T00:00:00.000Z", actorId: "u1", action: "create", targetType: "assignment", targetId: "a1" },
];

function renderPage() {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <AuditAdminPage />
      </MemoryRouter>
    </Provider>,
  );
}

describe("AuditAdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders audit table with columns", () => {
    vi.mocked(useGetAdminAuditQuery).mockReturnValue({
      data: { items: mockAuditItems, total: 1 },
      error: undefined,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderPage();

    expect(screen.getByText("Audit (1)")).toBeTruthy();
    expect(screen.getByText("At")).toBeTruthy();
    expect(screen.getByText("Actor")).toBeTruthy();
    expect(screen.getByText("Action")).toBeTruthy();
    expect(screen.getByText("Target")).toBeTruthy();
    expect(screen.getByText("Target ID")).toBeTruthy();
  });

  it("shows loading state", () => {
    vi.mocked(useGetAdminAuditQuery).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      refetch: vi.fn(),
    } as any);

    renderPage();
    expect(screen.getByText("Loading audit log\u2026")).toBeTruthy();
  });

  it("shows error state with retry button", () => {
    vi.mocked(useGetAdminAuditQuery).mockReturnValue({
      data: undefined,
      error: { data: { message: "Failed to load audit log" } },
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderPage();
    expect(screen.getByText(/Failed to load/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("shows empty state when no audit events", () => {
    vi.mocked(useGetAdminAuditQuery).mockReturnValue({
      data: { items: [], total: 0 },
      error: undefined,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderPage();
    expect(screen.getByText("No audit events yet.")).toBeTruthy();
  });
});