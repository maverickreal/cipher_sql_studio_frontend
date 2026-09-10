import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router";
import { authClient } from "../services/authClient";
import type { RootState } from "../store";
import { useGetMyProfileQuery } from "../store/api";
import { ThemeToggle } from "../theme/ThemeToggle";
import { APP_NAME } from "../utils/constants";
import { Button } from "./ui/Button";

export function Navbar() {
	const user = useSelector((state: RootState) => state.auth.user);
	const sessionReady = useSelector(
		(state: RootState) => state.auth.sessionReady,
	);
	const location = useLocation();
	const navigate = useNavigate();

	const { data: profileData } = useGetMyProfileQuery(undefined, {
		skip: !sessionReady || !user,
	});
	const profile = profileData?.profile;

	const handleSignOut = async () => {
		await authClient.signOut();
		window.location.reload();
	};

	const isActive = (path: string) => location.pathname === path;

	return (
		<nav className="sticky top-0 z-50 border-surface-800 border-b bg-surface-950/80 backdrop-blur-lg">
			<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
				<div className="flex items-center gap-8">
					<Link
						to="/"
						className="flex items-center gap-2 font-bold text-brand-400 text-lg transition-colors hover:text-brand-300"
					>
						<svg
							aria-hidden="true"
							className="h-6 w-6"
							viewBox="0 0 32 32"
							fill="none"
						>
							<rect width="32" height="32" rx="6" fill="currentColor" />
							<text
								x="50%"
								y="54%"
								dominantBaseline="middle"
								textAnchor="middle"
								fill="#F8F8F2"
								fontFamily="monospace"
								fontSize="14"
								fontWeight="bold"
							>
								SQL
							</text>
						</svg>
						{APP_NAME}
					</Link>

					<div className="hidden items-center gap-1 sm:flex">
						<Link
							to="/assignments"
							className={`rounded-lg px-3 py-1.5 font-medium text-sm transition-colors ${isActive("/assignments") ? "bg-surface-800 text-fg" : "text-surface-400 hover:bg-surface-800/50 hover:text-surface-200"}`}
						>
							Assignments
						</Link>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<ThemeToggle />
					{!sessionReady ? (
						<div className="h-8 w-20 animate-pulse rounded-lg bg-surface-800" />
					) : user ? (
						<div className="relative flex items-center gap-2">
							{user.role === "admin" && (
								<Link
									to="/admin"
									className={`rounded-lg px-3 py-1.5 font-medium text-sm transition-colors ${location.pathname.startsWith("/admin") ? "bg-surface-800 text-fg" : "text-amber-400 hover:text-amber-300"}`}
								>
									Admin
								</Link>
							)}

							<div className="relative">
								<button
									type="button"
									className="flex items-center gap-2 rounded-lg bg-surface-800/50 px-3 py-1.5 transition-colors hover:bg-surface-800"
									id="user-menu-button"
									aria-expanded="false"
									aria-haspopup="true"
								>
									{profile?.avatarUrl ? (
										<img
											src={profile.avatarUrl}
											alt=""
											className="h-8 w-8 rounded-full object-cover"
										/>
									) : (
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-700 font-bold text-sm text-surface-400">
											{profile?.displayName?.[0]?.toUpperCase() ||
												user?.name?.[0]?.toUpperCase() ||
												user?.email[0]?.toUpperCase()}
										</div>
									)}
									<span className="hidden text-sm text-fg sm:block">
										{profile?.displayName || user?.name || user?.email}
									</span>
								</button>

								<div
									className="invisible absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-surface-800 bg-surface-900 opacity-0 shadow-lg ring-1 ring-surface-800/50 transition-all duration-200 group-hover:visible group-hover:opacity-100"
									role="menu"
									aria-orientation="vertical"
									aria-labelledby="user-menu-button"
								>
									<Link
										to="/profile"
										className="block rounded-t-xl px-4 py-2 text-sm text-surface-200 hover:bg-surface-800 hover:text-fg"
										role="menuitem"
									>
										Profile
									</Link>
									<hr className="my-1 border-surface-800" />
									<Button
										variant="ghost"
										className="w-full px-4 py-2 text-left text-red-400 text-sm hover:bg-transparent hover:text-red-300"
										onClick={handleSignOut}
									>
										Sign Out
									</Button>
								</div>
							</div>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => navigate("/signin")}
							>
								Sign In
							</Button>
							<Button size="sm" onClick={() => navigate("/signup")}>
								Get Started
							</Button>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
}
