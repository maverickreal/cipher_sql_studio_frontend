import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./errors";

describe("getErrorMessage utility", () => {
	const defaultFallback = "An unexpected error occurred.";

	it("extracts error string from RTK error object with data.error", () => {
		const rtkErr = {
			status: 400,
			data: { error: "Invalid input parameters" },
		};
		expect(getErrorMessage(rtkErr, defaultFallback)).toBe(
			"Invalid input parameters",
		);
	});

	it("extracts message string from RTK error object with data.message", () => {
		const rtkErr = {
			status: 500,
			data: { message: "Internal server failed" },
		};
		expect(getErrorMessage(rtkErr, defaultFallback)).toBe(
			"Internal server failed",
		);
	});

	it("returns data directly when RTK error data is a string", () => {
		const rtkErr = {
			status: 403,
			data: "Access forbidden",
		};
		expect(getErrorMessage(rtkErr, defaultFallback)).toBe("Access forbidden");
	});

	it("extracts message from standard Error object or object with message property", () => {
		const standardErr = new Error("Network disconnected");
		expect(getErrorMessage(standardErr, defaultFallback)).toBe(
			"Network disconnected",
		);

		const customObjErr = { message: "Custom message error" };
		expect(getErrorMessage(customObjErr, defaultFallback)).toBe(
			"Custom message error",
		);
	});

	it("returns fallback message when error is null, undefined, primitive or unknown format", () => {
		expect(getErrorMessage(null, defaultFallback)).toBe(defaultFallback);
		expect(getErrorMessage(undefined, defaultFallback)).toBe(defaultFallback);
		expect(getErrorMessage(12345, defaultFallback)).toBe(defaultFallback);
		expect(getErrorMessage({}, defaultFallback)).toBe(defaultFallback);
		expect(getErrorMessage({ data: {} }, defaultFallback)).toBe(
			defaultFallback,
		);
	});
});
