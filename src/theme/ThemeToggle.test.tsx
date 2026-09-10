import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { THEME_STORAGE_KEY } from "./palette";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

function renderToggle() {
	return render(
		<ThemeProvider>
			<ThemeToggle />
		</ThemeProvider>,
	);
}

describe("ThemeToggle", () => {
	afterEach(() => {
		cleanup();
		localStorage.clear();
		document.documentElement.className = "";
		delete document.documentElement.dataset.theme;
	});

	it("defaults to dark and switches to Alucard", () => {
		renderToggle();
		const button = screen.getByRole("button", {
			name: "Switch to light theme",
		});
		fireEvent.click(button);
		expect(document.documentElement.dataset.theme).toBe("alucard");
		expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
		expect(
			screen.getByRole("button", { name: "Switch to dark theme" }),
		).toBeTruthy();
	});
});
