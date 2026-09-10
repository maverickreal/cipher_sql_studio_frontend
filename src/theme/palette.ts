export type ThemeName = "dark" | "light";

export const THEME_STORAGE_KEY = "mss-theme";
export const DEFAULT_THEME: ThemeName = "dark";

/** Official Dracula palette (https://draculatheme.com/spec). */
export const dracula = {
	bg: "#282A36",
	bgAlt: "#21222C",
	currentLine: "#44475A",
	selection: "#44475A",
	fg: "#F8F8F2",
	comment: "#6272A4",
	cyan: "#8BE9FD",
	green: "#50FA7B",
	orange: "#FFB86C",
	pink: "#FF79C6",
	purple: "#BD93F9",
	red: "#FF5555",
	yellow: "#F1FA8C",
	onAccent: "#F8F8F2",
} as const;

/**
 * Alucard (official light counterpart).
 * Surfaces from the published Alucard sheet; accents are the same hues
 * darkened so body text/buttons meet contrast on #FFFBEB.
 */
export const alucard = {
	bg: "#FFFBEB",
	bgAlt: "#F3EDD8",
	currentLine: "#E8E0C8",
	selection: "#CFCFDE",
	fg: "#1F1F1F",
	comment: "#6C664B",
	cyan: "#036A96",
	green: "#14710A",
	orange: "#A34D14",
	pink: "#A00F5E",
	purple: "#644AC9",
	red: "#CB3A2A",
	yellow: "#846E15",
	onAccent: "#F8F8F2",
} as const;

export type Palette = {
	bg: string;
	bgAlt: string;
	currentLine: string;
	selection: string;
	fg: string;
	comment: string;
	cyan: string;
	green: string;
	orange: string;
	pink: string;
	purple: string;
	red: string;
	yellow: string;
	onAccent: string;
};

export function isThemeName(value: unknown): value is ThemeName {
	return value === "dark" || value === "light";
}

export function paletteFor(theme: ThemeName): Palette {
	return theme === "light" ? alucard : dracula;
}

export function readStoredTheme(): ThemeName {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		if (isThemeName(stored)) return stored;
	} catch {
		// private mode / SSR
	}
	return DEFAULT_THEME;
}

export function persistTheme(theme: ThemeName): void {
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		// ignore quota / private mode
	}
}

export function applyTheme(theme: ThemeName): void {
	const root = document.documentElement;
	root.classList.toggle("dark", theme === "dark");
	root.classList.toggle("light", theme === "light");
	root.dataset.theme = theme === "dark" ? "dracula" : "alucard";
	root.style.colorScheme = theme === "dark" ? "dark" : "light";
}
