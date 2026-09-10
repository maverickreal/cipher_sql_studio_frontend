import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfilePage } from "./ProfilePage";

vi.mock("motion/react", () => ({
	motion: {
		div: ({ children, ...props }: { children?: unknown }) => (
			<div {...props}>{children as never}</div>
		),
	},
}));

vi.mock("./ProfileForm", () => ({
	ProfileForm: ({
		initialProfile,
	}: {
		initialProfile: { displayName: string };
	}) => <div>form:{initialProfile.displayName}</div>,
}));

vi.mock("../../store/api", () => ({
	useGetMyProfileQuery: vi.fn(),
	useUpdateMyProfileMutation: vi.fn(),
}));

import {
	useGetMyProfileQuery,
	useUpdateMyProfileMutation,
} from "../../store/api";

const defaultProfile = {
	profile: {
		userId: "u1",
		displayName: "Test User",
		bio: "Test bio",
		avatarUrl: null,
		preferences: {
			theme: "system" as const,
			emailNotifications: true,
			publicProfile: true,
		},
		stats: {
			assignmentsCompleted: 5,
			totalExecutions: 10,
			lastActiveAt: "2026-09-10T00:00:00.000Z",
		},
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-09-10T00:00:00.000Z",
	},
};

function renderPage({
	data = defaultProfile,
	isLoading = false,
	error = undefined as unknown,
}: {
	data?: typeof defaultProfile | { profile: null };
	isLoading?: boolean;
	error?: unknown;
} = {}) {
	vi.mocked(useGetMyProfileQuery).mockReturnValue({
		data: isLoading ? undefined : data,
		isLoading,
		error,
		refetch: vi.fn(),
	} as never);
	vi.mocked(useUpdateMyProfileMutation).mockReturnValue([
		vi.fn(),
		{ isLoading: false },
	] as never);

	return render(
		<MemoryRouter>
			<ProfilePage />
		</MemoryRouter>,
	);
}

describe("ProfilePage", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it("shows loading spinner while loading", () => {
		renderPage({ isLoading: true });
		expect(
			screen.getByRole("status", { name: "Loading profile" }),
		).toBeInTheDocument();
	});

	it("renders heading and form when profile loads", () => {
		renderPage();
		expect(screen.getByText("Your Profile")).toBeInTheDocument();
		expect(screen.getByText("form:Test User")).toBeInTheDocument();
	});

	it("shows error when the query fails", () => {
		renderPage({ error: { status: 500 } });
		expect(screen.getByText(/Failed to load profile/)).toBeInTheDocument();
	});

	it("shows not-found when profile is missing", () => {
		renderPage({ data: { profile: null } });
		expect(screen.getByText("Profile not found")).toBeInTheDocument();
	});
});
