import { motion } from "motion/react";
import {
	useGetMyProfileQuery,
	useUpdateMyProfileMutation,
} from "../../store/api";
import { ProfileForm } from "./ProfileForm";

function ProfilePageContent() {
	const {
		data: profileData,
		isLoading,
		error,
		refetch,
	} = useGetMyProfileQuery(undefined, {
		skip: false,
	});
	const [updateMyProfile] = useUpdateMyProfileMutation();

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
			<div className="py-12 text-center">
				<p className="text-red-400">
					Failed to load profile: {JSON.stringify(error)}
				</p>
			</div>
		);
	}

	if (!profileData?.profile) {
		return (
			<div className="py-12 text-center">
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
			className="mx-auto max-w-2xl"
		>
			<div className="rounded-2xl border border-surface-800 bg-surface-900/50 p-6 md:p-8">
				<h1 className="mb-6 font-bold text-2xl text-fg">Your Profile</h1>
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
		<div className="min-h-screen bg-surface-950 px-4 py-12">
			<ProfilePageContent />
		</div>
	);
}

export async function profileLoader() {
	return null;
}
