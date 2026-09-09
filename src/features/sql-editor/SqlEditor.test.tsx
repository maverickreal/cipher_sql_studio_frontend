import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "../../store/api";
import authReducer from "../auth/authSlice";
import executionReducer from "./executionSlice";
import { SqlEditor } from "./SqlEditor";

vi.mock("../../store/api", async (importOriginal) => {
  const mod = await (importOriginal as () => Promise<typeof import("../../store/api")>)();
  return {
    ...mod,
    useExecuteSqlMutation: vi.fn(() => [
      vi.fn().mockResolvedValue({ unwrap: vi.fn().mockResolvedValue({ taskId: "task-123" }) }),
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
      <MemoryRouter initialEntries={["/assignments/a1"]}>
        <Routes>
          <Route path="/assignments/:id" element={<SqlEditor assignment={mockAssignment} />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe("SqlEditor", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders SQL editor with assignment title and mode", () => {
    renderEditor();

    expect(screen.getByText("SQL Editor")).toBeTruthy();
    expect(screen.getByText("PostgreSQL \u00b7 Read only")).toBeTruthy();
  });

  it("renders Run Query button", () => {
    renderEditor();

    const runButton = screen.getByRole("button", { name: "Run Query" }) as HTMLButtonElement;
    expect(runButton).toBeTruthy();
    expect(runButton.disabled).toBe(false);
  });
});