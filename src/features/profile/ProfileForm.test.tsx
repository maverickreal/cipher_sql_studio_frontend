import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileForm } from "./ProfileForm";

function renderForm(initialProfile: any = defaultProfile, onSave = vi.fn()) {
  return render(
    <MemoryRouter>
      <ProfileForm
        initialProfile={initialProfile}
        onSave={onSave}
        isLoading={false}
      />
    </MemoryRouter>,
  );
}

const defaultProfile = {
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
};

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders with initial profile data populated", () => {
    renderForm();

    expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test bio")).toBeInTheDocument();
    expect(screen.getByDisplayValue("System")).toBeInTheDocument();
  });

  it("calls onSave with form data on submit", async () => {
    const onSave = vi.fn();
    renderForm(defaultProfile, onSave);

    fireEvent.change(screen.getByLabelText("Display Name"), {
      target: { value: "New Name" },
    });
    fireEvent.change(screen.getByLabelText("Bio"), {
      target: { value: "New bio content" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Save Changes" }).closest("form")!);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: "New Name",
          bio: "New bio content",
        }),
      );
    });
  });

  it("shows validation error for display name too long", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("Display Name"), {
      target: { value: "a".repeat(51) },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Save Changes" }).closest("form")!);

    expect(screen.getByText("Display name must be 50 characters or less")).toBeInTheDocument();
  });

  it("shows validation error for bio too long", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("Bio"), {
      target: { value: "a".repeat(501) },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Save Changes" }).closest("form")!);

    expect(screen.getByText("Bio must be 500 characters or less")).toBeInTheDocument();
  });

  it("shows validation error for invalid avatar URL", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("Avatar URL"), {
      target: { value: "http://not-https.com" },
    });
    fireEvent.submit(screen.getByRole("button", { name: "Save Changes" }).closest("form")!);

    expect(screen.getByText("Avatar URL must be a valid https URL")).toBeInTheDocument();
  });

  it("resets form on cancel", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText("Display Name"), {
      target: { value: "Changed Name" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
  });

  it("shows success message after save", async () => {
    const onSave = vi.fn();
    renderForm(defaultProfile, onSave);

    fireEvent.submit(screen.getByRole("button", { name: "Save Changes" }).closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Profile saved successfully!")).toBeInTheDocument();
    });
  });

  it("renders stats section with correct values", () => {
    renderForm();

    expect(screen.getByText("5")).toBeInTheDocument(); // assignmentsCompleted
    expect(screen.getByText("10")).toBeInTheDocument(); // totalExecutions
  });
});