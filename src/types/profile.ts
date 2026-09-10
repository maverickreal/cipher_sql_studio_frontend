export interface UserProfile {
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  preferences: {
    theme: "system" | "light" | "dark";
    emailNotifications: boolean;
    publicProfile: boolean;
  };
  stats: {
    assignmentsCompleted: number;
    totalExecutions: number;
    lastActiveAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PublicProfile {
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  stats: {
    assignmentsCompleted: number;
    totalExecutions: number;
    lastActiveAt: string;
  };
  createdAt: string;
}

export interface ProfileUpdateBody {
  displayName?: string;
  bio?: string;
  avatarUrl?: string | null;
  preferences?: {
    theme?: "system" | "light" | "dark";
    emailNotifications?: boolean;
    publicProfile?: boolean;
  };
}