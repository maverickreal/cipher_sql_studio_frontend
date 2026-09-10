import { motion } from "motion/react";
import { useGetMyProfileQuery, useUpdateMyProfileMutation } from "../../store/api";
import { ProfileForm } from "./ProfileForm";

function ProfilePageContent() {
  const { data: profileData, isLoading, error, refetch } = useGetMyProfileQuery(undefined, {
    skip: false,
  });
  const [updateMyProfile] = useUpdateMyProfileMutation();

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
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load profile: {JSON.stringify(error)}</p>
      </div>
    );
  }

  if (!profileData?.profile) {
    return (
      <div className="text-center py-12">
        <p className="text-surface-400">Profile not found</p>
      </div>
    );
  }

  const profile = profileData.profile;

  const handleSave = async (body: Parameters<typeof updateMyProfile>[0]) => {
    try {
      await updateMyProfile(body).unwrap();
      await refetch();
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-surface-900/50 border border-surface-800 rounded-2xl p-6 md:p-8">
        <h1 className="text-2xl font-bold text-white mb-6">Your Profile</h1>
        <ProfileForm
          initialProfile={profile}
          onSave={handleSave}
          isLoading={false}
        />
      </div>
    </motion.div>
  );
}

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-surface-950 py-12 px-4">
      <ProfilePageContent />
    </div>
  );
}

export async function profileLoader() {
  return null;
}