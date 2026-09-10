import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
	afterEach(() => {
		cleanup();
	});

	it("uses pointer cursor when enabled", () => {
		render(<Button>Go</Button>);
		expect(screen.getByRole("button", { name: "Go" }).className).toContain(
			"cursor-pointer",
		);
	});

	it("uses not-allowed cursor when disabled", () => {
		render(<Button disabled>Go</Button>);
		expect(screen.getByRole("button", { name: "Go" }).className).toContain(
			"cursor-not-allowed",
		);
	});
});
