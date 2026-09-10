import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router";
import { authClient } from "../services/authClient";
import type { RootState } from "../store";
import { APP_NAME } from "../utils/constants";
import { Button } from "./ui/Button";

export function Navbar() {
  const user = useSelector((state: RootState) => state.auth.user);
  const sessionReady = useSelector(
    (state: RootState) => state.auth.sessionReady,
  );
  const location = useLocation();
  const navigate = useNavigate();

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
                fill="#fff"
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
              className={`rounded-lg px-3 py-1.5 font-medium text-sm transition-colors ${isActive("/assignments") ? "bg-surface-800 text-white" : "text-surface-400 hover:bg-surface-800/50 hover:text-surface-200"}`}
            >
              Assignments
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!sessionReady ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-surface-800" />
          ) : user ? (
            <div className="flex items-center gap-2 relative">
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className={`rounded-lg px-3 py-1.5 font-medium text-sm transition-colors ${location.pathname.startsWith("/admin") ? "bg-surface-800 text-white" : "text-amber-400 hover:text-amber-300"}`}
                >
                  Admin
                </Link>
              )}

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/50 hover:bg-surface-800 transition-colors"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt=""
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-surface-700 flex items-center justify-center text-sm font-bold text-surface-400">
                      {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden text-sm text-white sm:block">
                    {user.name || user.email}
                  </span>
                </button>

                <div
                  className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-surface-900 border border-surface-800 shadow-lg ring-1 ring-surface-800/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-surface-200 hover:bg-surface-800 hover:text-white rounded-t-xl"
                    role="menuitem"
                  >
                    Profile
                  </Link>
                  <hr className="my-1 border-surface-800" />
                  <Button
                    variant="ghost"
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-transparent"
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
