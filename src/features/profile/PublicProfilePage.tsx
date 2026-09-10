import { motion } from "motion/react";
import { useParams } from "react-router";
import { useGetPublicProfileQuery } from "../../store/api";

function PublicProfilePageContent() {
	const params = useParams<{ id: string }>();
	const {
		data: profileData,
		isLoading,
		error,
	} = useGetPublicProfileQuery(params.id ?? "");

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<div
					className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"
					role="status"
					aria-label="Loading profile"
				/>
			</div>
		);
	}

	if (error) {
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="mx-auto max-w-2xl text-center"
			>
				<span className="text-4xl">🔒</span>
				<p className="mt-3 font-medium text-lg text-surface-300">
					Profile Not Found
				</p>
				<p className="mt-1 text-sm text-surface-500">
					This profile doesn't exist or is private.
				</p>
			</motion.div>
		);
	}

	if (!profileData?.profile) {
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="mx-auto max-w-2xl text-center"
			>
				<span className="text-4xl">🔒</span>
				<p className="mt-3 font-medium text-lg text-surface-300">
					Profile Not Found
				</p>
				<p className="mt-1 text-sm text-surface-500">
					This profile doesn't exist or is private.
				</p>
			</motion.div>
		);
	}

	const profile = profileData.profile;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="mx-auto max-w-2xl"
		>
			<div className="rounded-2xl border border-surface-800 bg-surface-900/50 p-6 text-center md:p-8">
				{/* Avatar */}
				<div className="relative mx-auto mb-6 h-32 w-32 flex-shrink-0">
					{profile.avatarUrl ? (
						<img
							src={profile.avatarUrl}
							alt={`${profile.displayName}'s avatar`}
							className="h-full w-full rounded-full border-2 border-surface-700 object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center rounded-full bg-surface-700 font-bold text-5xl text-surface-400">
							{profile.displayName[0]?.toUpperCase()}
						</div>
					)}
				</div>

				{/* Display Name */}
				<h1 className="mb-2 font-bold text-2xl text-fg">
					{profile.displayName}
				</h1>

				{/* Bio */}
				{profile.bio && (
					<p className="mx-auto mb-6 max-w-md text-surface-300 leading-relaxed">
						{profile.bio}
					</p>
				)}

				{/* Stats */}
				<div className="grid grid-cols-3 gap-4 border-surface-800 border-t pt-6">
					<div>
						<p className="font-bold text-2xl text-fg">
							{profile.stats.assignmentsCompleted}
						</p>
						<p className="mt-1 text-surface-500 text-xs">Assignments</p>
					</div>
					<div>
						<p className="font-bold text-2xl text-fg">
							{profile.stats.totalExecutions}
						</p>
						<p className="mt-1 text-surface-500 text-xs">Executions</p>
					</div>
					<div>
						<p className="font-bold text-2xl text-fg">
							{profile.stats.lastActiveAt
								? new Date(profile.stats.lastActiveAt).toLocaleDateString(
										undefined,
										{ month: "short", day: "numeric" },
									)
								: "—"}
						</p>
						<p className="mt-1 text-surface-500 text-xs">Last Active</p>
					</div>
				</div>

				{/* Member since */}
				<p className="mt-6 text-sm text-surface-500">
					Member since{" "}
					{new Date(profile.createdAt).toLocaleDateString(undefined, {
						year: "numeric",
						month: "long",
					})}
				</p>
			</div>
		</motion.div>
	);
}

export function PublicProfilePage() {
	return (
		<div className="min-h-screen bg-surface-950 px-4 py-12">
			<PublicProfilePageContent />
		</div>
	);
}

export async function publicProfileLoader(_params: { params: { id: string } }) {
	return null;
}
