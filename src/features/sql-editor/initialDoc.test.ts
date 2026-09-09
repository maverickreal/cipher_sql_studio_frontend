import { describe, expect, it } from "vitest";
import { DEFAULT_SQL, initialDoc } from "./initialDoc";

describe("initialDoc helper", () => {
	it("uses last-sql userSql when present", () => {
		const lastSql = { userSql: "SELECT 1" };
		expect(initialDoc(lastSql?.userSql ?? null)).toBe("SELECT 1");
	});

	it("falls back to default SQL when last-sql is null", () => {
		expect(initialDoc(null)).toBe(DEFAULT_SQL);
		expect(initialDoc(null)).not.toBe("SELECT 1");
	});

	it("falls back to default SQL when last-sql is undefined or empty", () => {
		expect(initialDoc(undefined)).toBe(DEFAULT_SQL);
		expect(initialDoc("")).toBe(DEFAULT_SQL);
	});
});
