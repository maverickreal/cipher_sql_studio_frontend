import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
	Assignment,
	AssignmentDetail,
	CreateAssignmentPayload,
	JobStatus,
	SqlExecutionRequest,
} from "../types";
import type {
	ProfileUpdateBody,
	PublicProfile,
	UserProfile,
} from "../types/profile";

export interface AssignmentsQueryParams {
	page?: number;
	limit?: number;
	q?: string;
	difficulty?: string;
	mode?: string;
	origin?: string;
	sort?: "createdAt" | "title";
	order?: "asc" | "desc";
}

export interface AssignmentsResponse {
	assignments: Assignment[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface AdminAssignmentRow {
	_id: string;
	title: string;
	difficulty: string;
	mode: string;
	createdAt: string;
}

export interface AdminUserRow {
	id: string;
	email: string;
	name: string;
	role: string;
}

export interface AdminAuditRow {
	_id?: string;
	at: string;
	actorId: string;
	action: string;
	targetType: string;
	targetId: string;
	meta?: { from?: string; to?: string };
}

export const api = createApi({
	reducerPath: "api",

	baseQuery: fetchBaseQuery({
		baseUrl: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
		credentials: "include",
	}),

	tagTypes: [
		"Assignments",
		"Assignment",
		"AdminUsers",
		"AdminAudit",
		"Profile",
	],

	endpoints: (builder) => ({
		getAssignments: builder.query<AssignmentsResponse, AssignmentsQueryParams>({
			query: ({
				page = 1,
				limit = 20,
				q,
				difficulty,
				mode,
				origin,
				sort,
				order,
			} = {}) => {
				const params = new URLSearchParams({
					page: String(page),
					limit: String(limit),
				});
				if (q?.trim()) params.set("q", q.trim());
				if (difficulty) params.set("filter[difficulty]", difficulty);
				if (mode) params.set("filter[mode]", mode);
				if (origin) params.set("filter[origin]", origin);
				if (sort) params.set("sort", sort);
				if (order) params.set("order", order);
				return `/api/v1/assignments?${params.toString()}`;
			},
			providesTags: ["Assignments"],
		}),

		getAssignmentById: builder.query<{ assignment: AssignmentDetail }, string>({
			query: (id) => `/api/v1/assignments/${id}`,
			providesTags: (_result, _error, id) => [{ type: "Assignment", id }],
		}),

		executeSql: builder.mutation<{ taskId: string }, SqlExecutionRequest>({
			query: (body) => ({
				url: "/api/v1/assignments/client-sql-code-run/execute",
				method: "POST",
				body,
			}),
		}),

		getJobStatus: builder.query<JobStatus, string>({
			query: (taskId) =>
				`/api/v1/assignments/client-sql-code-run/status/${taskId}`,
			keepUnusedDataFor: 0,
		}),

		getLastSql: builder.query<
			{ userSql: string | null; updatedAt?: string },
			string
		>({
			query: (assignmentId) => `/api/v1/assignments/${assignmentId}/last-sql`,
		}),

		saveLastSql: builder.mutation<
			{ success: boolean },
			{ assignmentId: string; userSql: string }
		>({
			query: ({ assignmentId, userSql }) => ({
				url: `/api/v1/assignments/${assignmentId}/last-sql`,
				method: "POST",
				body: { userSql },
			}),
		}),

		createAssignment: builder.mutation<
			{ assignmentId: string; jobId: string },
			CreateAssignmentPayload
		>({
			query: (body) => ({
				url: "/api/v1/admin/assignments",
				method: "POST",
				body,
			}),
			invalidatesTags: ["Assignments", "AdminAudit"],
		}),

		getAdminAssignments: builder.query<
			{ items: AdminAssignmentRow[]; total?: number },
			void
		>({
			query: () => "/api/v1/admin/assignments",
		}),

		getAdminUsers: builder.query<
			{ items: AdminUserRow[]; total?: number },
			void
		>({
			query: () => "/api/v1/admin/users",
			providesTags: ["AdminUsers"],
		}),

		setUserRole: builder.mutation<
			{ user: AdminUserRow },
			{ id: string; role: "admin" | "user" }
		>({
			query: ({ id, role }) => ({
				url: `/api/v1/admin/users/${id}/role`,
				method: "POST",
				body: { role },
			}),
			invalidatesTags: ["AdminUsers", "AdminAudit"],
		}),

		getAdminAudit: builder.query<
			{ items: AdminAuditRow[]; total?: number },
			void
		>({
			query: () => "/api/v1/admin/audit?limit=50",
			providesTags: ["AdminAudit"],
		}),

		getMyProfile: builder.query<{ profile: UserProfile }, void>({
			query: () => "/api/v1/profile/me",
			providesTags: ["Profile"],
		}),

		updateMyProfile: builder.mutation<
			{ profile: UserProfile },
			ProfileUpdateBody
		>({
			query: (body) => ({ url: "/api/v1/profile/me", method: "PATCH", body }),
			invalidatesTags: ["Profile"],
			async onQueryStarted(body, { dispatch, queryFulfilled }) {
				const patchResult = dispatch(
					api.util.updateQueryData("getMyProfile", undefined, (draft) => {
						Object.assign(draft.profile, body);
					}),
				);
				try {
					await queryFulfilled;
				} catch {
					patchResult.undo();
				}
			},
		}),

		getPublicProfile: builder.query<{ profile: PublicProfile }, string>({
			query: (id) => `/api/v1/profile/${id}`,
			providesTags: (_r, _e, id) => [{ type: "Profile", id }],
		}),
	}),
});

export const {
	useGetAssignmentsQuery,
	useGetAssignmentByIdQuery,
	useExecuteSqlMutation,
	useGetJobStatusQuery,
	useGetLastSqlQuery,
	useSaveLastSqlMutation,
	useCreateAssignmentMutation,
	useGetAdminAssignmentsQuery,
	useGetAdminUsersQuery,
	useSetUserRoleMutation,
	useGetAdminAuditQuery,
	useGetMyProfileQuery,
	useUpdateMyProfileMutation,
	useGetPublicProfileQuery,
} = api;
