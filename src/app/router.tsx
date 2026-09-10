import { createBrowserRouter } from "react-router";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorBoundary } from "./error-boundary";
import { RootLayout } from "./root-layout";

const LandingPage = () =>
	import("../features/auth/LandingPage").then((m) => ({
		Component: m.LandingPage,
	}));

const SignInPage = () =>
	import("../features/auth/SignInPage").then((m) => ({
		Component: m.SignInPage,
	}));

const SignUpPage = () =>
	import("../features/auth/SignUpPage").then((m) => ({
		Component: m.SignUpPage,
	}));

const AssignmentListPage = () =>
	import("../features/assignments/AssignmentListPage").then((m) => ({
		Component: m.AssignmentListPage,
		loader: m.assignmentListLoader,
	}));

const AssignmentDetailPage = () =>
	import("../features/assignments/AssignmentDetailPage").then((m) => ({
		Component: m.AssignmentDetailPage,
	}));

const CreateAssignmentPage = () =>
	import("../features/admin/CreateAssignmentPage").then((m) => ({
		Component: m.CreateAssignmentPage,
		loader: m.createAssignmentLoader,
	}));

const AdminLayout = () =>
	import("../features/admin/AdminLayout").then((m) => ({
		Component: m.AdminLayout,
		loader: m.adminLayoutLoader,
	}));

const AdminIndexRedirect = () =>
	import("../features/admin/AdminLayout").then((m) => ({
		Component: m.AdminIndexRedirect,
	}));

const AssignmentsAdminPage = () =>
	import("../features/admin/AssignmentsAdminPage").then((m) => ({
		Component: m.AssignmentsAdminPage,
		loader: m.assignmentsAdminLoader,
	}));

const UsersAdminPage = () =>
	import("../features/admin/UsersAdminPage").then((m) => ({
		Component: m.UsersAdminPage,
		loader: m.usersAdminLoader,
	}));

const AuditAdminPage = () =>
	import("../features/admin/AuditAdminPage").then((m) => ({
		Component: m.AuditAdminPage,
		loader: m.auditAdminLoader,
	}));

const ProfilePage = () =>
	import("../features/profile/ProfilePage").then((m) => ({
		Component: m.ProfilePage,
		loader: m.profileLoader,
	}));

const PublicProfilePage = () =>
	import("../features/profile/PublicProfilePage").then((m) => ({
		Component: m.PublicProfilePage,
		loader: m.publicProfileLoader,
	}));

const LeaderboardPage = () =>
	import("../features/leaderboard/LeaderboardPage").then((m) => ({
		Component: m.LeaderboardPage,
	}));

export const router = createBrowserRouter([
	{
		path: "/",
		element: <RootLayout />,
		errorElement: <ErrorBoundary />,
		hydrateFallbackElement: <LoadingSpinner className="min-h-screen" />,
		children: [
			{ index: true, lazy: LandingPage },
			{ path: "signin", lazy: SignInPage },
			{ path: "signup", lazy: SignUpPage },
			{ path: "assignments", lazy: AssignmentListPage },
			{ path: "assignments/:id", lazy: AssignmentDetailPage },
			{ path: "profile", lazy: ProfilePage },
			{ path: "profile/:id", lazy: PublicProfilePage },
			{ path: "leaderboard", lazy: LeaderboardPage },
			{
				path: "admin",
				lazy: AdminLayout,
				children: [
					{ index: true, lazy: AdminIndexRedirect },
					{ path: "assignments", lazy: AssignmentsAdminPage },
					{ path: "users", lazy: UsersAdminPage },
					{ path: "audit", lazy: AuditAdminPage },
				],
			},
			{ path: "admin/assignments/new", lazy: CreateAssignmentPage },
		],
	},
]);
