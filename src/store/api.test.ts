import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";

describe("store/api query URLs and parameters", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		fetchMock = vi.fn().mockImplementation(async () => {
			return new Response(
				JSON.stringify({
					assignments: [],
					items: [],
					total: 0,
					totalPages: 1,
					page: 1,
					limit: 20,
					taskId: "task-1",
					assignmentId: "assign-1",
					jobId: "job-1",
					user: { id: "user-1", role: "admin" },
				}),
				{
					status: 200,
					headers: { "Content-Type": "application/json" },
				},
			);
		});
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	function createTestStore() {
		return configureStore({
			reducer: { [api.reducerPath]: api.reducer },
			middleware: (getDefault) => getDefault().concat(api.middleware),
		});
	}

	function getFetchUrl(call: unknown[]): string {
		const firstArg = call[0];
		if (typeof firstArg === "string") return firstArg;
		if (firstArg && typeof firstArg === "object" && "url" in firstArg) {
			return (firstArg as { url: string }).url;
		}
		return String(firstArg);
	}

	function getFetchMethod(call: unknown[]): string {
		const firstArg = call[0];
		const options = call[1] as RequestInit | undefined;
		if (options?.method) return options.method;
		if (firstArg && typeof firstArg === "object" && "method" in firstArg) {
			return (firstArg as { method: string }).method;
		}
		return "GET";
	}

	async function getFetchBody(call: unknown[]): Promise<unknown> {
		const firstArg = call[0];
		const options = call[1] as RequestInit | undefined;
		if (options?.body) {
			return JSON.parse(options.body as string);
		}
		if (firstArg && typeof firstArg === "object" && "clone" in firstArg) {
			const req = (firstArg as Request).clone();
			const text = await req.text();
			return text ? JSON.parse(text) : null;
		}
		return null;
	}

	it("getAssignments sends page, limit, q, filter[difficulty], filter[mode], sort, order", async () => {
		const store = createTestStore();
		await store.dispatch(
			api.endpoints.getAssignments.initiate({
				page: 2,
				limit: 10,
				q: "select test",
				difficulty: "easy",
				mode: "read",
				sort: "title",
				order: "asc",
			}),
		);

		expect(fetchMock).toHaveBeenCalled();
		const rawUrl = getFetchUrl(fetchMock.mock.calls[0]);
		const url = new URL(rawUrl, "http://127.0.0.1:8000");

		expect(url.pathname).toBe("/api/v1/assignments");
		expect(url.searchParams.get("page")).toBe("2");
		expect(url.searchParams.get("limit")).toBe("10");
		expect(url.searchParams.get("q")).toBe("select test");
		expect(url.searchParams.get("filter[difficulty]")).toBe("easy");
		expect(url.searchParams.get("filter[mode]")).toBe("read");
		expect(url.searchParams.get("sort")).toBe("title");
		expect(url.searchParams.get("order")).toBe("asc");
	});

	it("getAssignments uses default page=1 and limit=20 when no params provided", async () => {
		const store = createTestStore();
		await store.dispatch(api.endpoints.getAssignments.initiate());

		expect(fetchMock).toHaveBeenCalled();
		const rawUrl = getFetchUrl(fetchMock.mock.calls[0]);
		const url = new URL(rawUrl, "http://127.0.0.1:8000");

		expect(url.pathname).toBe("/api/v1/assignments");
		expect(url.searchParams.get("page")).toBe("1");
		expect(url.searchParams.get("limit")).toBe("20");
		expect(url.searchParams.has("q")).toBe(false);
	});

	it("getAssignmentById fetches assignment by ID", async () => {
		const store = createTestStore();
		await store.dispatch(
			api.endpoints.getAssignmentById.initiate("assign-123"),
		);

		expect(fetchMock).toHaveBeenCalled();
		const rawUrl = getFetchUrl(fetchMock.mock.calls[0]);
		const url = new URL(rawUrl, "http://127.0.0.1:8000");
		expect(url.pathname).toBe("/api/v1/assignments/assign-123");
	});

	it("executeSql sends POST request to client-sql-code-run/execute", async () => {
		const store = createTestStore();
		const bodyData = { assignmentId: "a1", sql: "SELECT * FROM users;" };
		await store.dispatch(api.endpoints.executeSql.initiate(bodyData));

		expect(fetchMock).toHaveBeenCalled();
		const rawUrl = getFetchUrl(fetchMock.mock.calls[0]);
		const method = getFetchMethod(fetchMock.mock.calls[0]);
		const body = await getFetchBody(fetchMock.mock.calls[0]);

		const url = new URL(rawUrl, "http://127.0.0.1:8000");
		expect(url.pathname).toBe(
			"/api/v1/assignments/client-sql-code-run/execute",
		);
		expect(method).toBe("POST");
		expect(body).toEqual(bodyData);
	});

	it("getJobStatus fetches status by taskId", async () => {
		const store = createTestStore();
		await store.dispatch(api.endpoints.getJobStatus.initiate("task-999"));

		expect(fetchMock).toHaveBeenCalled();
		const rawUrl = getFetchUrl(fetchMock.mock.calls[0]);
		const url = new URL(rawUrl, "http://127.0.0.1:8000");
		expect(url.pathname).toBe(
			"/api/v1/assignments/client-sql-code-run/status/task-999",
		);
	});

	it("getLastSql and saveLastSql request correct URLs", async () => {
		const store = createTestStore();

		await store.dispatch(api.endpoints.getLastSql.initiate("assign-456"));
		let rawUrl = getFetchUrl(fetchMock.mock.calls[0]);
		let url = new URL(rawUrl, "http://127.0.0.1:8000");
		expect(url.pathname).toBe("/api/v1/assignments/assign-456/last-sql");

		await store.dispatch(
			api.endpoints.saveLastSql.initiate({
				assignmentId: "assign-456",
				userSql: "SELECT 42;",
			}),
		);
		rawUrl = getFetchUrl(fetchMock.mock.calls[1]);
		const method = getFetchMethod(fetchMock.mock.calls[1]);
		const body = await getFetchBody(fetchMock.mock.calls[1]);
		url = new URL(rawUrl, "http://127.0.0.1:8000");
		expect(url.pathname).toBe("/api/v1/assignments/assign-456/last-sql");
		expect(method).toBe("POST");
		expect(body).toEqual({ userSql: "SELECT 42;" });
	});

	it("createAssignment posts to /api/v1/admin/assignments", async () => {
		const store = createTestStore();
		const payload = {
			title: "Test Assignment",
			description: "Desc",
			difficulty: "easy" as const,
			mode: "read" as const,
			schemaSql: "CREATE TABLE t (id INT);",
			querySql: "SELECT * FROM t;",
		};
		await store.dispatch(api.endpoints.createAssignment.initiate(payload));

		expect(fetchMock).toHaveBeenCalled();
		const rawUrl = getFetchUrl(fetchMock.mock.calls[0]);
		const method = getFetchMethod(fetchMock.mock.calls[0]);
		const body = await getFetchBody(fetchMock.mock.calls[0]);

		const url = new URL(rawUrl, "http://127.0.0.1:8000");
		expect(url.pathname).toBe("/api/v1/admin/assignments");
		expect(method).toBe("POST");
		expect(body).toEqual(payload);
	});

	it("getAdminAssignments fetches from /api/v1/admin/assignments", async () => {
		const store = createTestStore();
		await store.dispatch(api.endpoints.getAdminAssignments.initiate());

		expect(fetchMock).toHaveBeenCalled();
		const rawUrl = getFetchUrl(fetchMock.mock.calls[0]);
		const url = new URL(rawUrl, "http://127.0.0.1:8000");
		expect(url.pathname).toBe("/api/v1/admin/assignments");
	});

	it("getAdminUsers fetches from /api/v1/admin/users", async () => {
		const store = createTestStore();
		await store.dispatch(api.endpoints.getAdminUsers.initiate());

		expect(fetchMock).toHaveBeenCalled();
		const rawUrl = getFetchUrl(fetchMock.mock.calls[0]);
		const url = new URL(rawUrl, "http://127.0.0.1:8000");
		expect(url.pathname).toBe("/api/v1/admin/users");
	});

	it("setUserRole posts role to /api/v1/admin/users/:id/role", async () => {
		const store = createTestStore();
		await store.dispatch(
			api.endpoints.setUserRole.initiate({ id: "usr-789", role: "admin" }),
		);

		expect(fetchMock).toHaveBeenCalled();
		const rawUrl = getFetchUrl(fetchMock.mock.calls[0]);
		const method = getFetchMethod(fetchMock.mock.calls[0]);
		const body = await getFetchBody(fetchMock.mock.calls[0]);

		const url = new URL(rawUrl, "http://127.0.0.1:8000");
		expect(url.pathname).toBe("/api/v1/admin/users/usr-789/role");
		expect(method).toBe("POST");
		expect(body).toEqual({ role: "admin" });
	});

	it("getAdminAudit requests /api/v1/admin/audit?limit=50", async () => {
		const store = createTestStore();
		await store.dispatch(api.endpoints.getAdminAudit.initiate());

		expect(fetchMock).toHaveBeenCalled();
		const rawUrl = getFetchUrl(fetchMock.mock.calls[0]);
		const url = new URL(rawUrl, "http://127.0.0.1:8000");
		expect(url.pathname).toBe("/api/v1/admin/audit");
		expect(url.searchParams.get("limit")).toBe("50");
	});
});
