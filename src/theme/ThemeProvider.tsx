import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import {
	applyTheme,
	DEFAULT_THEME,
	persistTheme,
	readStoredTheme,
	type ThemeName,
} from "./palette";

interface ThemeContextValue {
	theme: ThemeName;
	setTheme: (theme: ThemeName) => void;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function initialTheme(): ThemeName {
	if (typeof document === "undefined") return DEFAULT_THEME;
	const fromDom = document.documentElement.dataset.theme;
	if (fromDom === "alucard") return "light";
	if (fromDom === "dracula") return "dark";
	return readStoredTheme();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<ThemeName>(() => {
		const next = initialTheme();
		if (typeof document !== "undefined") applyTheme(next);
		return next;
	});

	const setTheme = useCallback((next: ThemeName) => {
		applyTheme(next);
		persistTheme(next);
		setThemeState(next);
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme(theme === "dark" ? "light" : "dark");
	}, [setTheme, theme]);

	const value = useMemo(
		() => ({ theme, setTheme, toggleTheme }),
		[theme, setTheme, toggleTheme],
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) {
		return {
			theme: DEFAULT_THEME,
			setTheme: () => {},
			toggleTheme: () => {},
		};
	}
	return ctx;
}
