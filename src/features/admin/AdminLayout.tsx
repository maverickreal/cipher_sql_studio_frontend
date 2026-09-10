import { useSelector } from "react-redux";
import { Link, Navigate, Outlet, useLocation } from "react-router";
import { PageTransition } from "../../components/PageTransition";
import type { RootState } from "../../store";

export const ADMIN_BLOCK_MESSAGE = "Admin access required";

export function AdminLayout() {
	const user = useSelector((state: RootState) => state.auth.user);
	const sessionReady = useSelector(
		(state: RootState) => state.auth.sessionReady,
	);
	const location = useLocation();

	if (sessionReady && user?.role !== "admin") {
		return (
			<PageTransition>
				<div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
					<div className="rounded-lg border border-amber-800 bg-amber-950/30 p-6 text-center">
						<p className="text-amber-400">
							{ADMIN_BLOCK_MESSAGE} to view the admin area.
						</p>
					</div>
				</div>
			</PageTransition>
		);
	}

	const tab = (to: string, label: string) => {
		const active =
			location.pathname === to ||
			(location.pathname === "/admin" && to === "/admin/assignments");
		return (
			<Link
				key={to}
				to={to}
				className={`rounded-lg px-3 py-1.5 font-medium text-sm transition-colors ${active ? "bg-surface-800 text-fg" : "text-surface-400 hover:bg-surface-800/50 hover:text-surface-200"}`}
			>
				{label}
			</Link>
		);
	};

	return (
		<PageTransition>
			<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
				<h1 className="font-bold text-2xl text-fg">Admin</h1>
				<nav className="mt-4 flex items-center gap-1">
					{tab("/admin/assignments", "Assignments")}
					{tab("/admin/users", "Users")}
					{tab("/admin/audit", "Audit")}
				</nav>
				<div className="mt-6">
					<Outlet />
				</div>
			</div>
		</PageTransition>
	);
}

export function AdminIndexRedirect() {
	return <Navigate to="/admin/assignments" replace />;
}

export async function adminLayoutLoader() {
	return null;
}
