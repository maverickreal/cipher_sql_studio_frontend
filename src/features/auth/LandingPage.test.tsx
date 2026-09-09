import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it } from "vitest";
import { LandingPage } from "./LandingPage";

describe("LandingPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders landing page with app name and description", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Master SQL with")).toBeTruthy();
    expect(screen.getByText("Interactive SQL Learning")).toBeTruthy();
    expect(screen.getByText("Browse Assignments")).toBeTruthy();
    expect(screen.getByText("Create Free Account")).toBeTruthy();
  });

  it("renders feature cards", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("Write SQL").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Execute Instantly").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Track Progress").length).toBeGreaterThan(0);
  });

  it("renders feature descriptions", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(
      screen.getAllByText(/built-in CodeMirror editor/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/real PostgreSQL databases/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Solve assignments at your own pace/).length,
    ).toBeGreaterThan(0);
  });
});
