import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ResultsTable } from "./ResultsTable";

describe("ResultsTable", () => {
  afterEach(() => {
    // Clean up between tests to prevent multiple renders
  });

  it("renders error state when result.success is false", () => {
    const { unmount } = render(
      <ResultsTable
        result={{ success: false, error: "Syntax error in SQL" } as any}
      />,
    );

    expect(screen.getByText("Error")).toBeTruthy();
    expect(screen.getByText("Syntax error in SQL")).toBeTruthy();
    unmount();
  });

  it("renders success badge when result.passed is true", () => {
    const { unmount } = render(
      <ResultsTable
        result={{
          success: true,
          passed: true,
          columns: ["id", "name"],
          rows: [{ id: 1, name: "Alice" }],
          rowCount: 1,
          executionTimeMs: 10,
        } as any}
      />,
    );

    expect(screen.getByText("Passed")).toBeTruthy();
    expect(screen.getByText("1 row in 10ms")).toBeTruthy();
    unmount();
  });

  it("renders failed badge when result.passed is false", () => {
    const { unmount } = render(
      <ResultsTable
        result={{
          success: true,
          passed: false,
          columns: ["id"],
          rows: [],
          rowCount: 0,
          executionTimeMs: 5,
        } as any}
      />,
    );

    expect(screen.getByText("Failed")).toBeTruthy();
    unmount();
  });

  it("renders success badge when result.passed is undefined", () => {
    const { unmount } = render(
      <ResultsTable
        result={{
          success: true,
          columns: ["id"],
          rows: [{ id: 1 }],
          rowCount: 1,
          executionTimeMs: 15,
        } as any}
      />,
    );

    expect(screen.getByText("Success")).toBeTruthy();
    unmount();
  });

  it("renders table with columns and rows", () => {
    const { unmount } = render(
      <ResultsTable
        result={{
          success: true,
          columns: ["id", "name", "email"],
          rows: [
            { id: 1, name: "Alice", email: "alice@example.com" },
            { id: 2, name: "Bob", email: "bob@example.com" },
          ],
          rowCount: 2,
          executionTimeMs: 20,
        } as any}
      />,
    );

    expect(screen.getByText("id")).toBeTruthy();
    expect(screen.getByText("name")).toBeTruthy();
    expect(screen.getByText("email")).toBeTruthy();
    expect(screen.getByText("Alice")).toBeTruthy();
    expect(screen.getByText("Bob")).toBeTruthy();
    expect(screen.getByText("alice@example.com")).toBeTruthy();
    unmount();
  });

  it("handles empty results gracefully", () => {
    const { unmount } = render(
      <ResultsTable
        result={{
          success: true,
          columns: [],
          rows: [],
          rowCount: 0,
          executionTimeMs: 1,
        } as any}
      />,
    );

    expect(screen.getByText("0 rows in 1ms")).toBeTruthy();
    unmount();
  });
});