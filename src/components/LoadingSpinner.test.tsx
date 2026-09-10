import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LoadingSpinner } from "./LoadingSpinner";

describe("LoadingSpinner", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders a lucide loader named Loading", () => {
		const { container } = render(<LoadingSpinner />);
		expect(screen.getByLabelText("Loading")).toBeTruthy();
		expect(container.querySelector("svg.lucide")).toBeTruthy();
	});
});
