import {
  cleanup,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PublicProfilePage } from "./PublicProfilePage";

vi.mock("../../store/api", () => ({
  useGetPublicProfileQuery: vi.fn(),
}));

import { useGetPublicProfileQuery } from "../../store/api";

function renderPage(profileData: any = defaultProfile, isLoading = false, error = false) {
  vi.mocked(useGetPublicProfileQuery).mockReturnValue({
    data: isLoading ? undefined : profileData,
    isLoading,
    isError: error,
    error: error ? { status: 404 } : null,
  });

  return render(
    <MemoryRouter initialEntries={["/profile/u1"]}>
      <PublicProfilePage params={{ id: "u1" }} />
    </MemoryRouter>,
  );
}

const defaultProfile = {
  profile: {
    userId: "u1",
    displayName: "Test User",
    bio: "Test bio content",
    avatarUrl: "https://example.com/avatar.png",
    stats: {
      assignmentsCompleted: 5,
      totalExecutions: 10,
      lastActiveAt: "2026-09-10T00:00:00.000Z",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
  },
};

describe("PublicProfilePage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows loading spinner while loading", () => {
    renderPage(defaultProfile, true);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders profile data when loaded", async () => {
    renderPage();

    expect(await screen.findByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Test bio content")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // assignmentsCompleted
    expect(screen.getByText("10")).toBeInTheDocument(); // totalExecutions
  });

  it("shows avatar image when provided", () => {
    renderPage();

    const avatar = screen.getByAltText("Test User's avatar");
    expect(avatar).toHaveAttribute("src", "https://example.com/avatar.png");
  });

  it("shows initial when no avatar", () => {
    const noAvatarProfile = {
      profile: {
        ...defaultProfile.profile,
        avatarUrl: null,
      },
    };
    renderPage(noAvatarProfile);

    expect(screen.getByText("T")).toBeInTheDocument(); // initial from displayName
  });

  it("shows 'Profile Not Found' for 404 error", async () => {
    renderPage(defaultProfile, false, true);

    expect(await screen.findByText("Profile Not Found")).toBeInTheDocument();
    expect(screen.getByText("This profile doesn't exist or is private.")).toBeInTheDocument();
  });

  it("shows 'Profile Not Found' when profile data is null", async () => {
    vi.mocked(useGetPublicProfileQuery).mockReturnValue({
      data: { profile: null },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <MemoryRouter initialEntries={["/profile/u1"]}>
        <PublicProfilePage params={{ id: "u1" }} />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Profile Not Found")).toBeInTheDocument();
  });

  it("displays member since date", () => {
    renderPage();

    expect(screen.getByText(/Member since/)).toBeInTheDocument();
  });

  it("displays stats correctly", () => {
    renderPage();

    expect(screen.getByText("Assignments")).toBeInTheDocument();
    expect(screen.getByText("Executions")).toBeInTheDocument();
    expect(screen.getByText("Last Active")).toBeInTheDocument();
  });
});