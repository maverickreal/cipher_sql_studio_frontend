import { Button } from "../../components/ui/Button";
import { useGetAdminAuditQuery } from "../../store/api";
import { getErrorMessage } from "../../utils/errors";

export function AuditAdminPage() {
	const { data, error, isLoading, refetch } = useGetAdminAuditQuery();

	if (isLoading) {
		return <p className="text-sm text-surface-400">Loading audit log…</p>;
	}

	if (error) {
		return (
			<div className="rounded-lg border border-red-800 bg-red-950/30 p-4">
				<p className="text-red-400 text-sm">
					{getErrorMessage(error, "Failed to load audit log")}
				</p>
				<Button
					variant="ghost"
					size="sm"
					className="mt-2"
					onClick={() => refetch()}
				>
					Retry
				</Button>
			</div>
		);
	}

	const items = data?.items ?? [];

	return (
		<div>
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-semibold text-fg text-lg">
					Audit ({data?.total ?? items.length})
				</h2>
			</div>
			<div className="overflow-x-auto rounded-lg border border-surface-800">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-surface-800 border-b bg-surface-900">
							{["At", "Actor", "Action", "Target", "Target ID"].map((col) => (
								<th
									key={col}
									className="px-4 py-2 text-left font-medium text-surface-400"
								>
									{col}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{items.map((row, i) => (
							<tr
								key={row._id ?? `${row.at}-${row.actorId}-${row.targetId}-${i}`}
								className="border-surface-800/50 border-b transition-colors last:border-0 hover:bg-surface-900/50"
							>
								<td className="px-4 py-2 font-mono text-surface-200">
									{row.at ? new Date(row.at).toLocaleString() : "—"}
								</td>
								<td className="px-4 py-2 font-mono text-surface-200">
									{row.actorId}
								</td>
								<td className="px-4 py-2 font-mono text-surface-200">
									{row.action}
								</td>
								<td className="px-4 py-2 font-mono text-surface-200">
									{row.targetType}
								</td>
								<td className="px-4 py-2 font-mono text-surface-200">
									{row.targetId}
								</td>
							</tr>
						))}
						{items.length === 0 && (
							<tr>
								<td
									colSpan={5}
									className="px-4 py-6 text-center text-surface-400"
								>
									No audit events yet.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export async function auditAdminLoader() {
	return null;
}
