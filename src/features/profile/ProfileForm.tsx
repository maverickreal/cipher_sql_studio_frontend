import { type ChangeEvent, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { isThemeName } from "../../theme/palette";
import { useTheme } from "../../theme/ThemeProvider";
import type { ProfileUpdateBody, UserProfile } from "../../types/profile";

interface ProfileFormProps {
	initialProfile: UserProfile;
	onSave: (body: ProfileUpdateBody) => void;
	isLoading: boolean;
}

export function ProfileForm({
	initialProfile,
	onSave,
	isLoading,
}: ProfileFormProps) {
	const [formData, setFormData] = useState<ProfileUpdateBody>({
		displayName: initialProfile.displayName,
		bio: initialProfile.bio,
		avatarUrl: initialProfile.avatarUrl,
		preferences: {
			theme: initialProfile.preferences.theme,
			emailNotifications: initialProfile.preferences.emailNotifications,
			publicProfile: initialProfile.preferences.publicProfile,
		},
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [success, setSuccess] = useState(false);
	const { setTheme } = useTheme();

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target;
		if (name.startsWith("preferences.")) {
			const prefKey = name.split(".")[1] as keyof typeof formData.preferences;
			if (prefKey === "theme") {
				if (isThemeName(value)) {
					setTheme(value);
				} else if (value === "system") {
					const prefersDark = window.matchMedia(
						"(prefers-color-scheme: dark)",
					).matches;
					setTheme(prefersDark ? "dark" : "light");
				}
			}
			setFormData((prev) => ({
				...prev,
				preferences: {
					...prev.preferences,
					[prefKey]:
						type === "checkbox"
							? (e.target as HTMLInputElement).checked
							: value,
				},
			}));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setSuccess(false);

		if (formData.displayName && formData.displayName.length > 50) {
			setErrors({ displayName: "Display name must be 50 characters or less" });
			return;
		}
		if (formData.bio && formData.bio.length > 500) {
			setErrors({ bio: "Bio must be 500 characters or less" });
			return;
		}
		if (formData.avatarUrl && !formData.avatarUrl.startsWith("https://")) {
			setErrors({ avatarUrl: "Avatar URL must be a valid https URL" });
			return;
		}

		onSave(formData);
		setSuccess(true);
		setTimeout(() => setSuccess(false), 3000);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Avatar & Display Name */}
			<div className="flex items-center gap-4">
				<div className="relative h-20 w-20 flex-shrink-0">
					{formData.avatarUrl ? (
						<img
							src={formData.avatarUrl}
							alt={`${formData.displayName || initialProfile.displayName}'s avatar`}
							className="h-full w-full rounded-full border-2 border-surface-700 object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center rounded-full bg-surface-700 font-bold text-3xl text-surface-400">
							{formData.displayName?.[0]?.toUpperCase() ||
								initialProfile.displayName[0]?.toUpperCase()}
						</div>
					)}
				</div>
				<div className="flex-1">
					<Input
						label="Display Name"
						name="displayName"
						type="text"
						value={formData.displayName}
						onChange={handleChange}
						error={errors.displayName}
						maxLength={50}
						placeholder="Enter your display name"
					/>
				</div>
			</div>

			{/* Bio */}
			<div>
				<label
					htmlFor="bio"
					className="mb-1 block font-medium text-sm text-surface-300"
				>
					Bio
				</label>
				<Textarea
					id="bio"
					name="bio"
					value={formData.bio ?? ""}
					onChange={handleChange}
					error={errors.bio}
					maxLength={500}
					rows={4}
					placeholder="Tell us about yourself..."
				/>
				<p className="mt-1 text-surface-500 text-xs">
					{(formData.bio ?? "").length}/500
				</p>
			</div>

			{/* Avatar URL */}
			<div>
				<Input
					label="Avatar URL"
					name="avatarUrl"
					type="url"
					value={formData.avatarUrl ?? ""}
					onChange={handleChange}
					error={errors.avatarUrl}
					placeholder="https://example.com/avatar.png"
				/>
				<p className="mt-1 text-surface-500 text-xs">
					Must be a valid https:// URL
				</p>
			</div>

			{/* Preferences */}
			<fieldset className="space-y-4 border-surface-800 border-t pt-6">
				<legend className="font-medium text-fg text-lg">Preferences</legend>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div>
						<label
							htmlFor="preferences-theme"
							className="mb-1 block font-medium text-sm text-surface-300"
						>
							Theme
						</label>
						<select
							id="preferences-theme"
							name="preferences.theme"
							value={formData.preferences?.theme}
							onChange={handleChange}
							className="w-full rounded-lg border border-surface-700 bg-surface-800 px-3 py-2 text-fg focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
						>
							<option value="dark">Dark — Dracula</option>
							<option value="light">Light — Alucard</option>
							<option value="system">System</option>
						</select>
					</div>

					<div className="flex items-center">
						<input
							type="checkbox"
							name="preferences.emailNotifications"
							id="emailNotifications"
							checked={formData.preferences?.emailNotifications}
							onChange={handleChange}
							className="h-4 w-4 rounded border border-surface-700 bg-surface-800 text-brand-500 focus:ring-brand-500"
						/>
						<label
							htmlFor="emailNotifications"
							className="ml-2 text-sm text-surface-300"
						>
							Email notifications
						</label>
					</div>

					<div className="flex items-center">
						<input
							type="checkbox"
							name="preferences.publicProfile"
							id="publicProfile"
							checked={formData.preferences?.publicProfile}
							onChange={handleChange}
							className="h-4 w-4 rounded border border-surface-700 bg-surface-800 text-brand-500 focus:ring-brand-500"
						/>
						<label
							htmlFor="publicProfile"
							className="ml-2 text-sm text-surface-300"
						>
							Public profile
						</label>
					</div>
				</div>
			</fieldset>

			{/* Stats (read-only) */}
			<fieldset className="space-y-2 border-surface-800 border-t pt-6">
				<legend className="font-medium text-fg text-lg">Stats</legend>
				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<span className="text-surface-500">Assignments completed:</span>
						<span className="ml-2 font-medium text-fg">
							{initialProfile.stats.assignmentsCompleted}
						</span>
					</div>
					<div>
						<span className="text-surface-500">Total executions:</span>
						<span className="ml-2 font-medium text-fg">
							{initialProfile.stats.totalExecutions}
						</span>
					</div>
					<div className="col-span-2">
						<span className="text-surface-500">Last active:</span>
						<span className="ml-2 font-medium text-fg">
							{initialProfile.stats.lastActiveAt
								? new Date(
										initialProfile.stats.lastActiveAt,
									).toLocaleDateString()
								: "Never"}
						</span>
					</div>
				</div>
			</fieldset>

			{/* Action buttons */}
			<div className="flex items-center gap-3 border-surface-800 border-t pt-6">
				<Button type="submit" loading={isLoading} className="flex-1">
					Save Changes
				</Button>
				<Button
					type="button"
					variant="ghost"
					onClick={() =>
						setFormData({
							displayName: initialProfile.displayName,
							bio: initialProfile.bio,
							avatarUrl: initialProfile.avatarUrl,
							preferences: {
								theme: initialProfile.preferences.theme,
								emailNotifications:
									initialProfile.preferences.emailNotifications,
								publicProfile: initialProfile.preferences.publicProfile,
							},
						})
					}
					className="flex-1"
				>
					Cancel
				</Button>
			</div>

			{success && (
				<p className="text-center text-emerald-400 text-sm" role="status">
					Profile saved successfully!
				</p>
			)}
		</form>
	);
}
