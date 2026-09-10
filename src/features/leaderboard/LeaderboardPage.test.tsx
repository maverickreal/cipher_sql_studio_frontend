import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeaderboardPage } from "./LeaderboardPage";

vi.mock("../../store/api", () => ({
	useGetLeaderboardQuery: vi.fn(),
}));

import { useGetLeaderboardQuery } from "../../store/api";
const mockUseGetLeaderboardQuery = vi.mocked(useGetLeaderboardQuery);

describe("LeaderboardPage", () => {
	it("renders loading state when data is loading", () => {
		mockUseGetLeaderboardQuery.mockReturnValue({
			data: undefined,
			error: undefined,
			isLoading: true,
		} as never);
		render(<LeaderboardPage />);
		expect(screen.getByText("Loading leaderboard...")).toBeInTheDocument();
	});

	it("renders error state when there is an error", () => {
		mockUseGetLeaderboardQuery.mockReturnValue({
			data: undefined,
			error: { message: "Network error" },
			isLoading: false,
		} as never);
		render(<LeaderboardPage />);
		expect(screen.getByText("Failed to load leaderboard")).toBeInTheDocument();
	});

	it("renders empty state when no passes yet", () => {
		mockUseGetLeaderboardQuery.mockReturnValue({
			data: { entries: [], total: 0 },
			error: undefined,
			isLoading: false,
		} as never);
		render(<LeaderboardPage />);
		expect(
			screen.getByText("No passes yet. Be the first to solve an assignment!"),
		).toBeInTheDocument();
	});

	it("renders leaderboard entries when data exists", () => {
		mockUseGetLeaderboardQuery.mockReturnValue({
			data: {
				entries: [
					{
						userId: "user-1",
						displayName: "Alice",
						passes: 5,
						lastPassAt: "2026-09-10T00:00:00Z",
					},
				],
				total: 1,
				generatedAt: "2026-09-10T02:00:00Z",
			},
			error: undefined,
			isLoading: false,
		} as never);
		render(<LeaderboardPage />);
		expect(screen.getByText("Leaderboard")).toBeInTheDocument();
		expect(screen.getByText("Alice")).toBeInTheDocument();
		expect(screen.getByText("5")).toBeInTheDocument();
	});

	it("renders 'Load more' button when total > offset + entries.length", () => {
		mockUseGetLeaderboardQuery.mockReturnValue({
			data: {
				entries: [
					{
						userId: "user-1",
						displayName: "Alice",
						passes: 5,
						lastPassAt: "2026-09-10T00:00:00Z",
					},
				],
				total: 10,
				generatedAt: "2026-09-10T02:00:00Z",
			},
			error: undefined,
			isLoading: false,
		} as never);
		render(<LeaderboardPage />);
		expect(screen.getByText("Load more")).toBeInTheDocument();
	});
});