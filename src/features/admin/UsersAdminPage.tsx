import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { useGetAdminUsersQuery, useSetUserRoleMutation } from "../../store/api";
import { getErrorMessage } from "../../utils/errors";

export function UsersAdminPage() {
	const { data, error, isLoading, refetch } = useGetAdminUsersQuery();
	const [setRole, { isLoading: isSaving }] = useSetUserRoleMutation();
	const [actionError, setActionError] = useState("");

	if (isLoading) {
		return <p className="text-sm text-surface-400">Loading users…</p>;
	}

	if (error) {
		return (
			<div className="rounded-lg border border-red-800 bg-red-950/30 p-4">
				<p className="text-red-400 text-sm">
					{getErrorMessage(error, "Failed to load users")}
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

	const handleRoleChange = async (
		id: string,
		currentRole: string,
		next: "admin" | "user",
	) => {
		if (currentRole === next) return;
		const ok = window.confirm(
			next === "admin"
				? "Promote this user to admin?"
				: "Demote this admin to user?",
		);
		if (!ok) return;
		setActionError("");
		try {
			await setRole({ id, role: next }).unwrap();
		} catch (err) {
			setActionError(getErrorMessage(err, "Failed to change role"));
		}
	};

	return (
		<div>
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-semibold text-lg text-white">
					Users ({data?.total ?? items.length})
				</h2>
			</div>
			{actionError && (
				<div className="mb-4 rounded-lg border border-red-800 bg-red-950/30 p-3">
					<p className="text-red-400 text-sm">{actionError}</p>
				</div>
			)}
			<div className="overflow-x-auto rounded-lg border border-surface-800">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-surface-800 border-b bg-surface-900">
							{["Email", "Name", "Role", "Actions"].map((col) => (
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
								key={row.id}
								className="border-surface-800/50 border-b transition-colors last:border-0 hover:bg-surface-900/50"
							>
								<td className="px-4 py-2 text-surface-200">{row.email}</td>
								<td className="px-4 py-2 text-surface-200">{row.name}</td>
								<td className="px-4 py-2 font-mono text-surface-200">
									{row.role}
								</td>
								<td className="px-4 py-2">
									{row.role === "admin" ? (
										<Button
											variant="ghost"
											size="sm"
											disabled={isSaving}
											onClick={() => handleRoleChange(row.id, row.role, "user")}
										>
											Demote
										</Button>
									) : (
										<Button
											variant="ghost"
											size="sm"
											disabled={isSaving}
											onClick={() =>
												handleRoleChange(row.id, row.role, "admin")
											}
										>
											Promote
										</Button>
									)}
								</td>
							</tr>
						))}
						{items.length === 0 && (
							<tr>
								<td
									colSpan={4}
									className="px-4 py-6 text-center text-surface-400"
								>
									No users found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export async function usersAdminLoader() {
	return null;
}
