import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { Button } from "../components/ui/Button";

export function ErrorBoundary() {
	const error = useRouteError();

	let title = "Something went wrong";
	let message = "An unexpected error occurred.";

	if (isRouteErrorResponse(error)) {
		if (error.status === 404) {
			title = "Page not found";
			message = "The page you're looking for doesn't exist.";
		} else if (error.status === 401) {
			title = "Authentication required";
			message = "Please sign in to access this page.";
		} else if (error.status === 403) {
			title = "Access denied";
			message = "You don't have permission to access this page.";
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<div className="text-center">
				<h1 className="font-bold text-4xl text-fg">{title}</h1>
				<p className="mt-3 text-surface-400">{message}</p>
				<div className="mt-6 flex items-center justify-center gap-3">
					<Link to="/">
						<Button>Go Home</Button>
					</Link>
					<Link to="/signin">
						<Button variant="secondary">Sign In</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
