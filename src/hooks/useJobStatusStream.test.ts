import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import authReducer from "../features/auth/authSlice";
import executionReducer from "../features/sql-editor/executionSlice";
import { api, useGetJobStatusQuery } from "../store/api";
import { useJobStatusStream } from "./useJobStatusStream";

vi.mock("../store/api", async (importOriginal) => {
	const mod = await (
		importOriginal as () => Promise<typeof import("../store/api")>
	)();
	return {
		...mod,
		useGetJobStatusQuery: vi.fn(() => ({ data: undefined, error: undefined })),
	};
});

type Listener = (event: { data: string }) => void;

class FakeEventSource {
	static instances: FakeEventSource[] = [];
	static lastOptions?: { withCredentials?: boolean };
	url: string;
	listeners = new Map<string, Listener[]>();
	onerror: (() => void) | null = null;
	close = vi.fn();

	constructor(url: string, options?: { withCredentials?: boolean }) {
		this.url = url;
		FakeEventSource.lastOptions = options;
		FakeEventSource.instances.push(this);
	}

	addEventListener(type: string, listener: Listener) {
		const list = this.listeners.get(type) ?? [];
		list.push(listener);
		this.listeners.set(type, list);
	}

	fire(type: string, data: unknown) {
		for (const listener of this.listeners.get(type) ?? []) {
			listener({ data: JSON.stringify(data) });
		}
	}

	triggerError() {
		this.onerror?.();
	}
}

function setup(taskId: string | null = "task-123") {
	const store = configureStore({
		reducer: {
			[api.reducerPath]: api.reducer,
			auth: authReducer,
			execution: executionReducer,
		},
		middleware: (getDefault) => getDefault().concat(api.middleware),
	});
	const wrapper = ({ children }: { children: ReactNode }) =>
		createElement(Provider, { store, children });
	const utils = renderHook(() => useJobStatusStream(taskId), { wrapper });
	return { store, ...utils };
}

beforeEach(() => {
	FakeEventSource.instances = [];
	FakeEventSource.lastOptions = undefined;
	vi.stubGlobal("EventSource", FakeEventSource);
	vi.mocked(useGetJobStatusQuery).mockClear();
	vi.mocked(useGetJobStatusQuery).mockReturnValue({
		data: undefined,
		error: undefined,
	} as unknown as ReturnType<typeof useGetJobStatusQuery>);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("useJobStatusStream", () => {
	it("opens EventSource with withCredentials true and correct stream URL", () => {
		setup("task-456");
		expect(FakeEventSource.instances).toHaveLength(1);
		const source = FakeEventSource.instances[0];

		expect(FakeEventSource.lastOptions).toEqual({ withCredentials: true });
		expect(source.url).toContain(
			"/api/v1/assignments/client-sql-code-run/status/task-456/stream",
		);
	});

	it("dispatches executionCompleted and closes stream on job-status completed", () => {
		const { store } = setup("task-123");
		const source = FakeEventSource.instances[0];

		const result = {
			success: true,
			passed: true,
			rows: [{ col: 1 }],
			columns: ["col"],
			rowCount: 1,
			executionTimeMs: 10,
		};
		act(() => {
			source.fire("job-status", { status: "completed", result });
		});

		const state = store.getState().execution;
		expect(state.phase).toBe("done");
		expect(state.result).toEqual(result);
		expect(source.close).toHaveBeenCalled();
	});

	it("dispatches executionFailed and closes stream on job-status failed", () => {
		const { store } = setup("task-123");
		const source = FakeEventSource.instances[0];

		act(() => {
			source.fire("job-status", {
				status: "failed",
				result: { success: false, error: "Syntax error in SQL" },
			});
		});

		const state = store.getState().execution;
		expect(state.phase).toBe("error");
		expect(state.error).toBe("Syntax error in SQL");
		expect(source.close).toHaveBeenCalled();
	});

	it("falls back to 1s polling when EventSource triggers onerror", () => {
		const { store } = setup("task-123");
		const source = FakeEventSource.instances[0];

		act(() => {
			source.triggerError();
		});

		expect(source.close).toHaveBeenCalled();
		const calls = vi.mocked(useGetJobStatusQuery).mock.calls;
		const lastOptions = calls[calls.length - 1]?.[1] as
			| { skip?: boolean; pollingInterval?: number }
			| undefined;

		expect(lastOptions?.skip).toBe(false);
		expect(lastOptions?.pollingInterval).toBe(1000);
		expect(store.getState().execution.phase).not.toBe("done");
	});

	it("does not initiate EventSource when taskId is null", () => {
		setup(null);
		expect(FakeEventSource.instances).toHaveLength(0);
	});
});
