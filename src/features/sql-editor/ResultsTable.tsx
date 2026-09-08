import { motion } from "motion/react";
import { Badge } from "../../components/ui/Badge";
import { Table } from "../../components/ui/Table";
import type { SqlExecutionResult } from "../../types";

interface ResultsTableProps {
	result: SqlExecutionResult;
}

export function ResultsTable({ result }: ResultsTableProps) {
	if (!result.success) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				className="rounded-lg border border-red-800 bg-red-950/30 p-4"
			>
				<h3 className="font-semibold text-red-400 text-sm">Error</h3>
				<p className="mt-1 font-mono text-red-300 text-sm">{result.error}</p>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			className="space-y-3"
		>
			<div className="flex items-center gap-3">
				{result.passed === true ? (
					<Badge variant="success">Passed</Badge>
				) : result.passed === false ? (
					<Badge variant="danger">Failed</Badge>
				) : (
					<Badge variant="success">Success</Badge>
				)}
				<span className="text-surface-400 text-xs">
					{result.rowCount} row{result.rowCount !== 1 ? "s" : ""} in{" "}
					{result.executionTimeMs}ms
				</span>
			</div>

			<Table columns={result.columns} rows={result.rows} />
		</motion.div>
	);
}
