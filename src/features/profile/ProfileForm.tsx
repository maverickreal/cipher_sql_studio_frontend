import { type ChangeEvent, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import type { ProfileUpdateBody, UserProfile } from "../../types/profile";

interface ProfileFormProps {
  initialProfile: UserProfile;
  onSave: (body: ProfileUpdateBody) => void;
  isLoading: boolean;
}

export function ProfileForm({ initialProfile, onSave, isLoading }: ProfileFormProps) {
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name.startsWith("preferences.")) {
      const prefKey = name.split(".")[1] as keyof typeof formData.preferences;
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
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
        <div className="relative w-20 h-20 flex-shrink-0">
          {formData.avatarUrl ? (
            <img
              src={formData.avatarUrl}
              alt={`${formData.displayName || initialProfile.displayName}'s avatar`}
              className="w-full h-full rounded-full object-cover border-2 border-surface-700"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-surface-700 flex items-center justify-center text-3xl font-bold text-surface-400">
              {formData.displayName?.[0]?.toUpperCase() || initialProfile.displayName[0]?.toUpperCase()}
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
        <label htmlFor="bio" className="block text-sm font-medium text-surface-300 mb-1">Bio</label>
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
        <p className="mt-1 text-xs text-surface-500">{(formData.bio ?? "").length}/500</p>
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
        <p className="mt-1 text-xs text-surface-500">Must be a valid https:// URL</p>
      </div>

      {/* Preferences */}
      <fieldset className="space-y-4 border-t border-surface-800 pt-6">
        <legend className="text-lg font-medium text-white">Preferences</legend>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="preferences-theme" className="block text-sm font-medium text-surface-300 mb-1">Theme</label>
            <select
              id="preferences-theme"
              name="preferences.theme"
              value={formData.preferences?.theme}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="preferences.emailNotifications"
              id="emailNotifications"
              checked={formData.preferences?.emailNotifications}
              onChange={handleChange}
              className="h-4 w-4 rounded border-surface-700 text-brand-500 focus:ring-brand-500 bg-surface-800 border"
            />
            <label htmlFor="emailNotifications" className="ml-2 text-sm text-surface-300">
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
              className="h-4 w-4 rounded border-surface-700 text-brand-500 focus:ring-brand-500 bg-surface-800 border"
            />
            <label htmlFor="publicProfile" className="ml-2 text-sm text-surface-300">
              Public profile
            </label>
          </div>
        </div>
      </fieldset>

      {/* Stats (read-only) */}
      <fieldset className="space-y-2 border-t border-surface-800 pt-6">
        <legend className="text-lg font-medium text-white">Stats</legend>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-surface-500">Assignments completed:</span>
            <span className="ml-2 text-white font-medium">{initialProfile.stats.assignmentsCompleted}</span>
          </div>
          <div>
            <span className="text-surface-500">Total executions:</span>
            <span className="ml-2 text-white font-medium">{initialProfile.stats.totalExecutions}</span>
          </div>
          <div className="col-span-2">
            <span className="text-surface-500">Last active:</span>
            <span className="ml-2 text-white font-medium">
              {initialProfile.stats.lastActiveAt
                ? new Date(initialProfile.stats.lastActiveAt).toLocaleDateString()
                : "Never"}
            </span>
          </div>
        </div>
      </fieldset>

      {/* Action buttons */}
      <div className="flex items-center gap-3 border-t border-surface-800 pt-6">
        <Button type="submit" loading={isLoading} className="flex-1">
          Save Changes
        </Button>
        <Button type="button" variant="ghost" onClick={() => setFormData({
          displayName: initialProfile.displayName,
          bio: initialProfile.bio,
          avatarUrl: initialProfile.avatarUrl,
          preferences: {
            theme: initialProfile.preferences.theme,
            emailNotifications: initialProfile.preferences.emailNotifications,
            publicProfile: initialProfile.preferences.publicProfile,
          },
        })} className="flex-1">
          Cancel
        </Button>
      </div>

      {success && (
        <p className="text-green-400 text-sm text-center" role="status">
          Profile saved successfully!
        </p>
      )}
    </form>
  );
}