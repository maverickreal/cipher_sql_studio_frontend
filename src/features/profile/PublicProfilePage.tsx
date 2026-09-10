import { motion } from "motion/react";
import { useParams } from "react-router";
import { useGetPublicProfileQuery } from "../../store/api";

function PublicProfilePageContent() {
  const params = useParams<{ id: string }>();
  const { data: profileData, isLoading, error } = useGetPublicProfileQuery(params.id ?? "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent"
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
        className="max-w-2xl mx-auto text-center"
      >
        <span className="text-4xl">🔒</span>
        <p className="mt-3 font-medium text-lg text-surface-300">Profile Not Found</p>
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
        className="max-w-2xl mx-auto text-center"
      >
        <span className="text-4xl">🔒</span>
        <p className="mt-3 font-medium text-lg text-surface-300">Profile Not Found</p>
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
      className="max-w-2xl mx-auto"
    >
      <div className="bg-surface-900/50 border border-surface-800 rounded-2xl p-6 md:p-8 text-center">
        {/* Avatar */}
        <div className="relative w-32 h-32 mx-auto mb-6 flex-shrink-0">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={`${profile.displayName}'s avatar`}
              className="w-full h-full rounded-full object-cover border-2 border-surface-700"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-surface-700 flex items-center justify-center text-5xl font-bold text-surface-400">
              {profile.displayName[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Display Name */}
        <h1 className="text-2xl font-bold text-white mb-2">{profile.displayName}</h1>

        {/* Bio */}
        {profile.bio && (
          <p className="text-surface-300 mb-6 max-w-md mx-auto leading-relaxed">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 border-t border-surface-800 pt-6">
          <div>
            <p className="text-2xl font-bold text-white">{profile.stats.assignmentsCompleted}</p>
            <p className="text-xs text-surface-500 mt-1">Assignments</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{profile.stats.totalExecutions}</p>
            <p className="text-xs text-surface-500 mt-1">Executions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {profile.stats.lastActiveAt
                ? new Date(profile.stats.lastActiveAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                : "—"}
            </p>
            <p className="text-xs text-surface-500 mt-1">Last Active</p>
          </div>
        </div>

        {/* Member since */}
        <p className="mt-6 text-sm text-surface-500">
          Member since {new Date(profile.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
        </p>
      </div>
    </motion.div>
  );
}

export function PublicProfilePage() {
  return (
    <div className="min-h-screen bg-surface-950 py-12 px-4">
      <PublicProfilePageContent />
    </div>
  );
}

export async function publicProfileLoader(_params: { params: { id: string } }) {
  return null;
}