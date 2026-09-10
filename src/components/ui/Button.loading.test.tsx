import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button loading spinner", () => {
	afterEach(() => {
		cleanup();
	});

	it("shows a lucide spinner when loading", () => {
		const { container } = render(<Button loading>Save</Button>);
		expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
		expect(container.querySelector("svg.lucide")).toBeTruthy();
	});
});
