import { describe, it, expect } from "vitest";

describe("executionSlice", () => {
  it("is defined and is a Redux slice reducer", async () => {
    const { default: executionSlice } = await import("./executionSlice");
    expect(executionSlice).toBeDefined();
    expect(typeof executionSlice).toBe("function");
  });

  it("has expected actions", async () => {
    const { executionStarted, executionCompleted, executionFailed, resetExecution } = await import("./executionSlice");
    expect(executionStarted).toBeDefined();
    expect(executionCompleted).toBeDefined();
    expect(executionFailed).toBeDefined();
    expect(resetExecution).toBeDefined();
  });

  it("handles executionStarted action", async () => {
    const { default: executionReducer, executionStarted } = await import("./executionSlice");
    const initialState = { phase: "idle", taskId: null, result: null, error: null };
    const state: any = executionReducer(initialState, executionStarted("task-123"));
    expect(state.phase).toBe("polling");
    expect(state.taskId).toBe("task-123");
  });

  it("handles executionCompleted action", async () => {
    const { default: executionReducer, executionCompleted } = await import("./executionSlice");
    const initialState = { phase: "polling", taskId: "task-123", result: null, error: null };
    const state: any = executionReducer(initialState, executionCompleted({ rows: [], columns: [], success: true, rowCount: 0, executionTimeMs: 0 }));
    expect(state.phase).toBe("done");
    expect(state.result).toEqual({ rows: [], columns: [], success: true, rowCount: 0, executionTimeMs: 0 });
  });

  it("handles executionFailed action", async () => {
    const { default: executionReducer, executionFailed } = await import("./executionSlice");
    const initialState = { phase: "polling", taskId: "task-123", result: null, error: null };
    const state: any = executionReducer(initialState, executionFailed("Query failed"));
    expect(state.phase).toBe("error");
    expect(state.error).toBe("Query failed");
  });

  it("handles resetExecution action", async () => {
    const { default: executionReducer, resetExecution } = await import("./executionSlice");
    const initialState = { phase: "done", taskId: "task-123", result: { rows: [], columns: [], success: true, rowCount: 0, executionTimeMs: 0 }, error: null };
    const state: any = executionReducer(initialState, resetExecution());
    expect(state.phase).toBe("idle");
    expect(state.taskId).toBeNull();
    expect(state.result).toBeNull();
  });
});