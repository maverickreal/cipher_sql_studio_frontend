import { afterEach, describe, expect, it } from "vitest";
import {
	applyTheme,
	DEFAULT_THEME,
	dracula,
	isThemeName,
	paletteFor,
	readStoredTheme,
	THEME_STORAGE_KEY,
} from "./palette";

describe("palette", () => {
	afterEach(() => {
		localStorage.clear();
		document.documentElement.className = "";
		delete document.documentElement.dataset.theme;
		document.documentElement.style.colorScheme = "";
	});

	it("defaults to dark / Dracula", () => {
		expect(DEFAULT_THEME).toBe("dark");
		expect(paletteFor("dark")).toBe(dracula);
		expect(dracula.bg).toBe("#282A36");
		expect(dracula.purple).toBe("#BD93F9");
	});

	it("Alucard uses cream background and contrast-safe purple", () => {
		const light = paletteFor("light");
		expect(light.bg).toBe("#FFFBEB");
		expect(light.fg).toBe("#1F1F1F");
		expect(light.purple).toBe("#644AC9");
	});

	it("readStoredTheme falls back to dark", () => {
		expect(readStoredTheme()).toBe("dark");
		localStorage.setItem(THEME_STORAGE_KEY, "light");
		expect(readStoredTheme()).toBe("light");
		localStorage.setItem(THEME_STORAGE_KEY, "nope");
		expect(readStoredTheme()).toBe("dark");
	});

	it("isThemeName only accepts light/dark", () => {
		expect(isThemeName("dark")).toBe(true);
		expect(isThemeName("system")).toBe(false);
	});

	it("applyTheme sets data-theme and classes", () => {
		applyTheme("light");
		expect(document.documentElement.dataset.theme).toBe("alucard");
		expect(document.documentElement.classList.contains("light")).toBe(true);
		expect(document.documentElement.classList.contains("dark")).toBe(false);
		applyTheme("dark");
		expect(document.documentElement.dataset.theme).toBe("dracula");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});
});
