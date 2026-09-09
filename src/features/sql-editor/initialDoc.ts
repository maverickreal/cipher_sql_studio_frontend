export const DEFAULT_SQL = "SELECT * FROM users LIMIT 5;";

export function initialDoc(initialSql: string | null | undefined): string {
	return initialSql ? initialSql : DEFAULT_SQL;
}
