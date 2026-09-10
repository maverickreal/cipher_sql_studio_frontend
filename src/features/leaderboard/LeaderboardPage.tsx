import { useState } from "react";
import { useGetLeaderboardQuery } from "../../store/api";
import { Table } from "../../components/ui/Table";

function formatRelativeTime(isoString: string): string {
	const date = new Date(isoString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMins < 1) return "just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 30) return `${diffDays}d ago`;
	return date.toLocaleDateString();
}

function truncateUserId(userId: string): string {
	if (userId.length <= 8) return userId;
	return `u_${userId.slice(0, 6)}...`;
}

export function LeaderboardPage() {
	const [offset, setOffset] = useState(0);
	const { data, error, isLoading } = useGetLeaderboardQuery({
		limit: 50,
		offset: 0,
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<p className="text-gray-500">Loading leaderboard...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
				<p className="text-red-500">Failed to load leaderboard</p>
				<button
					className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
					onClick={() => window.location.reload()}
				>
					Retry
				</button>
			</div>
		);
	}

	const entries = data?.entries ?? [];
	const total = data?.total ?? 0;

	if (entries.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<p className="text-gray-500">No passes yet. Be the first to solve an assignment!</p>
			</div>
		);
	}

	const columns = ["Rank", "Handle", "Passes", "Last Active"];
	const rows = entries.map((entry, index) => ({
		Rank: offset + index + 1,
		Handle: entry.displayName || truncateUserId(entry.userId),
		Passes: entry.passes,
		"Last Active": formatRelativeTime(entry.lastPassAt),
	}));

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
					Leaderboard
				</h1>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Ranked by real assignment passes
				</p>
			</div>

			<Table columns={columns} rows={rows} />

			{total > offset + entries.length && (
				<div className="mt-6 text-center">
					<button
						className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
						onClick={() => setOffset((prev) => prev + 50)}
					>
						Load more
					</button>
				</div>
			)}
		</div>
	);
}