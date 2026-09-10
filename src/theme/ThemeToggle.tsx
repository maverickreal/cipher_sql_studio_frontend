import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();
	const isDark = theme === "dark";

	return (
		<button
			type="button"
			onClick={toggleTheme}
			aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
			title={isDark ? "Alucard (light)" : "Dracula (dark)"}
			className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-800 bg-surface-900 text-brand-400 transition-colors hover:bg-surface-800 hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
		>
			{isDark ? (
				<Sun aria-hidden="true" className="h-4 w-4" />
			) : (
				<Moon aria-hidden="true" className="h-4 w-4" />
			)}
		</button>
	);
}
