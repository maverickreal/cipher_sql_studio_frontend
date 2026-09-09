import { Link } from "react-router";
import { Button } from "../../components/ui/Button";
import { useGetAdminAssignmentsQuery } from "../../store/api";
import { getErrorMessage } from "../../utils/errors";

export function AssignmentsAdminPage() {
	const { data, error, isLoading, refetch } = useGetAdminAssignmentsQuery();

	if (isLoading) {
		return <p className="text-sm text-surface-400">Loading assignments…</p>;
	}

	if (error) {
		return (
			<div className="rounded-lg border border-red-800 bg-red-950/30 p-4">
				<p className="text-red-400 text-sm">
					{getErrorMessage(error, "Failed to load assignments")}
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
				<h2 className="font-semibold text-lg text-white">
					Assignments ({data?.total ?? items.length})
				</h2>
				<Link
					to="/admin/assignments/new"
					className="rounded-lg bg-brand-500 px-3 py-1.5 font-medium text-sm text-white transition-colors hover:bg-brand-400"
				>
					New assignment
				</Link>
			</div>
			<div className="overflow-x-auto rounded-lg border border-surface-800">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-surface-800 border-b bg-surface-900">
							{["Title", "Difficulty", "Mode", "Created"].map((col) => (
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
						{items.map((row) => (
							<tr
								key={row._id}
								className="border-surface-800/50 border-b transition-colors last:border-0 hover:bg-surface-900/50"
							>
								<td className="px-4 py-2 text-surface-200">{row.title}</td>
								<td className="px-4 py-2 font-mono text-surface-200">
									{row.difficulty}
								</td>
								<td className="px-4 py-2 font-mono text-surface-200">
									{row.mode}
								</td>
								<td className="px-4 py-2 font-mono text-surface-200">
									{row.createdAt
										? new Date(row.createdAt).toLocaleString()
										: "—"}
								</td>
							</tr>
						))}
						{items.length === 0 && (
							<tr>
								<td
									colSpan={4}
									className="px-4 py-6 text-center text-surface-400"
								>
									No assignments yet.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export async function assignmentsAdminLoader() {
	return null;
}
