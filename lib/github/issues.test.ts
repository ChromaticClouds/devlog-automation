import { beforeEach, describe, expect, it, vi } from "vitest";

import { GitHubClientError, requestGitHub } from "./client";
import { fetchRecentIssues } from "./issues";

vi.mock("./client", async (importOriginal) => {
  const original = await importOriginal<typeof import("./client")>();

  return {
    ...original,
    requestGitHub: vi.fn(),
  };
});

const repository = {
  owner: "ChromaticClouds",
  name: "devlog-automation",
};

const issueResponse = {
  number: 6,
  title: "feat(github): fetch recent repository issues",
  state: "open",
  user: { login: "ChromaticClouds" },
  labels: ["feature", { name: "github" }, { name: null }, "", { name: "  " }],
  created_at: "2026-06-06T08:20:00Z",
  updated_at: "2026-06-06T08:22:00Z",
  closed_at: null,
  html_url: "https://github.com/ChromaticClouds/devlog-automation/issues/6",
};

beforeEach(() => {
  vi.mocked(requestGitHub).mockReset();
});

describe("fetchRecentIssues", () => {
  it("normalizes issues and excludes pull requests", async () => {
    vi.mocked(requestGitHub).mockResolvedValue([
      issueResponse,
      {
        ...issueResponse,
        number: 5,
        title: "feat(github): fetch recent pull requests",
        pull_request: {
          url: "https://api.github.com/repos/ChromaticClouds/devlog-automation/pulls/5",
        },
      },
      {
        ...issueResponse,
        number: 1,
        title: "closed issue by a deleted user",
        state: "closed",
        user: null,
        labels: [],
        closed_at: "2026-06-06T08:25:00Z",
      },
    ]);

    await expect(fetchRecentIssues(repository, 5)).resolves.toEqual([
      {
        number: 6,
        title: "feat(github): fetch recent repository issues",
        state: "open",
        authorLogin: "ChromaticClouds",
        labels: ["feature", "github"],
        createdAt: "2026-06-06T08:20:00Z",
        updatedAt: "2026-06-06T08:22:00Z",
        closedAt: null,
        url: "https://github.com/ChromaticClouds/devlog-automation/issues/6",
      },
      {
        number: 1,
        title: "closed issue by a deleted user",
        state: "closed",
        authorLogin: null,
        labels: [],
        createdAt: "2026-06-06T08:20:00Z",
        updatedAt: "2026-06-06T08:22:00Z",
        closedAt: "2026-06-06T08:25:00Z",
        url: "https://github.com/ChromaticClouds/devlog-automation/issues/6",
      },
    ]);
  });

  it("returns an empty array for empty and pull-request-only responses", async () => {
    vi.mocked(requestGitHub).mockResolvedValue([]);
    await expect(fetchRecentIssues(repository)).resolves.toEqual([]);

    vi.mocked(requestGitHub).mockResolvedValue([
      { ...issueResponse, pull_request: {} },
    ]);
    await expect(fetchRecentIssues(repository)).resolves.toEqual([]);
  });

  it("requests all items ordered by most recently updated", async () => {
    vi.mocked(requestGitHub).mockResolvedValue([]);

    await fetchRecentIssues(repository, 25);

    expect(requestGitHub).toHaveBeenCalledWith(
      "repos/ChromaticClouds/devlog-automation/issues?state=all&sort=updated&direction=desc&per_page=25",
    );
  });

  it("uses the default API result limit", async () => {
    vi.mocked(requestGitHub).mockResolvedValue([]);

    await fetchRecentIssues(repository);

    expect(requestGitHub).toHaveBeenCalledWith(expect.stringContaining("per_page=10"));
  });

  it.each([0, 101, 1.5, Number.NaN])("rejects invalid limit %s", async (limit) => {
    await expect(fetchRecentIssues(repository, limit)).rejects.toBeInstanceOf(
      RangeError,
    );
    expect(requestGitHub).not.toHaveBeenCalled();
  });

  it.each([
    { issues: [] },
    [{ ...issueResponse, number: "6" }],
    [{ ...issueResponse, state: "merged" }],
    [{ ...issueResponse, user: { login: 123 } }],
    [{ ...issueResponse, labels: [{ color: "ffffff" }] }],
    [{ ...issueResponse, closed_at: 123 }],
  ])("rejects malformed provider response %#", async (response) => {
    vi.mocked(requestGitHub).mockResolvedValue(response);

    await expect(fetchRecentIssues(repository)).rejects.toMatchObject({
      name: "GitHubClientError",
      category: "provider_error",
      message: "GitHub request failed.",
    });
  });

  it("preserves errors from the shared GitHub client", async () => {
    const error = new GitHubClientError("not_found", 404);
    vi.mocked(requestGitHub).mockRejectedValue(error);

    await expect(fetchRecentIssues(repository)).rejects.toBe(error);
  });
});
